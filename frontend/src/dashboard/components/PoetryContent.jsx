import React, { useContext, useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import axios from "axios";
import { base_url } from "../../config/config";
import storeContext from "../../context/storeContext";
import { convert } from "html-to-text";
import toast from "react-hot-toast";

const NewContent = () => {
  const { store } = useContext(storeContext);
  const [poetry, setPoetry] = useState([]);
  const [all_poetry, set_all_poetry] = useState([]);
  const [parPage, setParPage] = useState(5);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [res, set_res] = useState({ id: "", loader: false });

  const [showModal, setShowModal] = useState(false);
  const [poetryToDelete, setPoetryToDelete] = useState(null);

  const get_poetry = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/poetry`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      set_all_poetry(data.poetry);
      setPoetry(data.poetry);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    get_poetry();
  }, []);

  useEffect(() => {
    const calculate_page = Math.ceil(poetry.length / parPage);
    setPages(calculate_page);
  }, [poetry, parPage]);

  const type_filter = (e) => {
    if (e.target.value === "") {
      setPoetry(all_poetry);
      setPage(1);
      setParPage(5);
    } else {
      const tempPoetry = all_poetry.filter((n) => n.status === e.target.value);
      setPoetry(tempPoetry);
      setPage(1);
      setParPage(5);
    }
  };

  const serach_poetry = (e) => {
    const tempPoetry = all_poetry.filter((n) =>
      n.title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setPoetry(tempPoetry);
    setPage(1);
    setParPage(5);
  };

  const update_status = async (status, poetry_id) => {
    try {
      set_res({ id: poetry_id, loader: true });
      const { data } = await axios.put(
        `${base_url}/api/poetry/status-update/${poetry_id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );
      set_res({ id: "", loader: false });
      toast.success(data.message);
      get_poetry();
    } catch (error) {
      set_res({ id: "", loader: false });
      toast.error(error.response.data.message);
    }
  };

  const delete_poetry = async () => {
    try {
      setShowModal(false);
      const { data } = await axios.delete(
        `${base_url}/api/poetry/delete/${poetryToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );
      toast.success(data.message);
      get_poetry();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const paginationButtons = () => {
    let buttons = [];
    for (let i = 1; i <= pages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1 rounded-md border ${
            page === i
              ? "bg-green-500 text-white"
              : "bg-white text-black border-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div>
      <div className="px-4 py-3 flex gap-x-3">
        <select
          onChange={type_filter}
          className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
        >
          <option value="">---select type---</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="deactive">Deactive</option>
        </select>
        <input
          onChange={serach_poetry}
          type="text"
          placeholder="search Poetry"
          className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
        />
      </div>

      <div className="relative overflow-x-auto p-4">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-7 py-3">No</th>
              <th className="px-7 py-3">Title</th>
              <th className="px-7 py-3">Image</th>
              <th className="px-7 py-3">Category</th>
              <th className="px-7 py-3">Description</th>
              <th className="px-7 py-3">Date</th>
              <th className="px-7 py-3">Status</th>
              <th className="px-7 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {poetry.length > 0 &&
              poetry.slice((page - 1) * parPage, page * parPage).map((n, i) => (
                <tr key={n._id} className="bg-white border-b">
                  <td className="px-6 py-4">{(page - 1) * parPage + i + 1}</td>
                  <td className="px-6 py-4">{n.title.slice(0, 15)}...</td>
                  <td className="px-6 py-4">
                    <img className="w-[40px] h-[40px]" src={n.image} alt="" />
                  </td>
                  <td className="px-6 py-4">{n.category}</td>
                  <td className="px-6 py-4">
                    {convert(n.description).slice(0, 15)}...
                  </td>
                  <td className="px-6 py-4">{n.date}</td>
                  <td className="px-6 py-4">
                    {store?.userInfo?.role === "admin" ? (
                      <span
                        onClick={() =>
                          update_status(
                            n.status === "active" ? "deactive" : "active",
                            n._id
                          )
                        }
                        className={`px-2 py-[2px] text-xs rounded-lg cursor-pointer ${
                          n.status === "pending"
                            ? "bg-blue-100 text-blue-800"
                            : n.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {res.loader && res.id === n._id
                          ? "Loading..."
                          : n.status}
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-[2px] text-xs rounded-lg ${
                          n.status === "pending"
                            ? "bg-blue-100 text-blue-800"
                            : n.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {n.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-x-4 text-white">
                      <Link className="p-[6px] bg-green-500 rounded hover:shadow-lg hover:shadow-green-500/50">
                        <FaEye />
                      </Link>

                      <Link
                        to={`/dashboard/poetry/edit/${n._id}`}
                        className="p-[6px] bg-yellow-500 rounded hover:shadow-lg hover:shadow-yellow-500/50"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => {
                          setPoetryToDelete(n);
                          setShowModal(true);
                        }}
                        className="p-[6px] bg-red-500 rounded hover:shadow-lg hover:shadow-red-500/50"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            className="p-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            <IoIosArrowBack />
          </button>
          {paginationButtons()}
          <button
            onClick={() => page < pages && setPage(page + 1)}
            className="p-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            <IoIosArrowForward />
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="modal-content bg-white p-6 rounded shadow-lg">
              <h2 className="text-xl mb-4">
                Are you sure you want to delete this Poetry?
              </h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={delete_poetry}
                  className="px-6 py-2 bg-red-600 text-white rounded"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-300 text-black rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewContent;
