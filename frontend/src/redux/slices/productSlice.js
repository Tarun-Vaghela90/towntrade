import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",
  initialState: {
    items: [],
    loading: true,
    selectedProduct: null, // ✅ currently selected product
  },
  reducers: {
    // Replace all products (used for filter reset or initial fetch)
    setProducts: (state, action) => {
      state.items = action.payload;
    },
    // Append new products to existing list (for infinite scroll)
    appendProducts: (state, action) => {
      state.items = [...state.items, ...action.payload];
    },
    // Loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Set selected product
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    // Clear selected product
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
});

export const {
  setProducts,
  appendProducts, // ✅ new action
  setLoading,
  setSelectedProduct,
  clearSelectedProduct,
} = productSlice.actions;

export default productSlice.reducer;
