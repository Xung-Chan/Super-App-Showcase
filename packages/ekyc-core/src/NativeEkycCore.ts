import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  startEkyc(): Promise<string>;
  getResult(): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('EkycCore');
