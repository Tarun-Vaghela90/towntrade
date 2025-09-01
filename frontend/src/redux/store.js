import { configureStore, combineReducers } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import userReducer from './slices/userSlice'
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import searchReducer from './slices/searchSlice'
const rootReducer = combineReducers({
  user: userReducer,
  product:productReducer,
  search: searchReducer,
});
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // slices you want to persist
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }),
});

export const persistor = persistStore(store);
