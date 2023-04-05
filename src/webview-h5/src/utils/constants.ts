const constants = {
  events: {
    receiveEditorData: 'RECEIVEEDITORDATA',
    changeEleVer: 'CHANGEELEVER',
    addCodeToEditor: 'ADDCODETOEDITOR',
    loaded: 'FINISHLOAD',
    showSelCom: 'SHOWSELCOM',
  },
  // defaultDocFiles: {
  //   js: ['docs.30dacf4.js'],
  //   css: ['docs.dff5397.css'],
  // },
};
type constants = typeof constants
type constantTypeKey = keyof constants

export type $constants = <T extends constantTypeKey>(ns: T, key?: keyof constants[T]) => any
export const $constants: $constants = (ns, key) => {
  if (key == null) {
    return constants[ns];
  }
  return constants[ns][key];
};

export default constants;
