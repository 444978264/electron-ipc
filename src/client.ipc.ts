import { ipcRenderer, IpcRendererEvent } from 'electron';
import {
  IClient,
  IIpcEvent,
  IServer,
  IService,
  IServiceParams,
} from './core/base';
import { Disposable } from './core/disposable';
import { EventEmitter } from './core/event';
import { IPCProtocol } from './core/protocol';

function createScopeService(channel: string) {
  return new EventEmitter<IIpcEvent>(emitter => {
    const listen = (e: IpcRendererEvent, data: IServiceParams) => {
      emitter.emit({
        channel,
        sender: e.sender,
        data,
      });
    };
    ipcRenderer.on(channel, listen);
    return () => {
      ipcRenderer.removeListener(channel, listen);
    };
  });
}
export class IPCClient extends Disposable implements IClient {
  private _protocol = new IPCProtocol<IpcRendererEvent>(ipcRenderer);

  constructor() {
    super();
    ipcRenderer.send(IPCProtocol.HELLO);
    this.add(this._protocol.onConnecting.listen(({ sender }) => {}));
  }

  getService(name: string) {
    const scopeService = createScopeService(name);
    // ServiceManager.registerService(name, service);

    // this._connections.forEach(connection => {
    //   connection.link(name, scopeService);
    // });

    // return this;
  }
}
