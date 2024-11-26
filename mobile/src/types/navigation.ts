import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Transfer } from './sync';

export type RootStackParamList = {
  Scanner: undefined;
  TransferConfirmation: {
    transfer: Transfer;
  };
  PropertyList: undefined;
};

export type NavigationProp<T extends keyof RootStackParamList> = StackNavigationProp<RootStackParamList, T>;
export type RoutePropType<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>; 