import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start as true to wait for verification
};

// Load initial state from localStorage
const token = localStorage.getItem('token');
if (token) {
  try {
    initialState.token = token;
    initialState.isAuthenticated = true;
    initialState.isLoading = true; // Still loading until user is fetched
  } catch (e) {
    localStorage.removeItem('token');
    initialState.isLoading = false;
  }
} else {
  initialState.isLoading = false;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem('token', action.payload);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setToken, setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;