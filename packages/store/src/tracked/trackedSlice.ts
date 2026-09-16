import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  mapGithubRepoToTracked,
  parseFullName,
  toRepoId,
  type GithubRepo,
  type TrackedRepo,
} from "@repo/api";
import { getErrorMessage, type RequestStatus } from "../types.js";
import { getGithubClient } from "../search/searchSlice.js";

export interface TrackedState {
  ids: string[];
  entities: Record<string, TrackedRepo>;
  statusById: Record<string, RequestStatus>;
  errorById: Record<string, string | null>;
}

const initialState: TrackedState = {
  ids: [],
  entities: {},
  statusById: {},
  errorById: {},
};

async function fetchTrackedDetails(
  owner: string,
  repo: string,
): Promise<TrackedRepo> {
  const client = getGithubClient();
  const [githubRepo, lastCommitDate] = await Promise.all([
    client.getRepo(owner, repo),
    client.getLatestCommitDate(owner, repo),
  ]);
  return mapGithubRepoToTracked(githubRepo, lastCommitDate);
}

export const trackRepo = createAsyncThunk(
  "tracked/trackRepo",
  async (repo: GithubRepo, { rejectWithValue }) => {
    try {
      const { owner, repo: repoName } = parseFullName(repo.full_name);
      const tracked = await fetchTrackedDetails(owner, repoName);
      return tracked;
    } catch (error) {
      // Fall back to search payload so tracking still works offline from rate limits mid-fetch.
      try {
        return mapGithubRepoToTracked(repo, null);
      } catch {
        return rejectWithValue(getErrorMessage(error, "Failed to track repository"));
      }
    }
  },
);

export const refreshRepo = createAsyncThunk(
  "tracked/refreshRepo",
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as { tracked: TrackedState };
    const existing = state.tracked.entities[id];
    if (!existing) {
      return rejectWithValue("Repository is not tracked");
    }

    try {
      const { owner, repo } = parseFullName(existing.fullName);
      return await fetchTrackedDetails(owner, repo);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to refresh repository"));
    }
  },
);

export const refreshAllTracked = createAsyncThunk(
  "tracked/refreshAllTracked",
  async (_, { getState, dispatch }) => {
    const state = getState() as { tracked: TrackedState };
    const ids = state.tracked.ids;
    await Promise.allSettled(ids.map((id) => dispatch(refreshRepo(id))));
    return ids;
  },
);

const trackedSlice = createSlice({
  name: "tracked",
  initialState,
  reducers: {
    untrackRepo(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.filter((existingId) => existingId !== id);
      delete state.entities[id];
      delete state.statusById[id];
      delete state.errorById[id];
    },
    hydrateTrackedFromSearch(state, action: PayloadAction<GithubRepo>) {
      const tracked = mapGithubRepoToTracked(action.payload, null);
      if (!state.entities[tracked.id]) {
        state.ids.push(tracked.id);
      }
      state.entities[tracked.id] = {
        ...tracked,
        lastCommitDate:
          state.entities[tracked.id]?.lastCommitDate ?? tracked.lastCommitDate,
      };
      state.statusById[tracked.id] = state.statusById[tracked.id] ?? "idle";
      state.errorById[tracked.id] = state.errorById[tracked.id] ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackRepo.pending, (state, action) => {
        const id = toRepoId(action.meta.arg.full_name);
        if (!state.entities[id]) {
          // Optimistic placeholder from search result
          state.entities[id] = mapGithubRepoToTracked(action.meta.arg, null);
          state.ids.push(id);
        }
        state.statusById[id] = "loading";
        state.errorById[id] = null;
      })
      .addCase(trackRepo.fulfilled, (state, action) => {
        const tracked = action.payload;
        if (!state.ids.includes(tracked.id)) {
          state.ids.push(tracked.id);
        }
        state.entities[tracked.id] = tracked;
        state.statusById[tracked.id] = "succeeded";
        state.errorById[tracked.id] = null;
      })
      .addCase(trackRepo.rejected, (state, action) => {
        const id = toRepoId(action.meta.arg.full_name);
        state.statusById[id] = "failed";
        state.errorById[id] =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to track repository";
      })
      .addCase(refreshRepo.pending, (state, action) => {
        const id = action.meta.arg;
        state.statusById[id] = "loading";
        state.errorById[id] = null;
      })
      .addCase(refreshRepo.fulfilled, (state, action) => {
        const tracked = action.payload;
        state.entities[tracked.id] = tracked;
        state.statusById[tracked.id] = "succeeded";
        state.errorById[tracked.id] = null;
      })
      .addCase(refreshRepo.rejected, (state, action) => {
        const id = action.meta.arg;
        state.statusById[id] = "failed";
        state.errorById[id] =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to refresh repository";
      });
  },
});

export const { untrackRepo, hydrateTrackedFromSearch } = trackedSlice.actions;
export const trackedReducer = trackedSlice.reducer;

type RootLike = { tracked: TrackedState };

export const selectTrackedIds = (state: RootLike) => state.tracked.ids;
export const selectTrackedEntities = (state: RootLike) => state.tracked.entities;
export const selectStatusById = (state: RootLike) => state.tracked.statusById;
export const selectErrorById = (state: RootLike) => state.tracked.errorById;

export const selectTrackedRepos = createSelector(
  [selectTrackedIds, selectTrackedEntities],
  (ids, entities) => ids.map((id) => entities[id]).filter(Boolean),
);

export const selectStarsChartData = createSelector(
  [selectTrackedRepos],
  (repos) =>
    repos.map((repo) => ({
      label: repo.fullName,
      stars: repo.stars,
    })),
);

export const selectIsTracked = (id: string) => (state: RootLike) =>
  Boolean(state.tracked.entities[id]);
