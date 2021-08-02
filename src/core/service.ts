import { IService } from './base';

export class Service implements IService {
  constructor(private _name: string) {}
  call(event: string, params?: any) {
    return Promise.resolve();
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
