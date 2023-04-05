// import { vscodeEvent } from 'types';
import Vue from 'vue';

const vscode = acquireVsCodeApi();

const eventBus = new Vue();

function postMessage(command: string, payload?: any) {
  vscode.postMessage({
    command,
    payload,
  });
}

function handleVscodeMessage(event: vscodeEvent) {
  const message = event.data; // The JSON data our extension sent
  const { command, payload } = message;
  eventBus.$emit(command, payload);
}

window.addEventListener('message', handleVscodeMessage);

export {
  eventBus,
  postMessage,
};
