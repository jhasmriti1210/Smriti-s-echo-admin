import React, { useReducer } from "react";
import storeReducer from "./storeReducer";
import storeContext from "./storeContext";
import Profile from "../dashboard/pages/Profile"; // Optional, if needed

import decode_token from "../utils/index";

const StoreProvider = ({ children }) => {
  const [store, dispatch] = useReducer(storeReducer, {
    userInfo: decode_token(localStorage.getItem("poetryToken")),
    token: localStorage.getItem("poetryToken") || "",
    role: "", // Add role in the initial state
  });

  return (
    <storeContext.Provider value={{ store, dispatch }}>
      {children}
      {/* If you want Profile component to render, it should be conditional or optional */}
      <Profile />
    </storeContext.Provider>
  );
};

export default StoreProvider;
