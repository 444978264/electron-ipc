import { IService } from './base';

type IParams<T> = T extends (...args: infer P) => any ? P : any[];
export class Service<T extends Record<string, (...args: any[]) => Promise<any>>>
  implements IService {
  constructor(private _options: T) {}
  call<U extends keyof T>(event: U, ...params: IParams<U>) {
    return this._options[event](params);
  }
}

export class ServiceManager {
  static serviceMap = new Map<string, IService>();
  static registerService(name: string, service: IService) {
    if (!ServiceManager.serviceMap.has(name)) {
      ServiceManager.serviceMap.set(name, service);
    }
  }

  static getService(name: string) {
    return ServiceManager.serviceMap.get(name);
  }
}
