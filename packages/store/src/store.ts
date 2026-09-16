import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { loadTrackedRepos, persistTrackedRepos } from "./persist.js";
import { searchReducer } from "./search/searchSlice.js";
import { trackedReducer } from "./tracked/trackedSlice.js";

const rootReducer = combineReducers({
  search: searchReducer,
  tracked: trackedReducer,
});

export function setupStore() {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      tracked: {
        repos: loadTrackedRepos(),
        loadingIds: [],
        errorById: {},
      },
    },
  });

  persistTrackedRepos(store);
  return { store };
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>["store"];
export type AppDispatch = AppStore["dispatch"];
