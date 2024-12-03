import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MFAState {
  verified: boolean;
}

const initialState: MFAState = {
  verified: false,
};

const mfaSlice = createSlice({
  name: 'mfa',
  initialState,
  reducers: {
    setVerified: (state, action: PayloadAction<boolean>) => {
      state.verified = action.payload;
    },
  },
});

export const { setVerified } = mfaSlice.actions;
export default mfaSlice.reducer; 