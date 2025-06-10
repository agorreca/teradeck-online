import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  currentRoom: any | null;
  currentPlayer: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: GameState = {
  currentRoom: null,
  currentPlayer: null,
  loading: false,
  error: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentRoom: (state, action: PayloadAction<any>) => {
      state.currentRoom = action.payload;
    },
    setCurrentPlayer: (state, action: PayloadAction<any>) => {
      state.currentPlayer = action.payload;
    },
    clearGame: state => {
      state.currentRoom = null;
      state.currentPlayer = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setCurrentRoom,
  setCurrentPlayer,
  clearGame,
} = gameSlice.actions;

export default gameSlice;
