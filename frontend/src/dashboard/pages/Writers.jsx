import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaTrash } from "react-icons/fa";
import axios from "axios";
import { base_url } from "../../config/config";
import storeContext from "../../context/storeContext";
import toast from "react-hot-toast";

const Writers = () => {
  const { store } = useContext(storeContext);
  const [writers, setWriters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [writerToDelete, setWriterToDelete] = useState(null);

  const get_writers = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/poetry/writers`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      setWriters(data.writers);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load writers.");
    }
  };

  useEffect(() => {
    get_writers();
  }, []);

  const delete_writer = async () => {
    try {
      setShowModal(false);
      const { data } = await axios.delete(
        `${base_url}/api/poetry/writer/delete`,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
          data: {
            id: writerToDelete._id,
          },
        }
      );
      toast.success(data.message); // Show success toast
      get_writers(); // Refresh the list of writers
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="bg-white rounded-md">
      <div className="flex justify-between p-4">
        <h2 className="text-xl font-medium">Writers</h2>
        <Link
          className="px-3 py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-800"
          to="/dashboard/writer/add"
        >
          Add Writer
        </Link>
      </div>
      <div className="relative overflow-x-auto p-4">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-7 py-3">No.</th>
              <th className="px-7 py-3">Writer's Name</th>
              <th className="px-7 py-3">Category</th>
              <th className="px-7 py-3">Role</th>
              <th className="px-7 py-3">Image</th>
              <th className="px-7 py-3">Email</th>
              <th className="px-7 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {writers.map((r, i) => (
              <tr key={i} className="bg-white border-b">
                <td className="px-6 py-4">{i + 1}</td>
                <td className="px-6 py-4">{r.name}</td>
                <td className="px-6 py-4">{r.category}</td>
                <td className="px-6 py-4">{r.role}</td>
                <td className="px-6 py-4">
                  <img
                    className="w-[40px] h-[40px]"
                    src="/assets/mylogo.png"
                    alt="img"
                  />
                </td>
                <td className="px-6 py-4">{r.email}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-start items-center gap-x-4 text-white">
                    <Link
                      to={`/dashboard/writer/${r._id}`}
                      className="p-[6px] bg-green-500 rounded hover:shadow-lg hover:shadow-green-500/50"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => {
                        setWriterToDelete(r);
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

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">
                Are you sure you want to delete writer "{writerToDelete?.name}"?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={delete_writer}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Writers;
