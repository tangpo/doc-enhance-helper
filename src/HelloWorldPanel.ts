import * as vscode from "vscode";
import { getUri } from "./utilities/getUri";
import Constants from './webview-h5/src/utils/constants'
import { changeDocVer } from './utilities/changeDocVer'
import Settings from './settings'
import AddSnippets, { ElementKeys } from './utilities/addSnippets'
import DocSets from './docsets'

type globalData = {
  _ELE_DOC_VER_: string
  _ElementKeys?: Record<string,boolean>
}

type files = {
  js: string[];
  css: string[];
}

type pageOptions = {
  globalData: globalData;
  files: files | null;
}

type HelloWorldPanelParams = { textEditor?: vscode.TextEditor, edit?: vscode.TextEditorEdit, selected?: Record<string,string> }

export class HelloWorldPanel {
  public static currentPanel: HelloWorldPanel | undefined;
  public static docSets: DocSets;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _editor: { textEditor?: vscode.TextEditor, edit?: vscode.TextEditorEdit };
  public static extensionPath: string = ''
  private settings: Settings
  private currentDocVer = ''
  private loaded = false
  private loadedCallback: any[] = []
  
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, data: HelloWorldPanelParams) {
    this.settings = new Settings
    this.currentDocVer = this.settings.getVersion()
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, this, this._disposables);

    const files: files|null = this.copyDocAndGetFilesByVer(this.currentDocVer)
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri,
      { files, globalData: { _ELE_DOC_VER_: this.currentDocVer } }
    );
    this._setWebviewMessageListener(this._panel.webview, extensionUri);
    this._editor = data
    if (data.selected) {
      this.loadedCallback.push(() => {
        this.showSelectedDoc(data.selected)
      })
    }
  }

  public static render(extensionUri: vscode.Uri, data: HelloWorldPanelParams) {
    
    if (HelloWorldPanel.currentPanel) {
      // HelloWorldPanel.currentPanel._panel.reveal(vscode.ViewColumn.Two);
      if (data.selected) {
        HelloWorldPanel.currentPanel.showSelectedDoc(data.selected)
      }
      return;
    } else {
      const panel = vscode.window.createWebviewPanel("doc-enhance-web", "doc enhance helper", vscode.ViewColumn.Two, {
        enableScripts: true
      });

      HelloWorldPanel.currentPanel = new HelloWorldPanel(panel, extensionUri, data);
    }
  }

  showSelectedDoc(selected) {
    this._panel.webview.postMessage({
      command: Constants.events.showSelCom,
      payload: selected
    })
  }

  public dispose() {
    HelloWorldPanel.currentPanel = undefined;

    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public copyDocAndGetFilesByVer (ver) {
    const files: files|null = changeDocVer(HelloWorldPanel.extensionPath, ver);
    if (!files) {
      vscode.window.showInformationMessage(`版本 ${ver} 切换失败`);
      return null;
    }
    return files;
  }

  getFirstVisibleEditor () {
    return vscode.window.visibleTextEditors[0]
  }

  getEditorText () {
    const editors = vscode.window.visibleTextEditors

    if (!editors || !editors.length) {
      return ''
    }

    return editors.map(editor => editor.document.getText()).join('\n')
  }

  private _setWebviewMessageListener(webview: vscode.Webview, extensionUri: vscode.Uri) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const payload = message.payload;
        
        switch (command) {
          case Constants.events.receiveEditorData:
            const editTxt = this.getEditorText() // this._editor.textEditor?.document.getText()
            webview.postMessage({
              command: Constants.events.receiveEditorData,
              payload: editTxt
            });
            break;
          case Constants.events.changeEleVer:
            const files: files|null = this.copyDocAndGetFilesByVer(payload.value)
            if (!files) {
              return;
            }
            this.settings.setVersion(payload.label)
            HelloWorldPanel.docSets.refreshMenus()
            webview.html = this._getWebviewContent(webview, extensionUri, {
              globalData: { _ELE_DOC_VER_: payload.label },
              files
            });
            break;
          case Constants.events.addCodeToEditor:
            this.getFirstVisibleEditor().insertSnippet(AddSnippets(payload.comName));
            break;
          case Constants.events.loaded:
            this.loaded = true;
            let fn;
            while(fn=this.loadedCallback.shift()) {
              fn()
            }
            break;
        }
      },
      undefined,
      this._disposables
    );
  }
  // "2.10.1":"2.10",
  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, options?: pageOptions) {
    // const toolkitUri = getUri(webview, extensionUri, [
    //   "node_modules",
    //   "@vscode",
    //   "webview-ui-toolkit",
    //   "dist",
    //   "toolkit.js",
    // ]);

    /* const runtimeVue = getUri(webview, extensionUri, [
      "node_modules",
      "vue",
      "dist",
      "vue.runtime.min.js",
    ]);

    const vueRouter = getUri(webview, extensionUri, [
      "node_modules",
      "vue-router",
      "dist",
      "vue-router.min.js",
    ]);
    <script type="text/javascript" src="${runtimeVue}"></script>
    <script type="text/javascript" src="${vueRouter}"></script> */

    const toolkitUri = getUri(webview, extensionUri, [
      'assets',
      'toolkit.js'
    ]);
    
    const vendorsJs = getUri(webview, extensionUri, [
      'assets',
      'vendors.js'
    ]);

    // const highlightjs = getUri(webview, extensionUri, [
    //   "src",
    //   "webview-h5",
    //   "lib",
    //   "highlight",
    //   "highlight.min.js",
    // ]);
    // <script type="text/javascript" src="${highlightjs}"></script>

    
    const highlightCss = getUri(webview, extensionUri, [
      'assets',
      'color-brewer.min.css'
    ]);

    // const webviewH5VendorJs = getUri(webview, extensionUri, ["src","webview-h5","dist","js", "chunk-vendors.js"]);
    // const webviewH5AppJs = getUri(webview, extensionUri, ["src","webview-h5","dist","js", "app.js"]);
    // <script type="text/javascript" src="${webviewH5VendorJs}"></script>
    // <script type="text/javascript" src="${webviewH5AppJs}"></script>
    
    let webviewH5Js: string = '';
    let webviewH5Css: string = '';

    if (process.env.NODE_ENV !== 'development') {
      const webviewH5JsUrl = getUri(webview, extensionUri, ["dist","appH5.js"]);
      const webviewH5CssUrl = getUri(webview, extensionUri, ["dist", "css", "appH5.css"]);

      webviewH5Js = `<script type="text/javascript" src="${webviewH5JsUrl}"></script>`;
      webviewH5Css = `<link href="${webviewH5CssUrl}" rel="stylesheet">`;
    } else {
      const webviewH5VendorJs = getUri(webview, extensionUri, ["src","webview-h5","dist","js", "chunk-vendors.js"]);
      const webviewH5AppJs = getUri(webview, extensionUri, ["src","webview-h5","dist","js", "app.js"]);
      webviewH5Js = `
        <script type="text/javascript" src="${webviewH5VendorJs}"></script>
        <script type="text/javascript" src="${webviewH5AppJs}"></script>
      `
    }
    // const resourceRoot = getUri(webview, extensionUri,["src","webview-h5","basedist"])
    //       .toString() + '/';

    const resourceRoot = getUri(webview, extensionUri,["doc-dist"])
          .toString() + '/';

    const globalData = options && options.globalData || { _ELE_DOC_VER_: this.settings.getVersion(), _ElementKeys: {}}
    const files = options && options.files

    globalData._ElementKeys = ElementKeys
    let eleDocjs = files?.js.reduce((pre, next) => {
        return pre + `<script type="text/javascript" src="${next}"></script>\n`
      }, '');

    const eleCssLinks = files?.css.reduce((pre, next) => {
        return pre + `<link href="${next}" rel="stylesheet">\n`
      }, '');

    // <link rel="stylesheet" href="font_137970_p1tpzmomxp9cnmi.css">

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <base href="${resourceRoot}">
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${highlightCss}" rel="stylesheet">
          ${webviewH5Css}
          ${eleCssLinks}
          <style>
            #app {
              display: none;
            }
          </style>
          <script>
            window.ga = function(){}
            window._globalVsData=${JSON.stringify(globalData)}
            var originImage = Image
            var Image = function () {};
            Object.defineProperty(Image, 'src', {
              set(val){ console.log('禁止请求: %s',val);}
            })
          </script>
          <script type="module" src="${toolkitUri}"></script>
          <script type="text/javascript" src="${vendorsJs}"></script>
          <title>doc enhance helper</title>
        </head>
        <body>
          <div id="webApp"></div>
          <div id="app"></div>
          ${webviewH5Js}
          ${eleDocjs}
          <script>
            if (Vue) {
              Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 };
            }
          </script>
        </body>
      </html>
    `;
  }
}