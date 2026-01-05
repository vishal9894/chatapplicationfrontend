import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    isLoading: false,
    error: null,
    selectedUser: null,
    userProfile: null,
    lastmessage : null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIsLoaing: (state, action) => {
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
    setLastmessage :(state , action) =>{
      state.lastmessage = action.payload;
    }
  },
});

export const {
  setError,
  setIsLoaing,
  setUser,
  selectUser,
  clearSelectedUser,
  setUserProfile,
  setLastmessage
} = userSlice.actions;

export default userSlice.reducer;
