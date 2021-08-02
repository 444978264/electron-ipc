import { Emitter, EventEmitter } from './event';

export function map<T, R>(callback: (data: T) => R) {
  return snapshot<T, R>(emitter => {
    return function(d) {
      emitter.emit(callback(d));
    };
  });
}

export function filter<T>(callback: (data: T) => boolean) {
  return snapshot<T>(emitter => {
    return function(d) {
      callback(d) && emitter.emit(d);
    };
  });
}

export function snapshot<R, T = R>(callback: (d: Emitter<T>) => (d: R) => any) {
  return function(source: EventEmitter<R>) {
    const event = new EventEmitter<T>(emitter => {
      const listener = source.listen(callback(emitter));
      return () => {
        listener.dispose();
      };
    });
    return event;
  };
}
