import { NativeModules } from 'react-native';
import type { SawtoothBridge } from '../../core/types/sawtooth';

const { SawtoothModule } = NativeModules;

if (!SawtoothModule) {
    throw new Error('Sawtooth native module is not available on Android');
}

export default SawtoothModule as SawtoothBridge; 