import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { View } from '../types';

type SavedView = {
  id: string;
  payload: { view: View; breadcrumbs?: string[]; label?: string };
};

interface UserPreferencesState {
  compactMode: boolean;
  savedViews: SavedView[];
}

const initialState: UserPreferencesState = {
  compactMode: false,
  savedViews: [],
};

export const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    setCompactMode(state, action: PayloadAction<boolean>) {
      state.compactMode = action.payload;
    },
    saveView(state, action: PayloadAction<SavedView>) {
      // Prevent duplicates by id
      state.savedViews = state.savedViews.filter(v => v.id !== action.payload.id).concat(action.payload);
    },
    removeView(state, action: PayloadAction<string>) {
      state.savedViews = state.savedViews.filter((v) => v.id !== action.payload);
    },
    clearSavedViews(state) {
      state.savedViews = [];
    },
  },
});

export const { setCompactMode, saveView, removeView, clearSavedViews } = userPreferencesSlice.actions;
export default userPreferencesSlice.reducer;
