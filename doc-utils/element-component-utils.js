const console = require('console');
const fs = require('fs-extra');
const path = require('path');

const assert = console.assert;
const consoleTable = console.table;

const ELE_COMPONENT_CONFIG_SRC_PATH = 'element-config';
const ELE_COMPONENT_CONFIG_DST_PATH = 'src/webview-h5/config';
const ELE_TMPLCONFIG_FILENAME = 'element-2.15.6.json';
const VERSION_FILE_NAME = 'versions.json';


const tmplFile = getFile('config', 'element-tmpl-2.15.6.json');
const srcVersionFile = getFile('config', 'versions-2.15.json');

function getFile(...filenames) {
  const args = [__dirname, '..'].concat(filenames)
  return path.resolve.apply(path, args);
}

// 将文件里面的group列表转成map结构，方便根据path直接匹配组件存不存在
function transformGroupListToMap(groupList) {
  return groupList.reduce((dataMap, nextGroup)=> {
    return nextGroup.list.reduce((dataMap, nextItem) => {
      dataMap[nextItem.path] = nextItem
      return dataMap
    },dataMap)
  },{})
}

// 将新的组件数据添加进组件列表的合适位置
function addComToTmplGroup(groupList, data, groupname) {
  const matchGroup = groupList.find(group => group.groupName === groupname)

  matchGroup.list.push(data)
}

function printChangeDatas(dels, adds) {
  const list = dels.map(data => {
    return {
      del: data.title
    }
  })
  adds.forEach((data,idx) => {
    if (!list[idx]) {
      list[idx] = {}
    }
    list[idx].add = data.title
  })
  consoleTable(list);
}

function getEntrys() {
  const files = fs.readdirSync(getFile(ELE_COMPONENT_CONFIG_SRC_PATH))
  return files
    .filter(name => name !== ELE_TMPLCONFIG_FILENAME)
}
function doTransform(srcJson, tmplJson, { lang, filename } = { lang: "zh-CN", filename: '' }) {
  lang = lang || "zh-CN"

  let tmplComs = tmplJson[lang][0].groups
  let srcComps = srcJson[lang][0].groups

  if (!tmplComs) {
    return srcJson
  }

  let srcComMap = transformGroupListToMap(srcComps)
  let tmplComMap = transformGroupListToMap(tmplComs)

  const willDel = []
  // 模版文件里的字段在源文件中存不存在,不存在，则去掉该组件路由
  tmplComs.forEach(group => {
    group.list = group.list.filter(com => {
      const matchItem = srcComMap[com.path]

      if (!matchItem) {
        willDel.push(com)
      }
      return !!matchItem
    })
  })

  const willAdd = []
  // 源文件里的字段在模版文件中存不存在,不存在，则往模板文件中添加该组件路由
  srcComps.forEach(group => {
    group.list.forEach(item => {
      if (tmplComMap[item.path]) {
        return
      }
      willAdd.push(item)
      addComToTmplGroup(tmplComs, item, group.groupName)
    })
  })
  console.log('文件 %s 分析完成', filename)
  if (willDel.length || willAdd.length) {
    printChangeDatas(willDel, willAdd);
  }
  return tmplJson
}

function transformFile(filename) {
  const srcFile = getFile(ELE_COMPONENT_CONFIG_SRC_PATH, filename);
  const dstFile = getFile(ELE_COMPONENT_CONFIG_DST_PATH, filename);

  let srcFileContent = fs.readFileSync(srcFile);
  let tmplFileContent = fs.readFileSync(tmplFile);

  assert(srcFileContent, '找不到源文件')
  assert(tmplFileContent, '找不到模版文件')

  srcFileContent = JSON.parse(srcFileContent)
  tmplFileContent = JSON.parse(tmplFileContent)

  const newTmplJson = doTransform(srcFileContent, tmplFileContent, { filename })
  
  fs.writeJsonSync(dstFile, newTmplJson, { spaces: '\t' })
  console.log('%s 修改成功,已生成文件 %s', filename, `${dstFile}`)
}

function main () {
  const dstDir = getFile(ELE_COMPONENT_CONFIG_DST_PATH)
  const fileNameList = getEntrys()
  if (!fileNameList.length) {
    console.log('%s 是空目录', ELE_COMPONENT_CONFIG_SRC_PATH)
    return
  }
  fs.emptyDirSync(dstDir)
  fileNameList.forEach(name => {
    transformFile(name)
  })

  // 把作为模版参照的该版本的文档也拷贝过去
  fs.copyFileSync(getFile(tmplFile), getFile(ELE_COMPONENT_CONFIG_DST_PATH, ELE_TMPLCONFIG_FILENAME))
  fs.copyFileSync(srcVersionFile, getFile(ELE_COMPONENT_CONFIG_DST_PATH, VERSION_FILE_NAME))
}

// transformFile('element-2.10.1.json')

main()

