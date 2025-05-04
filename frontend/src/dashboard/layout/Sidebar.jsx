import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiFillDashboard, AiOutlinePlus } from "react-icons/ai";
import { ImProfile } from "react-icons/im";
import { FiUsers } from "react-icons/fi";
import { FaPlus, FaBook, FaPen, FaListAlt, FaUser } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import storeContext from "../../context/storeContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { store, dispatch } = useContext(storeContext);

  const logout = () => {
    localStorage.removeItem("poetryToken");
    dispatch({ type: "logout", payload: "" });
    navigate("/login");
  };

  return (
    <div className="w-[250px] h-screen fixed left-0 top-0 bg-white">
      <div className="h-[150px] flex justify-center items-center">
        <Link to="/">
          <img
            src="/assets/mylogo.png"
            alt="logo"
            className="object-contain w-32 h-auto"
          />
        </Link>
      </div>
      <ul className="px-3 flex flex-col gap-y-1 font-medium">
        {store.userInfo?.role === "admin" ? (
          <>
            <li>
              <Link
                to="/dashboard/admin"
                className={`px-3 ${
                  pathname === "/dashboard/admin"
                    ? "bg-green-700 text-white"
                    : "bg-white text-[#404040f6]"
                } py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-green-700 hover:text-white`}
              >
                <span className="text-xl">
                  <AiFillDashboard />
                </span>
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard/writer/add"
                className={`px-3 ${
                  pathname === "/dashboard/writer/add"
                    ? "bg-green-700 text-white"
                    : "bg-white text-[#404040f6]"
                } py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-green-700 hover:text-white`}
              >
                <span className="text-xl">
                  <AiOutlinePlus />
                </span>
                <span>Add Writer</span>
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard/writers"
                className={`px-3 ${
                  pathname === "/dashboard/writers"
                    ? "bg-green-700 text-white"
                    : "bg-white text-[#404040f6]"
                } py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-green-700 hover:text-white`}
              >
                <span className="text-xl">
                  <FiUsers />
                </span>
                <span>Writers</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/poetry/usersubmittedpoetry"
                className={`px-3 ${
                  pathname === "/dashboard/poetry/usersubmittedpoetry"
                    ? "bg-green-700 text-white"
                    : "bg-white text-[#404040f6]"
                } py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-green-700 hover:text-white`}
              >
                <span className="text-xl">
                  <FaBook />
                </span>
                <span>User's poetry</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/poetry/createadmin"
                className={`px-3 ${
                  pathname === "/dashboard/poetry/createadmin"
                    ? "bg-green-700 text-white"
                    : "bg-white text-[#404040f6]"
                } py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-green-700 hover:text-white`}
              >
                <span className="text-xl">
                  <FaPen />
                </span>
                <span>Add User's Poetry</span>
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/dashboard/writer"
                className={`px-3 ${
                  pathname === "/dashboard/writer"
                    ? "bg-green-700 text-white"
                    : "bg-white text-[#404040f6]"
                } py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-green-700 hover:text-white`}
              >
                <span className="text-xl">
                  <AiFillDashboard />
                </span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/poetry/create"
                className={`px-3 ${
                  pathname === "/dashboard/poetry/create"
                    ? "bg-green-700 text-white"
                    : "bg-white text-[#404040f6]"
                } py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-green-700 hover:text-white`}
              >
                <span className="text-xl">
                  <FaPlus />
                </span>
                <span>Add Poetry</span>
              </Link>
            </li>
          </>
        )}

        {/* Common tabs for both admin and writer */}
        <li>
          <Link
            to="/dashboard/poetry"
            className={`px-3 ${
              pathname === "/dashboard/poetry"
                ? "bg-green-700 text-white"
                : "bg-white text-[#404040f6]"
            } py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-green-700 hover:text-white`}
          >
            <span className="text-xl">
              <FaListAlt />
            </span>
            <span>All Poetry</span>
          </Link>
        </li>

        <li>
          <Link
            to="/dashboard/profile"
            className={`px-3 ${
              pathname === "/dashboard/profile"
                ? "bg-green-700 text-white"
                : "bg-white text-[#404040f6]"
            } py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-green-700 hover:text-white`}
          >
            <span className="text-xl">
              <FaUser />
            </span>
            <span>Profile</span>
          </Link>
        </li>

        <li>
          <div
            onClick={logout}
            className={`px-3 py-2 hover:shadow-lg hover:shadow-indigo-5000/20 w-full rounded-sm flex gap-x-2 justify-start items-center hover:bg-red-500 hover:text-white cursor-pointer`}
          >
            <span className="text-xl">
              <IoMdLogOut />
            </span>
            <span>Logout</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
