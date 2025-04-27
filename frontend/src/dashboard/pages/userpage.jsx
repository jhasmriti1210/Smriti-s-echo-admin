import React from "react";
import { Link } from "react-router-dom";

const UserPage = () => {
  return (
    <div
      className="w-full h-screen overflow-x-hidden overflow-y-hidden bg-no-repeat bg-fixed bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/assets/img.jpg')",
      }}
    >
      <div className="bg-black bg-opacity-70 p-10 rounded-xl text-center max-w-4xl w-full mx-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Poetry Admin Panel
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 italic mb-6">
          “Where every word is a whisper, and every silence is a story.”
        </p>

        <Link
          to="/login"
          className="inline-block bg-green-800 hover:bg-green-700 px-6 py-2 rounded-full text-white text-lg transition duration-300"
        >
          Login to Continue
        </Link>
      </div>
    </div>
  );
};

export default UserPage;
