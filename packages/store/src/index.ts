export { setupStore } from "./store.js";
export type { AppDispatch, AppStore, RootState } from "./store.js";
export { useAppDispatch, useAppSelector } from "./hooks.js";
export { configureGithubClient } from "./githubClient.js";
export {
  searchRepos,
  setQuery,
  clearSearch,
  searchReducer,
} from "./search/searchSlice.js";
export type { SearchState } from "./search/searchSlice.js";
export {
  trackRepo,
  untrackRepo,
  refreshRepo,
  trackedReducer,
  selectStarsChartData,
} from "./tracked/trackedSlice.js";
export type { TrackedState } from "./tracked/trackedSlice.js";
