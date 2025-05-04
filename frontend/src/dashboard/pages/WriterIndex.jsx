import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import storeContext from "../../context/storeContext";

const WriterIndex = () => {
  const { store } = useContext(storeContext);
  const [stats, setStats] = useState({
    total: 6,
    approved: 6,
    pending: 0,
    rejected: 0,
  });

  return (
    <div className="min-h-screen bg-gray-100   flex justify-center">
      <div className="max-w-7xl w-full bg-white p-8 rounded-lg shadow-lg">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, Writer!</h1>
          <p className="text-lg text-gray-600 mt-2">
            Here’s your dashboard where you can manage your submissions, view
            stats, and much more!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Link
            to="/dashboard/poetry/create"
            className="flex flex-col items-center justify-center bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 h-36"
          >
            <span className="text-2xl">✏️</span>
            <span className="mt-2 text-sm md:text-base">Add New Poetry</span>
          </Link>
          <Link
            to="/dashboard/poetry"
            className="flex flex-col items-center justify-center bg-green-500 text-white p-4 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
          >
            <span className="text-2xl">📁</span>
            <span className="mt-2 text-sm md:text-base">
              View My Submissions
            </span>
          </Link>
          <Link
            to="/dashboard/profile"
            className="flex flex-col items-center justify-center bg-yellow-500 text-white p-4 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
          >
            <span className="text-2xl">🔐</span>
            <span className="mt-2 text-sm md:text-base">Update Password</span>
          </Link>
          <button
            onClick={() =>
              (window.location.href = "mailto:smritipoetry@gmail.com")
            }
            className="flex flex-col items-center justify-center bg-red-500 text-white p-4 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
          >
            <span className="text-2xl">📩</span>
            <span className="mt-2 text-sm md:text-base">Contact Admin</span>
          </button>
        </div>

        {/* Statistics Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-blue-100 p-6 rounded-lg shadow text-center">
              <h3 className="text-lg text-blue-600 font-semibold">Total</h3>
              <p className="text-3xl text-gray-700 mt-2">{stats.total}</p>
            </div>
            <div className="bg-green-100 p-6 rounded-lg shadow text-center">
              <h3 className="text-lg text-green-600 font-semibold">Approved</h3>
              <p className="text-3xl text-gray-700 mt-2">{stats.approved}</p>
            </div>
            <div className="bg-yellow-100 p-6 rounded-lg shadow text-center">
              <h3 className="text-lg text-yellow-600 font-semibold">Pending</h3>
              <p className="text-3xl text-gray-700 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-red-100 p-6 rounded-lg shadow text-center">
              <h3 className="text-lg text-red-600 font-semibold">Rejected</h3>
              <p className="text-3xl text-gray-700 mt-2">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriterIndex;
