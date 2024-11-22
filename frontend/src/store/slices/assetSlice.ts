import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset } from '@/types/shared';
import { wsService } from '@/services/websocket';
import { WebSocketMessageType } from '@/types/websocket';
import { store } from '../store';

interface AssetState {
  items: Asset[];
  loading: boolean;
  error: string | null;
}

const initialState: AssetState = {
  items: [],
  loading: false,
  error: null,
};

const assetSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setAssets: (state, action: PayloadAction<Asset[]>) => {
      state.items = action.payload;
    },
    updateAsset: (state, action: PayloadAction<Asset>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Move subscription to where store is available
export const initializeAssetWebSocket = () => {
  wsService.subscribe(WebSocketMessageType.AssetUpdate, (asset: Asset) => {
    store.dispatch(assetSlice.actions.updateAsset(asset));
  });
};

export const { setAssets, updateAsset, setLoading, setError } = assetSlice.actions;
export default assetSlice.reducer; 