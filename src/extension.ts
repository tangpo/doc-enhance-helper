// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { HelloWorldPanel } from "./HelloWorldPanel";
// import { pwd, ls } from 'shelljs';
// const download = require('download-git-repo');
const path = require('path');
// const gitClone = require('git-clone/promise');
import ElementCompletionItemProvider from './elmentCompletionItemProvider'
import Docsets from './docsets'

const fs = require('fs-extra');
const WORD_REG: RegExp = /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/gi;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "doc-enhance-helper" is now active!');
	const docSets = new Docsets(context.extensionPath)

	HelloWorldPanel.extensionPath = context.extensionPath
	HelloWorldPanel.docSets = docSets
	let completionItemProvider = new ElementCompletionItemProvider();
	let completion = vscode.languages.registerCompletionItemProvider([{
		language: 'pug', scheme: 'file'
	}, {
			language: 'jade', scheme: 'file'
	}, {
			language: 'vue', scheme: 'file'
	}, {
		language: 'html', scheme: 'file'
	}], completionItemProvider, '', ' ', ':', '<', '"', "'", '/', '@', '(');

	let vueLanguageConfig = vscode.languages.setLanguageConfiguration('vue', {wordPattern: WORD_REG});
	let pugLanguageConfig = vscode.languages.setLanguageConfiguration('pug', {wordPattern: WORD_REG});
	let jadeLanguageConfig = vscode.languages.setLanguageConfiguration('jade', {wordPattern: WORD_REG});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	/* let disposable = vscode.commands.registerCommand('vuecomponents.helloWorld1',async () => {
		// The code you place here will be executed every time your command is executed

		// vscode.commands.executeCommand('editor.action.addCommentLine');
		const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return;
    }
		const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeDefinitionProvider',
			activeEditor.document.uri,
			activeEditor.selection.active
		);

		if (definitions) {
			for (const definition of definitions) {
					console.log(definition);
			}
		}

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vue-components 22!');
	}); */

	// context.subscriptions.push(disposable);

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('doc-enhance-helper.showDocEnhanceHelper', (textEditor, edit) => {
		HelloWorldPanel.render(context.extensionUri, { textEditor, edit });
	}));

	context.subscriptions.push(vscode.commands.registerCommand('doc-enhance-helper.searchAndOpenDoc', (textEditor, edit) => {
		const componentList = docSets.getMenus() as any[]
        
		vscode.window.showQuickPick(componentList, {matchOnDetail:true}).then(selected => {
			HelloWorldPanel.render(context.extensionUri, { selected });
	})
	}));

	// const helloCommand = vscode.commands.registerCommand("vuecomponents.openwebview", () => {
	// 	download('github.com:ElemeFE/element#gh-pages', path.resolve(context.extensionPath, 'element-gh-pages'), { clone: true }, function (err) {
	// 		console.log(err ? 'Error' : 'Success', err)
	// 	})
  // });

  context.subscriptions.push(completion, vueLanguageConfig, pugLanguageConfig, jadeLanguageConfig);
}

// this method is called when your extension is deactivated
export function deactivate() {}
