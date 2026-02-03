import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    isLoading: false,
    error: null,
    selectedUser: null,
    userProfile: null,
    lastmessage: {}, // store last messages per user
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    selectUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setLastMessage: (state, action) => {
      const { userId, message } = action.payload;
      state.lastmessage[userId] = message; // store per user
    },
  },
});

export const {
  setError,
  setIsLoading,
  setUser,
  selectUser,
  clearSelectedUser,
  setUserProfile,
  setLastMessage,
} = userSlice.actions;

export default userSlice.reducer;
