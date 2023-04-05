import Settings from './settings';
const path = require('path');
const fs = require('fs-extra');

export default class DocSets {
  private settings: Settings
  private extensionPath: string
  private menus: Record<string,string>[] = []
  constructor(extensionPath) {
    this.settings = new Settings;
    this.extensionPath = extensionPath
    this.refreshMenus()
  }

  refreshMenus() {
    const ver = this.settings.getVersion();

		let elementDocJson = fs.readFileSync(path.resolve(this.extensionPath, 'assets', 'config', `element-${ver}.json`))
		elementDocJson = JSON.parse(elementDocJson)

		const componentList: Record<string,string>[] = [];
    elementDocJson['zh-CN'][0].groups.forEach(group => {
      group.list.forEach(item => {
				componentList.push({
					label: item.main || `el-${item.path.replace('/', '')}`,
					detail: item.relative ? `${item.relative.join(' ')} (${item.title})` : item.title,
					path: item.path,
					description: group.groupName
				})
			})
		})

    this.menus = componentList
  }

  getMenus() {
    return this.menus
  }
}