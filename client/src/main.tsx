import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initHalFaviconPulse } from "./lib/favicon-pulse";

initHalFaviconPulse();

createRoot(document.getElementById("root")!).render(<App />);
