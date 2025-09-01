import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null ,   // 👤 for login / authenticated user
    users: [],           // 👥 for admin dashboard list
    loading: false,
  },
  reducers: {
    // --- Auth ---
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload; // {id, name, email, role...}
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },

    // --- Admin Dashboard ---
    setAdminUsers: (state, action) => {
      state.users = action.payload;
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    removeUser: (state, action) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },

    // --- Loading ---
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCurrentUser,
  clearCurrentUser,
  setAdminUsers,
  addUser,
  removeUser,
  setLoading,
} = userSlice.actions;

export default userSlice.reducer;
