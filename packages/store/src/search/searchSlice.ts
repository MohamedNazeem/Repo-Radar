import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { GithubRepo } from "@repo/api";
import { getGithubClient } from "../githubClient.js";
import { getErrorMessage } from "../types.js";

export interface SearchState {
  query: string;
  results: GithubRepo[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: "",
  results: [],
  loading: false,
  error: null,
};

export const searchRepos = createAsyncThunk(
  "search/searchRepos",
  async (query: string, { getState, rejectWithValue }) => {
    try {
      const response = await getGithubClient().searchRepos(query);
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
        state.loading = false;
        state.error = null;
      }
    },
    clearSearch(state) {
      state.query = "";
      state.results = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchRepos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRepos.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchRepos.rejected, (state, action) => {
        if (action.payload === "__stale__") {
          return;
        }
        state.loading = false;
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
