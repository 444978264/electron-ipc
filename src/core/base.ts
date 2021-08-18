import { WebContents } from 'electron';

export interface IDispose {
  dispose(): void;
}

export type IDisposables = IDispose[];

export function NOOP() {}

export interface IService {
  call(rpc: string, params?: any): Promise<any>;
}

export interface IServer {
  registerService(name: string, service: IService): IServer;
}

export interface IServiceParams {
  rpc: string;
  params: any;
}

export interface IIpcEvent<T = any> {
  channel: string;
  sender: T;
  data: IServiceParams;
}
