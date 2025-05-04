import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MdCloudUpload } from "react-icons/md";
import JoditEditor from "jodit-react";
import Gallery from "../components/Gallery";
import { base_url } from "../../config/config";
import axios from "axios";
import storeContext from "../../context/storeContext";
import toast from "react-hot-toast";

const Edit_poetry = () => {
  const { poetry_id } = useParams();
  const { store } = useContext(storeContext);
  const [show, setShow] = useState(false);
  const editor = useRef(null);

  const [old_image, setOldImage] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [img, setImg] = useState("");
  const [description, setDescription] = useState("");
  const [audio, setAudio] = useState("");
  const [old_audio, setOldAudio] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [loader, setLoader] = useState(false);
  const [images, setImages] = useState([]);
  const [imagesLoader, setImagesLoader] = useState(false);

  // Handle image selection
  const imageHandle = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      setImg(URL.createObjectURL(files[0]));
      setImage(files[0]);
    }
  };

  // Handle audio selection
  const audioHandle = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      setAudio(URL.createObjectURL(files[0]));
      setAudioFile(files[0]);
    }
  };

  // Submit updated poetry
  const added = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("new_image", image);
    formData.append("old_image", old_image);
    if (audioFile) formData.append("new_audio", audioFile);
    formData.append("old_audio", old_audio);

    try {
      setLoader(true);
      const { data } = await axios.put(
        `${base_url}/api/poetry/update/${poetry_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${store.token}`,
          },
        }
      );
      setLoader(false);
      toast.success(data.message);
    } catch (error) {
      setLoader(false);
      const errorMsg = error.response?.data?.message || "An error occurred";
      toast.error(errorMsg);
    }
  };

  // Fetch available images
  const get_images = async () => {
    setImagesLoader(true);
    try {
      const { data } = await axios.get(`${base_url}/api/images`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      setImages(data.images);
    } catch (error) {
      console.log(error);
    } finally {
      setImagesLoader(false);
    }
  };

  // Fetch existing poetry data
  const get_poetry = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/poetry/${poetry_id}`, {
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      // Populate state with existing poetry data
      setTitle(data?.poetry?.title || "");
      setDescription(data?.poetry?.description || "");
      setImg(data?.poetry?.image || "");
      setOldImage(data?.poetry?.image || "");
      setAudio(data?.poetry?.audio || "");
      setOldAudio(data?.poetry?.audio || "");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    get_images();
    get_poetry();
  }, [poetry_id]);

  return (
    <div className="bg-white rounded-md">
      <div className="flex justify-between p-4">
        <h2 className="text-xl font-medium">Edit Poetry</h2>
        <Link
          className="px-3 py-[6px] bg-purple-500 rounded-sm text-white hover:bg-purple-600"
          to="/dashboard/poetry"
        >
          Poetry
        </Link>
      </div>

      <div className="p-4">
        <form onSubmit={added}>
          <div className="flex flex-col gap-y-2 mb-6">
            <label
              className="text-md font-medium text-gray-600"
              htmlFor="title"
            >
              Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="Title"
              name="title"
              className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
              id="title"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="img"
              className="w-full h-[240px] flex rounded text-[#404040] gap-2 justify-center items-center cursor-pointer border-2 border-dashed"
            >
              {img ? (
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt="Selected"
                />
              ) : (
                <div className="flex justify-center items-center flex-col gap-y-2">
                  <span className="text-2xl">
                    <MdCloudUpload />
                  </span>
                  <span>Select Image</span>
                </div>
              )}
            </label>
            <input
              onChange={imageHandle}
              className="hidden"
              type="file"
              id="img"
            />
          </div>

          <div className="flex flex-col gap-y-2 mb-6">
            <div className="flex justify-start items-center gap-x-2">
              <h2>Description</h2>
              <div onClick={() => setShow(true)}>
                <span className="text-2xl cursor-pointer">
                  <MdCloudUpload />
                </span>
              </div>
            </div>
            <div>
              <JoditEditor
                ref={editor}
                value={description}
                tabIndex={1}
                onBlur={(value) => setDescription(value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="audio"
              className="w-full h-[80px] flex flex-col justify-center items-center text-gray-600 border border-dashed rounded cursor-pointer"
            >
              {audio ? (
                <audio controls src={audio} className="w-full px-4" />
              ) : (
                <span className="text-sm">Select Audio</span>
              )}
            </label>
            <input
              onChange={audioHandle}
              className="hidden"
              type="file"
              id="audio"
              accept="audio/*"
            />
          </div>

          <div className="mt-4">
            <button
              disabled={loader}
              className="px-3 py-[6px] bg-purple-500 rounded-sm text-white hover:bg-purple-600"
            >
              {loader ? "Loading..." : "Update Poetry"}
            </button>
          </div>
        </form>
      </div>

      <input
        onChange={imageHandle}
        type="file"
        multiple
        id="images"
        className="hidden"
      />
      {show && <Gallery setShow={setShow} images={images} />}
    </div>
  );
};

export default Edit_poetry;
