import { ipcMain } from 'electron';
import { IpcMainEvent } from 'electron/main';
import { IIpcEvent, IServer, IService, IServiceParams } from './core/base';
import { Connection } from './core/connection';
import { Disposable } from './core/disposable';
import { EventEmitter } from './core/event';
import { IPCProtocol } from './core/protocol';
import { ServiceManager } from './core/service';

function createScopeService(channel: string) {
  return new EventEmitter<IIpcEvent>(emitter => {
    const listen = (e: IpcMainEvent, data: IServiceParams) => {
      emitter.emit({
        channel,
        sender: e.sender,
        data,
      });
    };
    ipcMain.on(channel, listen);
    return () => {
      ipcMain.removeListener(channel, listen);
    };
  });
}

export class IPCServer extends Disposable implements IServer {
  private _connections = new Set<Connection>();
  private _protocol = new IPCProtocol<IpcMainEvent>(ipcMain);

  constructor() {
    super();
    this.add(
      this._protocol.onConnecting.listen(({ sender }) => {
        sender.send(IPCProtocol.HELLO);
        const connection = new Connection(sender.id, ctx => {
          sender.send(IPCProtocol.DISCONNECT);
          this._connections.delete(ctx);
        });
        this._connections.add(connection);
      })
    );

    this.add(() => {
      this._connections.clear();
    });
  }

  registerService(name: string, service: IService) {
    const scopeService = createScopeService(name);
    ServiceManager.registerService(name, service);

    this._connections.forEach(connection => {
      connection.link(name, scopeService);
    });

    return this;
  }
}
