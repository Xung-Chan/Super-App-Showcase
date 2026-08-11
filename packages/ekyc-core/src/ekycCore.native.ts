import { VerifyCccdInput, VerifyCccdResult } from "./types/ekyc-type";
import EkycCore from "./NativeEkycCore";

export function startEkyc(): Promise<VerifyCccdResult> {
  return EkycCore.startEkyc();
}

export function getResult(): Promise<string> {
  return EkycCore.getResult();
}
