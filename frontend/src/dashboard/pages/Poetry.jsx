import React, { useContext } from "react";
import { Link } from "react-router-dom";
import PoetryContent from "../components/PoetryContent";
import storeContext from "../../context/storeContext";

const Poetry = () => {
  const { store } = useContext(storeContext);
  return (
    <div className="bg-white rounded-md">
      <div className="flex justify-between p-4">
        <h2 className="text-xl font-medium">Poetry</h2>
        {store.userInfo && store.userInfo.role !== "admin" && (
          <Link
            className="px-3 py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-800"
            to="/dashboard/poetry/create"
          >
            Create Poetry
          </Link>
        )}
      </div>
      <PoetryContent />
    </div>
  );
};

export default Poetry;
