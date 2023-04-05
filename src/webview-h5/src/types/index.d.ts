interface vscodeEventData {
  payload?: any,
  command: string
}

interface vscodeEvent {
  data: vscodeEventData
}

declare global {
  interface Window {
    acquireVsCodeApi: () => any;
    VueRouter: any;
    _globalVsData: {
      _ELE_DOC_VER_: string
    }
  }
}

declare const acquireVsCodeApi = () => any;

declare let VueRouter:any;

declare let _globalVsData: { 
  _ELE_DOC_VER_: string,
  _ElementKeys: Record<string,boolean>
};
