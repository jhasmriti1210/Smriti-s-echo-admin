import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { base_url } from "../../config/config";
import { convert } from "html-to-text";
import toast from "react-hot-toast";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import storeContext from "../../context/storeContext";

const PoetryContentUser = () => {
  const { store } = useContext(storeContext);
  const [poetry, setPoetry] = useState([]);
  const [filteredPoetry, setFilteredPoetry] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [pages, setPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [poetryToDelete, setPoetryToDelete] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState({});

  const fetchPoetry = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/getuserpoetry`);
      setPoetry(data);
      setFilteredPoetry(data);
    } catch (error) {
      toast.error("Failed to fetch poetry.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPoetry();
  }, []);

  useEffect(() => {
    setPages(Math.ceil(filteredPoetry.length / perPage));
  }, [filteredPoetry, perPage]);

  const type_filter = (e) => {
    const value = e.target.value;
    if (value === "") {
      setFilteredPoetry(poetry);
    } else {
      const tempPoetry = poetry.filter((n) => n.status === value);
      setFilteredPoetry(tempPoetry);
    }
    setPage(1);
    setPerPage(5);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);
    const filtered = poetry.filter((p) =>
      p.title.toLowerCase().includes(value)
    );
    setFilteredPoetry(filtered);
    setPage(1);
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
      fetchPoetry();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting poetry.");
    }
  };

  const paginationButtons = () => {
    return [...Array(pages).keys()].map((i) => (
      <button
        key={i}
        onClick={() => setPage(i + 1)}
        className={`px-3 py-1 rounded border ${
          page === i + 1
            ? "bg-green-500 text-white"
            : "bg-white text-black border-gray-300"
        }`}
      >
        {i + 1}
      </button>
    ));
  };

  const handleToggleDescription = (id) => {
    setExpandedDescription((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <div className="p-4">
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by title..."
          className="px-3 py-2 border rounded w-full"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Audio</th>
            </tr>
          </thead>
          <tbody>
            {filteredPoetry.length > 0 ? (
              filteredPoetry
                .slice((page - 1) * perPage, page * perPage)
                .map((item, i) => (
                  <tr key={item._id} className="bg-white border-b">
                    <td className="px-4 py-2 font-semibold text-base">
                      {(page - 1) * perPage + i + 1}
                    </td>
                    <td className="px-4 py-2 font-semibold text-base">
                      {item.fullName}
                    </td>
                    <td className="px-4 py-2 font-semibold text-base">
                      {item.email}
                    </td>
                    <td className="px-4 py-2 font-semibold text-base">
                      {item.title}
                    </td>
                    <td className="px-4 py-2 font-semibold text-base">
                      {item.category}
                    </td>
                    <td className="px-4 py-2 max-w-xs overflow-hidden">
                      {convert(item.poetryText)
                        .split(" ")
                        .slice(0, 9)
                        .join(" ")}
                      {expandedDescription[item._id] ? (
                        ` ${convert(item.poetryText)}`
                      ) : (
                        <span>...</span>
                      )}
                      <button
                        onClick={() => handleToggleDescription(item._id)}
                        className="text-blue-500"
                      >
                        {expandedDescription[item._id]
                          ? "Show Less"
                          : "Show More"}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      {item.audio ? (
                        <audio controls className="w-32">
                          <source src={item.audio} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        "No Audio"
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No poetry found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button
          onClick={() => page > 1 && setPage(page - 1)}
          className="p-2 border rounded hover:bg-gray-100"
        >
          <IoIosArrowBack />
        </button>
        {paginationButtons()}
        <button
          onClick={() => page < pages && setPage(page + 1)}
          className="p-2 border rounded hover:bg-gray-100"
        >
          <IoIosArrowForward />
        </button>
      </div>
    </div>
  );
};

export default PoetryContentUser;
