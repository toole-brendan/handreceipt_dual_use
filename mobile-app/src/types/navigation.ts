import { Asset } from './types';
import { StackNavigationProp, RouteProp } from '@react-navigation/stack';

export type RootStackParamList = {
  AssetList: undefined;
  Scanner: undefined;
  TransferConfirmation: {
    assetData: Asset;
  };
  AssetDetails: {
    asset: Asset;
  };
};

// Navigation prop types
export type NavigationProps = {
  navigation: StackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList>;
}; 