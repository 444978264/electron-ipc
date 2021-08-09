import { ipcRenderer } from 'electron';
export class IPCClient {
  static readonly MESSAGE = 'ipc:message';
  static readonly DISCONNECT = 'ipc:disconnect';
  static readonly HELLO = 'ipc:hello';
  static readonly PING = 'ipc:ping';

  constructor() {
    ipcRenderer.send('ipc:hello', 'hello');
    ipcRenderer.on('ipc:message', function(...args) {
      console.log(args, 'ipc:message');
    });
  }
}
