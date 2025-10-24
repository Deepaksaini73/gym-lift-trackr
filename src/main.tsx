import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, setupInstallPrompt } from "./utils/registerSW";

// Register service worker for PWA
registerServiceWorker();
setupInstallPrompt();

createRoot(document.getElementById("root")!).render(<App />);
