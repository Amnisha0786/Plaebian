import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMuted: true,
};

export const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    onMute: (state) => {
      state.isMuted = true;
    },
    onUnMute: (state) => {
      state.isMuted = false;
    },
  },
});

export const { onMute, onUnMute } = videoSlice.actions;

export default videoSlice.reducer;
