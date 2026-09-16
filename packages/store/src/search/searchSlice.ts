import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  createGithubClient,
  type GithubRepo,
  type GithubClientOptions,
} from "@repo/api";
import { getErrorMessage, type RequestStatus } from "../types.js";

export interface SearchState {
  query: string;
  results: GithubRepo[];
  status: RequestStatus;
  error: string | null;
}

const initialState: SearchState = {
  query: "",
  results: [],
  status: "idle",
  error: null,
};

let clientOptions: GithubClientOptions = {};

export function configureGithubClient(options: GithubClientOptions): void {
  clientOptions = options;
}

export function getGithubClient() {
  return createGithubClient(clientOptions);
}

export const searchRepos = createAsyncThunk(
  "search/searchRepos",
  async (query: string, { getState, rejectWithValue }) => {
    try {
      const client = getGithubClient();
      const response = await client.searchRepos(query);
      const currentQuery = (getState() as { search: SearchState }).search.query;
      if (currentQuery.trim() !== query.trim()) {
        return rejectWithValue("__stale__");
      }
      return response.items;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to search repositories"));
    }
  },
  {
    condition: (query) => query.trim().length > 0,
  },
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
      if (!action.payload.trim()) {
        state.results = [];
        state.status = "idle";
        state.error = null;
      }
    },
    clearSearch(state) {
      state.query = "";
      state.results = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchRepos.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(searchRepos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload;
      })
      .addCase(searchRepos.rejected, (state, action) => {
        if (action.payload === "__stale__") {
          return;
        }
        state.status = "failed";
        state.error =
          (action.payload as string | undefined) ??
          action.error.message ??
          "Failed to search repositories";
        state.results = [];
      });
  },
});

export const { setQuery, clearSearch } = searchSlice.actions;
export const searchReducer = searchSlice.reducer;
