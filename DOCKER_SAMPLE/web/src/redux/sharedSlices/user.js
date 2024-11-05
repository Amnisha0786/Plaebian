import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addDetails: (state, action) => {
      state.value = action.payload;
    },
    updateDetails: (state, action) => {
      state.value.account = {
        ...state.value.account,
        ...action.payload
      }
    },
    logout: (state) => {
      state.value = {};
    },
  },
});

export const { addDetails, updateDetails, logout } = userSlice.actions;

export default userSlice.reducer;
