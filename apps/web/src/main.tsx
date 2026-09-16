import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { appTheme } from "@repo/ui";
import {
  configureGithubClient,
  setupStore,
} from "@repo/store";
import App from "./App";
import "./index.css";

configureGithubClient({
  token: import.meta.env.VITE_GITHUB_TOKEN as string | undefined,
});

const { store } = setupStore();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
