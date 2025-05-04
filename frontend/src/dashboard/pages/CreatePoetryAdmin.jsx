import React, { useState, useContext } from "react";
import axios from "axios";
import { base_url } from "../../config/config";
import storeContext from "../../context/storeContext";
import toast from "react-hot-toast";
import { MdCloudUpload } from "react-icons/md";
import JoditEditor from "jodit-react";

const AddPoetryByAdmin = () => {
  const { store } = useContext(storeContext);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImgPreview(URL.createObjectURL(file));
  };

  // Handle Audio Change
  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    setAudio(file);
    setAudioPreview(URL.createObjectURL(file));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("username", username); // Admin-provided username
    formData.append("description", description);
    formData.append("image", image);
    if (audio) formData.append("audio", audio);

    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/api/poetry/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      setLoading(false);
      toast.success(response.data.message);
      setTitle("");
      setCategory("");
      setDescription("");
      setUsername("");
      setImage(null);
      setAudio(null);
      setImgPreview(null);
      setAudioPreview(null);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="bg-white rounded-md p-4">
      <h2 className="text-xl font-medium mb-4">Add User's Poetry</h2>

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="mb-6">
          <label
            htmlFor="username"
            className="block text-md font-medium text-gray-600"
          >
            Writer Name
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
            placeholder="Enter username for the poetry writer"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label
            htmlFor="category"
            className="block text-md font-medium text-gray-600"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
          >
            <option value="">Select Category</option>
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

        {/* Title */}
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-md font-medium text-gray-600"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
            placeholder="Enter poetry title"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label
            htmlFor="image"
            className="w-full h-[240px] flex rounded text-[#404040] gap-2 justify-center items-center cursor-pointer border-2 border-dashed"
          >
            {imgPreview ? (
              <img
                src={imgPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex justify-center items-center flex-col gap-y-2">
                <MdCloudUpload className="text-2xl" />
                <span>Select Image</span>
              </div>
            )}
          </label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-md font-medium text-gray-600"
          >
            Description
          </label>
          <JoditEditor
            value={description}
            onBlur={(newContent) => setDescription(newContent)}
            onChange={() => {}}
          />
        </div>

        {/* Audio Upload */}
        <div className="mb-6">
          <label
            htmlFor="audio"
            className="w-full h-[150px] flex rounded text-[#404040] gap-2 justify-center items-center cursor-pointer border-2 border-dashed"
          >
            {audioPreview ? (
              <audio controls className="w-full">
                <source src={audioPreview} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="flex justify-center items-center flex-col gap-y-2">
                <MdCloudUpload className="text-2xl" />
                <span>Select Audio</span>
              </div>
            )}
          </label>
          <input
            type="file"
            id="audio"
            onChange={handleAudioChange}
            className="hidden"
            accept="audio/*"
          />
        </div>

        {/* Submit Button */}
        <div className="mb-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md"
          >
            {loading ? "Submitting..." : "Submit Poetry"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPoetryByAdmin;
