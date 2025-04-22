import React from "react";
import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import storeContext from "../context/storeContext";

const protectDashboard = () => {
  const { store } = useContext(storeContext);

  if (store.userInfo) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default protectDashboard;
