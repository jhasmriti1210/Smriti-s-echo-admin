import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { base_url } from "../../config/config";
import storeContext from "../../context/storeContext";
const AddWriter = () => {
  const navigate = useNavigate();
  const { store } = useContext(storeContext);
  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
    category: "",
  });
  const inputHandler = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const [loader, setLoader] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoader(true);
      const { data } = await axios.post(
        `${base_url}/api/poetry/writer/add`,
        state,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );
      setLoader(false);
      toast.success(data.message);
      navigate("/dashboard/writers");
    } catch (error) {
      setLoader(false);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="bg-white rounded-md">
      <div className="flex justify-between p-4">
        <h2 className="text-xl font-medium">Add Writers</h2>

        <Link
          className="px-3 py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-800"
          to="/dashboard/writers"
        >
          Writers
        </Link>
      </div>
      <div className="p-4">
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-x-8 mb-3">
            <div className="flex flex-col gap-y-2">
              <label
                className="text-md font-medium text-gray-600"
                htmlFor="name"
              >
                Name
              </label>
              <input
                onChange={inputHandler}
                value={state.name}
                required
                type="text"
                placeholder="Name"
                name="name"
                className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
                id="name"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label
                className="text-md font-medium text-gray-600"
                htmlFor="category"
              >
                Category
              </label>
              <select
                onChange={inputHandler}
                value={state.category}
                required
                name="category"
                id="category"
                className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
              >
                <option value="">---Select Category---</option>
                <option value="Love">Love</option>
                <option value="Pain">Pain</option>
                <option value="Hope">Hope</option>
                <option value="Silence">Silence</option>
                <option value="Strength">Strength</option>
                <option value="Heartbreak">Heartbreak</option>
                <option value="Inspiration">Inspiration</option>
                <option value="Reflective">Reflective</option>
                <option value="Devotion">Devotion</option>
                <option value="Loneliness">Loneliness</option>
                <option value="Peace">Peace</option>
                <option value="Freedom">Freedom</option>
                <option value="Recitals">Recitals</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 mb-3">
            <div className="flex flex-col gap-y-2">
              <label
                className="text-md font-medium text-gray-600"
                htmlFor="email"
              >
                Email
              </label>
              <input
                onChange={inputHandler}
                value={state.email}
                required
                type="text"
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
                onChange={inputHandler}
                value={state.password}
                required
                type="password"
                placeholder="Password"
                name="password"
                className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
                id="password"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              disabled={loader}
              className="px-3 py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-800"
            >
              {loader ? "Loading..." : "Add Writer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWriter;
