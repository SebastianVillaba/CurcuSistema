import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface TerminalState {
  isValidated: boolean;
  isLoading: boolean;
  error: string | null;
  terminal: {
    idTerminalWeb: number | null;
    nombreSucursal: string | null;
    nombreDeposito: string | null;
    token: string | null;
  };
}

const initialState: TerminalState = {
  isValidated: false,
  isLoading: false,
  error: null,
  terminal: {
    idTerminalWeb: null,
    nombreSucursal: null,
    nombreDeposito: null,
    token: null,
  },
};

export const terminalSlice = createSlice({
  name: 'terminal',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTerminalValidated: (state, action: PayloadAction<{
      idTerminalWeb: number;
      nombreSucursal: string;
      nombreDeposito: string;
      token: string;
    }>) => {
      state.isValidated = true;
      state.isLoading = false;
      state.error = null;
      state.terminal = action.payload;
    },
    setTerminalError: (state, action: PayloadAction<{ error: string; token: string }>) => {
      state.isValidated = false;
      state.isLoading = false;
      state.error = action.payload.error;
      state.terminal.token = action.payload.token;
    },
    clearTerminal: (state) => {
      state.isValidated = false;
      state.isLoading = false;
      state.error = null;
      state.terminal = {
        idTerminalWeb: null,
        nombreSucursal: null,
        nombreDeposito: null,
        token: null,
      };
    },
  },
});

export const { setLoading, setTerminalValidated, setTerminalError, clearTerminal } = terminalSlice.actions;

// Selectores
export const selectTerminal = (state: RootState) => state.terminal;
export const selectIsTerminalValidated = (state: RootState) => state.terminal.isValidated;
export const selectTerminalInfo = (state: RootState) => state.terminal.terminal;
export const selectTerminalLoading = (state: RootState) => state.terminal.isLoading;
export const selectTerminalError = (state: RootState) => state.terminal.error;

export default terminalSlice.reducer;
