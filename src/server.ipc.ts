import { ipcMain } from 'electron';
import { IpcMainEvent } from 'electron/main';
import { IIpcEvent, IServer, IService, IServiceParams } from './core/base';
import { Connection } from './core/connection';
import { Disposable } from './core/disposable';
import { EventEmitter } from './core/event';
import { filter } from './core/pipes';
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
  static readonly MESSAGE = 'ipc:message';
  static readonly DISCONNECT = 'ipc:disconnect';
  static readonly HELLO = 'ipc:hello';
  static readonly PING = 'ipc:ping';

  private _connections = new Set<Connection>();
  private _event = new EventEmitter<IIpcEvent>(emitter => {
    const listen = (channel: string) => (
      e: IpcMainEvent,
      data: IServiceParams
    ) => {
      emitter.emit({
        channel,
        sender: e.sender,
        data,
      });
    };
    const onMessage = listen(IPCServer.MESSAGE);
    ipcMain.on(IPCServer.MESSAGE, onMessage);
    const onHello = listen(IPCServer.HELLO);
    ipcMain.on(IPCServer.HELLO, onHello);
    return () => {
      ipcMain.removeListener(IPCServer.MESSAGE, onMessage);
      ipcMain.removeListener(IPCServer.HELLO, onHello);
    };
  });

  constructor() {
    super();

    const onHello = this._event.pipe(
      filter(d => {
        return d.channel === IPCServer.HELLO;
      })
    );

    this.add(
      onHello.listen(({ sender }) => {
        sender.send(IPCServer.HELLO);
        const connection = new Connection(sender.id, ctx => {
          sender.send(IPCServer.DISCONNECT);
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
