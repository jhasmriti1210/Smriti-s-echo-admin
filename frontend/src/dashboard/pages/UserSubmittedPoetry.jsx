import React, { useContext } from "react";
import { Link } from "react-router-dom";
import PoetryContentUser from "../components/PoetryContentUser";
import storeContext from "../../context/storeContext";

const Poetry = () => {
  const { store } = useContext(storeContext);
  return (
    <div className="bg-white rounded-md">
      <div className="flex justify-between p-4">
        <h1 className="text-2xl font-medium">User's Poetry</h1>

        <Link
          className="px-3 py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-800"
          to="/dashboard/poetry/createadmin"
        >
          Add User's Poetry
        </Link>
      </div>
      <PoetryContentUser />
    </div>
  );
};

export default Poetry;
