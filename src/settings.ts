import * as vscode from 'vscode';

type AllSettingNames = {
  docVersion: string
}
export default class Setting {
  private namespace = 'doc-enhance-helper'
  static allSettingNames: AllSettingNames = { docVersion: ''}

  constructor (namespace?: string){
    this.namespace = namespace || this.namespace
    Setting.allSettingNames = {
      docVersion: `${this.namespace}.view.version`
    }
  }

  getVersion (): string {
    return vscode.workspace.getConfiguration().get(Setting.allSettingNames.docVersion) || ''
  }

  async setVersion (value) {
    const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global
    await vscode.workspace.getConfiguration().update(Setting.allSettingNames.docVersion, value, target);
  }
}