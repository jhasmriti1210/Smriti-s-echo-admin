import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import StoreProvider from "./context/storeProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StoreProvider>
    <>
      <App />
      <Toaster />
    </>
  </StoreProvider>
);
