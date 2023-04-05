import {
  window, commands, ViewColumn, Disposable,
  Event, Uri, CancellationToken, TextDocumentContentProvider,
  EventEmitter, workspace, CompletionItemProvider, ProviderResult,
  TextDocument, Position, CompletionItem, CompletionList, CompletionItemKind,
  SnippetString, Range, Webview
} from 'vscode';
import * as kebabCaseTAGS from 'element-helper-json-new/element-tags.json';
import * as kebabCaseATTRS from 'element-helper-json-new/element-attributes.json';
const prettyHTML = require('pretty');

let TAGS = {};
for (const key in kebabCaseTAGS) {
  if (kebabCaseTAGS.hasOwnProperty(key)) {
    const tag = kebabCaseTAGS[key];
    let subtags:Array<string>|undefined = tag.subtags;
    TAGS[key] = tag;

    let camelCase = toUpperCase(key);
    TAGS[camelCase] = JSON.parse(JSON.stringify(kebabCaseTAGS[key]));
    if(subtags) {
      subtags = subtags.map(item => toUpperCase(item));
      TAGS[camelCase].subtags = subtags;
    }
  }
}

let ATTRS = {};
for (const key in kebabCaseATTRS) {
  if (kebabCaseATTRS.hasOwnProperty(key)) {
    const element = kebabCaseATTRS[key];
    ATTRS[key] = element;
    const tagAttrs = key.split('/');
    const hasTag = tagAttrs.length > 1;
    let tag = '';
    let attr = '';
    if (hasTag) {
        tag = toUpperCase(tagAttrs[0]) + '/';
        attr = tagAttrs[1];
        ATTRS[tag + attr] = JSON.parse(JSON.stringify(element));
    }
  }
}

function toUpperCase(key: string): string {
    let camelCase = key.replace(/\-(\w)/g, function(all, letter) {
      return letter.toUpperCase();
    });
    camelCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    return camelCase;
}

export interface TagObject{
  text: string,
  offset: number
};

export default class ElementCompletionItemProvider implements CompletionItemProvider {
  private _document?: TextDocument;
  private _position?: Position;
  private tagReg: RegExp = /<([\w-]+)\s*/g;
  private attrReg: RegExp = /(?:\(|\s*)(\w+)=['"][^'"]*/;
  private tagStartReg:  RegExp = /<([\w-]*)$/;
  private pugTagStartReg: RegExp = /^\s*[\w-]*$/;
  private size?: number;
  private quotes?: string;

  getPreTag(): TagObject | undefined {
    if (!this._position?.line || !this._document) {
      return
    }
    let line = this._position.line;
    let tag: TagObject | string;
    let txt = this.getTextBeforePosition(this._position);
  
    while (this._position!.line - line < 10 && line >= 0) {
      if (line !== this._position.line) {
        txt = this._document.lineAt(line).text;
      }
      tag = this.matchTag(this.tagReg, txt, line);
      
      if (tag === 'break') return;
      if (tag) return <TagObject>tag;
      line--;
    }
    return;
  }

  getPreAttr(): string | undefined {
    if (!this._position?.line || !this._document) {
      return
    }
    let txt = this.getTextBeforePosition(this._position).replace(/"[^'"]*(\s*)[^'"]*$/, '');
    let end = this._position.character;
    let start = txt.lastIndexOf(' ', end) + 1;
    let parsedTxt = this._document.getText(new Range(this._position.line, start, this._position.line, end));

    return this.matchAttr(this.attrReg, parsedTxt);
  }

  matchAttr(reg: RegExp, txt: string): string {
    let match: RegExpExecArray | null = reg.exec(txt);

    return !/"[^"]*"/.test(txt) && match && match[1] || '';
  }

  matchTag(reg: RegExp, txt: string, line: number): TagObject | string {
    if (!this._position?.line || !this._document) {
      return ''
    }
    let match: RegExpExecArray | null;
    let arr: TagObject[] = [];
 
    if (/<\/?[-\w]+[^<>]*>[\s\w]*<?\s*[\w-]*$/.test(txt) || (this._position.line === line && (/^\s*[^<]+\s*>[^<\/>]*$/.test(txt) || /[^<>]*<$/.test(txt[txt.length - 1])))) {
      return 'break';
    }
    while((match = reg.exec(txt))) {
      arr.push({
        text: match[1],
        offset: this._document.offsetAt(new Position(line, match.index))
      });
    }
    return arr.pop() || '';
  }

  getTextBeforePosition(position: Position): string {
    if (!this._document) {
      return ''
    }
    var start = new Position(position.line, 0);
    var range = new Range(start, position);
    return this._document.getText(range);
  }
  getTagSuggestion() {
    let suggestions: any[] = [];

    let id = 100;
    for (let tag in TAGS) {
      suggestions.push(this.buildTagSuggestion(tag, TAGS[tag], id));
      id++;
    }
    return suggestions;
  }

  getAttrValueSuggestion(tag: string, attr: string): CompletionItem[] {
    let suggestions: { label: string, kind: CompletionItemKind }[] = [];
    const values = this.getAttrValues(tag, attr);
    values.forEach(value => {
      suggestions.push({
        label: value,
        kind: CompletionItemKind.Value
      });
    });
    return suggestions;
  }

  getAttrSuggestion(tag: string) {
    let suggestions: any[] = [];
    let tagAttrs = this.getTagAttrs(tag);
    let preText = this.getTextBeforePosition(this._position!);
    let prefix = preText.replace(/['"]([^'"]*)['"]$/, '').split(/\s|\(+/).pop() || '';
    // method attribute
    const method = prefix[0] === '@';
    // bind attribute
    const bind = prefix[0] === ':';

    prefix = prefix.replace(/[:@]/, '');

    if(/[^@:a-zA-z\s]/.test(prefix[0])) {
      return suggestions;
    }

    tagAttrs.forEach(attr => {
      const attrItem = this.getAttrItem(tag, attr);
      if (attrItem && (!prefix.trim() || this.firstCharsEqual(attr, prefix))) {
          const sug = this.buildAttrSuggestion({attr, tag, bind, method}, attrItem);
          sug && suggestions.push(sug);
      }
    });
    for (let attr in ATTRS) {
      const attrItem = this.getAttrItem(tag, attr);
      if (attrItem && attrItem.global && (!prefix.trim() || this.firstCharsEqual(attr, prefix))) {
        const sug = this.buildAttrSuggestion({attr, tag: null, bind, method}, attrItem);
        sug && suggestions.push(sug);
      }
    }
    return suggestions;
  }

  buildTagSuggestion(tag, tagVal, id) {
    const snippets = [];
    let index = 0;
    let that = this;
    function build(tag, {subtags, defaults}, snippets) {
      let attrs = '';
      defaults && defaults.forEach((item, i) => {
        attrs += ` ${item}=${that.quotes}$${index + i + 1}${that.quotes}`;
      });
      snippets.push(`${index > 0 ? '<':''}${tag}${attrs}>`);
      index++;
      subtags && subtags.forEach(item => build(item, TAGS[item], snippets));
      snippets.push(`</${tag}>`);
    };
    build(tag, tagVal, snippets);

    return {
      label: tag,
      sortText: `0${id}${tag}`,
      insertText: new SnippetString(prettyHTML('<' + snippets.join(''), {indent_size: this.size}).substr(1)),
      kind: CompletionItemKind.Snippet,
      detail: `element-ui ${tagVal.version ? `(version: ${tagVal.version})` : ''}`,
      documentation: tagVal.description
    };
  }

  buildAttrSuggestion({attr, tag, bind, method}, {description, type, version}) {
    if ((method && type === "method") || (bind && type !== "method") || (!method && !bind)) {
      return {
        label: attr,
        insertText: (type && (type === 'flag')) ? `${attr} ` : new SnippetString(`${attr}=${this.quotes}$1${this.quotes}$0`),
        kind: (type && (type === 'method')) ? CompletionItemKind.Method : CompletionItemKind.Property,
        detail:  tag ?  `<${tag}> ${version ? `(version: ${version})`: ''}` : `element-ui ${version ? `(version: ${version})`: ''}`,
        documentation: description
      };
    } else { return; }
  }

  getAttrValues(tag, attr) {
    let attrItem = this.getAttrItem(tag, attr);
    let options = attrItem && attrItem.options;
    if (!options && attrItem) {
      if (attrItem.type === 'boolean') {
        options = ['true', 'false'];
      } else if (attrItem.type === 'icon') {
        options = ATTRS['icons'];
      } else if (attrItem.type === 'shortcut-icon') {
        options = [];
        ATTRS['icons'].forEach(icon => {
          options.push(icon.replace(/^el-icon-/, ''));
        });
      }
    }
    return options || [];
  }

  getTagAttrs(tag: string) {
    return (TAGS[tag] && TAGS[tag].attributes) || [];
  }

  getAttrItem(tag: string | undefined, attr: string | undefined) {
    return ATTRS[`${tag}/${attr}`] || ( attr && ATTRS[attr] );
  }

  isAttrValueStart(tag: Object | string | undefined, attr) {
    return tag && attr;
  }

  isAttrStart(tag: TagObject | undefined) {
    return tag;
  }

  isTagStart() {
    let txt = this.getTextBeforePosition(this._position!);
    return this.isPug() ? this.pugTagStartReg.test(txt) : this.tagStartReg.test(txt);
  }

  firstCharsEqual(str1: string, str2: string) {
    if (str2 && str1) {
      return str1[0].toLowerCase() === str2[0].toLowerCase();
    }
    return false;
  }
  // tentative plan for vue file
  notInTemplate(): boolean {
    let line = this._position!.line;
    while(line) {
      if (/^\s*<script.*>\s*$/.test(<string>this._document!.lineAt(line).text)) {
        return true;
      }
      line--;
    }
    return false;
  }

  provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<CompletionItem[] | CompletionList> {
    this._document = document;
    this._position = position;

    const config = workspace.getConfiguration('element-helper');
    this.size = config.get('indent-size');
    const normalQuotes = config.get('quotes') === 'double' ? '"': "'";
    const pugQuotes = config.get('pug-quotes') === 'double' ? '"': "'";
    this.quotes = this.isPug() ? pugQuotes : normalQuotes;

    let tag: TagObject | string | undefined = this.isPug() ?  this.getPugTag() : this.getPreTag();
    let attr = this.getPreAttr();
    if (tag && attr && this.isAttrValueStart(tag, attr)) {
      return this.getAttrValueSuggestion(tag.text, attr);
    } else if(tag && this.isAttrStart(tag)) {
      return this.getAttrSuggestion(tag.text);
    } else if (this.isTagStart()) {
      switch(document.languageId) {
        case 'jade':
        case 'pug':
          return this.getPugTagSuggestion();
        case 'vue':
          if (this.isPug()) {
            return this.getPugTagSuggestion();
          }
          return this.notInTemplate() ? [] : this.getTagSuggestion();
        case 'html':
          // todo
          return this.getTagSuggestion();
      }
    } else {return [];}
  }

  isPug(): boolean {
    if (!this._document || !this._position) {
      return false
    }
    if (['pug', 'jade'].includes(this._document.languageId)) {
      return true;
    } else {
      var range = new Range(new Position(0, 0), this._position);
      let txt = this._document.getText(range);
      return /<template[^>]*\s+lang=['"](jade|pug)['"].*/.test(txt);
    }
  }

  getPugTagSuggestion() {
    let suggestions: any[] = [];
    
    for (let tag in TAGS) {
      suggestions.push(this.buildPugTagSuggestion(tag, TAGS[tag]));
    }
    return suggestions;
  }

  buildPugTagSuggestion(tag, tagVal) {
    const snippets: string[] = [];
    let index = 0;
    let that: any = this;
    function build(tag, {subtags, defaults}, snippets) {
      let attrs: string[] = [];
      defaults && defaults.forEach((item, i) => {
        attrs.push(`${item}=${that.quotes}$${index + i + 1}${that.quotes}`);
      });
      snippets.push(`${' '.repeat(index * that.size)}${tag}(${attrs.join(' ')})`);
      index++;
      subtags && subtags.forEach(item => build(item, TAGS[item], snippets));
    };
    build(tag, tagVal, snippets);
    return {
      label: tag,
      insertText: new SnippetString(snippets.join('\n')),
      kind: CompletionItemKind.Snippet,
      detail: 'element-ui',
      documentation: tagVal.description
    };
  }

  getPugTag(): TagObject | undefined {
    if (!this._document || !this._position) {
      return
    }
    let line = this._position.line;
    let tag: TagObject | string;
    let txt = '';
  
    while (this._position.line - line < 10 && line >=0) {
      txt = this._document.lineAt(line).text;
      let match = /^\s*([\w-]+)[.#-\w]*\(/.exec(txt);
      if (match) {
        return {
          text: match[1],
          offset: this._document.offsetAt(new Position(line, match.index))
        };
      }
      line--;
    }
    return;
  }
}
