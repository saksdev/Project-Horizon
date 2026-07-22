import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { WorkspaceProvider } from "./context/WorkspaceContext.tsx";

/**
 * Conditionally loads and starts Mock Service Worker (MSW) in development environments.
 */
async function startMocking() {
  if (!import.meta.env.DEV) {
    return;
  }
  const { worker } = await import("./mocks/browser");
  // Enforce quiet mode bypass to avoid polluting console with other third party script intercepts
  return worker.start({
    onUnhandledRequest: "bypass",
  });
}

startMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <WorkspaceProvider>
          <App />
        </WorkspaceProvider>
      </BrowserRouter>
    </StrictMode>
  );
});
