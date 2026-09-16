import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type Persistor,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { searchReducer } from "./search/searchSlice.js";
import { trackedReducer } from "./tracked/trackedSlice.js";

const rootReducer = combineReducers({
  search: searchReducer,
  tracked: trackedReducer,
});

const persistConfig = {
  key: "github-repo-tracker",
  storage,
  whitelist: ["tracked"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export function setupStore() {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

  const persistor = persistStore(store);
  return { store, persistor };
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>["store"];
export type AppDispatch = AppStore["dispatch"];
export type AppPersistor = Persistor;
