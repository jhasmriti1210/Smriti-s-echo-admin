import React, { useContext, useState } from "react";
import { base_url } from "../../config/config";
import axios from "axios";
import toast from "react-hot-toast";
import storeContext from "../../context/storeContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(storeContext);
  const [loader, setLoader] = useState(false);
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoader(true);
      const { data } = await axios.post(`${base_url}/api/login`, state);
      setLoader(false);
      localStorage.setItem("poetryToken", data.token);
      toast.success(data.message);
      dispatch({
        type: "login_success",
        payload: {
          token: data.token,
        },
      });
      navigate("/dashboard/admin");
    } catch (error) {
      setLoader(false);
      toast.error(error.response.data.message || "Login failed");
    }
  };

  return (
    <div
      className="min-w-screen min-h-screen flex justify-center items-center relative"
      style={{
        backgroundImage: "url('/assets/img.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>{" "}
      {/* Overlay with opacity */}
      <div className="bg-white w-[420px] h-full px-7 py-8 rounded-md relative z-10">
        <div className="w-full justify-center items-center flex">
          <img className="w-[200px]" src="/assets/mylogo.png" alt="logo" />
        </div>
        <form onSubmit={submit} className="mt-8">
          <div className="flex flex-col gap-y-2">
            <label
              className="text-md font-medium text-gray-600"
              htmlFor="email"
            >
              Email
            </label>
            <input
              onChange={inputHandle}
              value={state.email}
              required
              type="email"
              placeholder="Email"
              name="email"
              className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
              id="email"
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label
              className="text-md font-medium text-gray-600"
              htmlFor="password"
            >
              Password
            </label>
            <input
              onChange={inputHandle}
              value={state.password}
              required
              type="password"
              placeholder="Password"
              name="password"
              className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
              id="password"
            />
          </div>

          <div className="mt-4">
            <button
              disabled={loader}
              className="px-3 w-full py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-600"
            >
              {loader ? "loading..." : "Login"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-1 text-lg font-semibold text-green-800 border-2 border-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
