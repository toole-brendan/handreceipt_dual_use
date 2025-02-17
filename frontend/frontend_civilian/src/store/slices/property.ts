import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PharmaceuticalProduct } from '@/mocks/api/pharmaceuticals-products.mock';
import { PharmaceuticalShipment } from '@/mocks/api/pharmaceuticals-shipments.mock';

interface PropertyState {
  products: PharmaceuticalProduct[];
  shipments: PharmaceuticalShipment[];
  selectedProduct: string | null;
  selectedShipment: string | null;
  loading: {
    products: boolean;
    shipments: boolean;
  };
  error: string | null;
}

const initialState: PropertyState = {
  products: [],
  shipments: [],
  selectedProduct: null,
  selectedShipment: null,
  loading: {
    products: false,
    shipments: false,
  },
  error: null,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    // Product actions
    fetchProductsStart: (state) => {
      state.loading.products = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action: PayloadAction<PharmaceuticalProduct[]>) => {
      state.products = action.payload;
      state.loading.products = false;
      state.error = null;
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.loading.products = false;
      state.error = action.payload;
    },
    selectProduct: (state, action: PayloadAction<string>) => {
      state.selectedProduct = action.payload;
    },
    addProduct: (state, action: PayloadAction<PharmaceuticalProduct>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<PharmaceuticalProduct>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
      if (state.selectedProduct === action.payload) {
        state.selectedProduct = null;
      }
    },

    // Shipment actions
    fetchShipmentsStart: (state) => {
      state.loading.shipments = true;
      state.error = null;
    },
    fetchShipmentsSuccess: (state, action: PayloadAction<PharmaceuticalShipment[]>) => {
      state.shipments = action.payload;
      state.loading.shipments = false;
      state.error = null;
    },
    fetchShipmentsFailure: (state, action: PayloadAction<string>) => {
      state.loading.shipments = false;
      state.error = action.payload;
    },
    selectShipment: (state, action: PayloadAction<string>) => {
      state.selectedShipment = action.payload;
    },
    addShipment: (state, action: PayloadAction<PharmaceuticalShipment>) => {
      state.shipments.push(action.payload);
    },
    updateShipment: (state, action: PayloadAction<PharmaceuticalShipment>) => {
      const index = state.shipments.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.shipments[index] = action.payload;
      }
    },
    deleteShipment: (state, action: PayloadAction<string>) => {
      state.shipments = state.shipments.filter(s => s.id !== action.payload);
      if (state.selectedShipment === action.payload) {
        state.selectedShipment = null;
      }
    },

    // Common actions
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  selectProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  fetchShipmentsStart,
  fetchShipmentsSuccess,
  fetchShipmentsFailure,
  selectShipment,
  addShipment,
  updateShipment,
  deleteShipment,
  clearError,
  resetState,
} = propertySlice.actions;

export const propertyReducer = propertySlice.reducer;
