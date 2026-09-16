import {
  createAsyncThunk,
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
import { getGithubClient } from "../githubClient.js";
import { getErrorMessage } from "../types.js";

export interface TrackedState {
  repos: TrackedRepo[];
  loadingIds: string[];
  errorById: Record<string, string>;
}

const initialState: TrackedState = {
  repos: [],
  loadingIds: [],
  errorById: {},
};

function upsertRepo(repos: TrackedRepo[], repo: TrackedRepo): void {
  const index = repos.findIndex((existing) => existing.id === repo.id);
  if (index === -1) {
    repos.push(repo);
    return;
  }
  repos[index] = repo;
}

function addLoadingId(state: TrackedState, id: string): void {
  if (!state.loadingIds.includes(id)) {
    state.loadingIds.push(id);
  }
}

function removeLoadingId(state: TrackedState, id: string): void {
  state.loadingIds = state.loadingIds.filter((loadingId) => loadingId !== id);
}

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
      return await fetchTrackedDetails(owner, repoName);
    } catch (error) {
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
    const existing = state.tracked.repos.find((repo) => repo.id === id);
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

const trackedSlice = createSlice({
  name: "tracked",
  initialState,
  reducers: {
    untrackRepo(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.repos = state.repos.filter((repo) => repo.id !== id);
      removeLoadingId(state, id);
      delete state.errorById[id];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackRepo.pending, (state, action) => {
        const id = toRepoId(action.meta.arg.full_name);
        if (!state.repos.some((repo) => repo.id === id)) {
          state.repos.push(mapGithubRepoToTracked(action.meta.arg, null));
        }
        addLoadingId(state, id);
        delete state.errorById[id];
      })
      .addCase(trackRepo.fulfilled, (state, action) => {
        upsertRepo(state.repos, action.payload);
        removeLoadingId(state, action.payload.id);
        delete state.errorById[action.payload.id];
      })
      .addCase(trackRepo.rejected, (state, action) => {
        const id = toRepoId(action.meta.arg.full_name);
        removeLoadingId(state, id);
        state.errorById[id] =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to track repository";
      })
      .addCase(refreshRepo.pending, (state, action) => {
        addLoadingId(state, action.meta.arg);
        delete state.errorById[action.meta.arg];
      })
      .addCase(refreshRepo.fulfilled, (state, action) => {
        upsertRepo(state.repos, action.payload);
        removeLoadingId(state, action.payload.id);
        delete state.errorById[action.payload.id];
      })
      .addCase(refreshRepo.rejected, (state, action) => {
        const id = action.meta.arg;
        removeLoadingId(state, id);
        state.errorById[id] =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to refresh repository";
      });
  },
});

export const { untrackRepo } = trackedSlice.actions;
export const trackedReducer = trackedSlice.reducer;

export const selectStarsChartData = (state: { tracked: TrackedState }) =>
  state.tracked.repos.map((repo) => ({
    label: repo.fullName,
    stars: repo.stars,
  }));
