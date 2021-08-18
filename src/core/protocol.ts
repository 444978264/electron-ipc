import { IIpcEvent, IServiceParams } from './base';
import { EventEmitter } from './event';
import { filter } from './pipes';

type InferSender<T> = T extends { sender: infer U } ? U : any;

export class IPCProtocol<T extends { sender: any }> extends EventEmitter<
  IIpcEvent<InferSender<T>>
> {
  static readonly HELLO = 'ipc:hello';
  static readonly MESSAGE = 'ipc:message';
  static readonly CONNECTION = 'ipc:connecting';
  static readonly DISCONNECT = 'ipc:disconnect';
  private _onConnecting?: EventEmitter<IIpcEvent<InferSender<T>>>;
  constructor(private _sender: NodeJS.EventEmitter) {
    super(emitter => {
      const listen = (channel: string) => (e: T, data: IServiceParams) => {
        emitter.emit({
          channel,
          sender: e.sender,
          data,
        });
      };
      //   const onMessage = listen(IPCProtocol.MESSAGE);
      const onHello = listen(IPCProtocol.HELLO);
      this._sender.on(IPCProtocol.HELLO, onHello);
      //   this._sender.on(IPCProtocol.MESSAGE, onMessage);

      return () => {
        // this._sender.removeListener(IPCProtocol.MESSAGE, onMessage);
        this._sender.removeListener(IPCProtocol.HELLO, onHello);
      };
    });
  }

  get onConnecting() {
    if (!this._onConnecting) {
      this._onConnecting = this.pipe(
        filter(d => d.channel === IPCProtocol.HELLO)
      );
    }
    return this._onConnecting;
  }
}
