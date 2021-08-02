import { Disposable } from './disposable';

export interface ICallback<T = any> {
  (d: T): void;
}

export class Emitter<T = any> extends Disposable {
  isClosed = false;

  constructor(private _resolve?: ICallback<T>, private _reject?: ICallback) {
    super();
    super.add(() => {
      this.isClosed = true;
    });
  }

  emit(data: T) {
    if (!this.isClosed) {
      this._resolve?.(data);
    }
  }

  error(error: any) {
    if (!this.isClosed) {
      this._reject?.(error);
    }
  }

  done() {
    this.dispose();
  }
}

interface IEvent<T> {
  (emitter: Emitter<T>): undefined | (() => void);
}

export class EventEmitter<T = any> {
  constructor(private _event?: IEvent<T>) {}

  pipe<U>(fn: (source: EventEmitter<T>) => EventEmitter<U>): EventEmitter<U> {
    return fn(this);
  }

  listen(success?: ICallback<T>, error?: ICallback): Emitter<T> {
    const emitter = new Emitter<T>(success, error);

    if (this._event) {
      emitter.add(this._event(emitter) ?? undefined);
    }

    return emitter;
  }
}
