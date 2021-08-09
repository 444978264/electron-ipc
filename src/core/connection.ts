import { IDispose, IIpcEvent } from './base';
import { Emitter, EventEmitter } from './event';
import { filter } from './pipes';
import { ServiceManager } from './service';

export class Connection implements IDispose {
  private _disposed = false;
  private _ownServiceMap = new Map<string, Emitter>();

  constructor(
    private _clientId: number,
    private _dispose: (ctx: Connection) => void
  ) {}

  link(name: string, service: EventEmitter<IIpcEvent>) {
    if (!this._ownServiceMap.has(name)) {
      const listener = service
        .pipe(
          filter(d => {
            return d.sender.id === this._clientId;
          })
        )
        .listen(({ data: { rpc, params }, sender, channel }) => {
          ServiceManager.getService(channel)
            ?.call(rpc, params)
            .then(res => {
              sender.send(name, res);
            });
        });

      this._ownServiceMap.set(name, listener);
    }
    return this;
  }

  unlink(name: string) {
    if (this._ownServiceMap.has(name)) {
      this._ownServiceMap.get(name)!.dispose();
      this._ownServiceMap.delete(name);
    }

    return this;
  }

  dispose() {
    if (!this._disposed) {
      this._disposed = true;
      this._ownServiceMap.forEach(fn => {
        fn.dispose();
      });
      this._ownServiceMap.clear();
      this._dispose(this);
    }
  }
}
