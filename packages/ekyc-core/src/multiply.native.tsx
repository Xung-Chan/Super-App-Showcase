import EkycCore from './NativeEkycCore';

export function startEkyc(): Promise<string> {
  return EkycCore.startEkyc();
}

export function getResult(): Promise<string> {
  return EkycCore.getResult();
}
