const vscode = acquireVsCodeApi();
window.vsCodeWeb = {}
window.addEventListener("load", main);
let app = null
function main() {
  const howdyButton = document.getElementById("howdy");
  const refresh = document.querySelector('#refresh');
  howdyButton.addEventListener("click", handleHowdyClick);
  refresh.addEventListener("click", handleRefreshClick);
  window.addEventListener('message', handleVscodeMessage)

  Vue.use(ELEMENT);
  app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      form: {
        desc: ''
      },
      editData: '',
      eleList: []
    },
    methods: {
      onSubmit() {
        console.log(this.form)
      }
    },
  })
}

function handleHowdyClick() {
  vscode.postMessage({
    command: "hello",
    text: "Hey there partner! 🤠",
  });
}

function handleRefreshClick() {
  vscode.postMessage({
    command: "receiveEditorData"
  });
}

function handleVscodeMessage(event) {

  const message = event.data; // The JSON data our extension sent
  const payload = message.payload
  switch (message.command) {
      case 'editTxt':
          document.querySelector('#edit-content')
          break;
      case 'receiveEditorData':
        const eleList = window.vsCodeWeb.hasUseComponents(payload)
        app.eleList = eleList

  }
};