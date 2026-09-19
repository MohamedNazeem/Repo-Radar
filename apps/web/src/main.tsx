import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { AppLocaleProvider, AppThemeProvider } from "@repo/ui";
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
      <AppLocaleProvider>
        <AppThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppThemeProvider>
      </AppLocaleProvider>
    </Provider>
  </StrictMode>,
);
