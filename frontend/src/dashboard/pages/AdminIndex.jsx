import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import storeContext from "../../context/storeContext";

const AdminIndex = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useContext(storeContext);

  const logout = () => {
    localStorage.removeItem("poetryToken");
    dispatch({ type: "logout", payload: "" });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-green-600 text-white p-4 rounded-md mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-green-800 px-4 py-2 rounded-lg hover:bg-green-900"
        >
          Log Out
        </button>
      </header>

      {/* First Row: Overview, User Info, Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Overview Cards */}
        <div className="flex flex-col items-center justify-center bg-green-500 text-white p-6 rounded-lg shadow-md hover:bg-green-600 transition duration-300">
          <span className="text-sm md:text-xl">Total Writers</span>
          <span className="text-3xl font-bold">10</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-yellow-500 text-white p-6 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300">
          <span className="text-sm md:text-xl">Total Poetry</span>
          <span className="text-3xl font-bold">16</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-red-500 text-white p-6 rounded-lg shadow-md hover:bg-red-600 transition duration-300">
          <span className="text-sm md:text-xl">Pending Poetry</span>
          <span className="text-3xl font-bold">0</span>
        </div>
      </div>

      {/* User Management Info */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Writers</h2>
        <ul className="space-y-4">
          <li className="flex justify-between items-center border-b pb-3">
            <div>
              <p className="text-gray-700 font-medium">Smriti Jha</p>
              <p className="text-gray-500 text-sm">Writer</p>
              <p className="text-gray-500 text-sm">
                <strong>Category:</strong> Love
              </p>
            </div>
            <p className="text-gray-500 text-sm">jhasmritilove@gmail.com</p>
          </li>
          <li className="flex justify-between items-center border-b pb-3">
            <div>
              <p className="text-gray-700 font-medium">Smriti Jha</p>
              <p className="text-gray-500 text-sm">Writer</p>
              <p className="text-gray-500 text-sm">
                <strong>Category:</strong> Devotion
              </p>
            </div>
            <p className="text-gray-500 text-sm">jhasmritidevotion@gmail.com</p>
          </li>
        </ul>

        {/* Manage Writers Button */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <Link
            to="/dashboard/writers"
            className="w-full md:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md transition duration-300"
          >
            All Writers
          </Link>
          <Link
            to="/dashboard/writer/add"
            className="w-full md:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md transition duration-300"
          >
            Add Writers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminIndex;
