const fs = require('fs-extra');
const path = require('path');

const versionList = require('../../assets/config/versions.json');

const ELEMENT_DOC_SRC_PATH = 'element-gh-pages';

// const ELEMENT_DOC_DEST_PATH = 'src/webview-h5/basedist';
const ELEMENT_DOC_DEST_PATH = 'doc-dist';

let extension_Path = __dirname;

function getFile(...filepaths): string {
  const args = [extension_Path].concat(filepaths)
  return path.resolve.apply(path, args);
}

/**
 * 1. 清空存放element文档的目录：src/webview-h5/basedist
 * 2. 获取当前需要显示的版本号对应的目录：newDocPath
 * 3. 将newDocPath的内容复制到 ‘src/webview-h5/basedist’
 * 返回 element-ui开头的js和css文件、docs开头的js和css文件
 */
function changeDocVer(extensionPath, version: string) {
  const docFolderName = versionList[version] || version

  if (!docFolderName) {
    return null
  }

  extension_Path = extensionPath
  const srcDir = getFile(ELEMENT_DOC_SRC_PATH, docFolderName)
  const destDir = getFile(ELEMENT_DOC_DEST_PATH)

  try {
    fs.accessSync(srcDir, fs.constants.F_OK)
  } catch (e){
    return null
  }

  fs.emptyDirSync(destDir)
  fs.copySync(srcDir, destDir)

  const destFileList: string[] = fs.readdirSync(destDir)

  const jsFiles: string[] = []
  const cssFiles: string[] = []
  const filePrefix = ['element-ui.', 'docs.']
  filePrefix.forEach(prefix => {
    destFileList.forEach(name => {
      if(name.startsWith(prefix)) {
        if (name.endsWith('.js')) {
          jsFiles.push(name)
        } else if (name.endsWith('.css')) {
          cssFiles.push(name)
        }
      }
    })
  })
  return { js: jsFiles, css: cssFiles }

}

export {
  changeDocVer
}