import React, { useContext, useState } from "react";
import { FaImage } from "react-icons/fa";
import storeContext from "../../context/storeContext";
import axios from "axios";
import { base_url } from "../../config/config";

const Profile = () => {
  const { store, setStore } = useContext(storeContext);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check for valid file type (e.g., image/jpeg, image/png)
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }

      // Prepare form data to upload the image
      const formData = new FormData();
      formData.append("file", file);

      setLoading(true); // Show loading state

      try {
        // Send the file to your backend or cloud service
        const response = await axios.post(
          `${base_url}/api/upload-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("poetryToken")}`,
            },
          }
        );

        // If the upload is successful, store the image URL in store/context
        if (response.status === 200) {
          const imageUrl = response.data.imageUrl; // Assuming the backend returns the image URL
          setStore((prevState) => ({
            ...prevState,
            userInfo: {
              ...prevState.userInfo,
              profileImage: imageUrl,
            },
          }));
          setSuccess("Image uploaded successfully.");
        }
      } catch (err) {
        console.error("Image upload failed:", err);
        setError("Failed to upload image. Please try again.");
      } finally {
        setLoading(false); // Hide loading state
      }
    }
  };

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check if both old and new passwords are filled
    if (!oldPassword || !newPassword) {
      setError("Please fill in both fields");
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem("poetryToken");

      // Check if token exists
      if (!token) {
        setError("No token found. Please log in again.");
        return;
      }

      // Send the password change request
      const response = await axios.put(
        `${base_url}/api/change-password`,
        { old_password: oldPassword, new_password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccess("Password updated successfully");
        setOldPassword("");
        setNewPassword("");
      }
    } catch (error) {
      console.error(error); // Log for debugging
      setError(error.response?.data?.message || "An error occurred");
    }

    // Clear messages after 3 seconds
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };
  return (
    <div className="w-full grid grid-cols-2 gap-x-6 mt-5">
      <div className="bg-white gap-x-3 p-6 rounded flex justify-center items-center">
        <div>
          <label
            htmlFor="img"
            className={`w-[150px] h-[150px] flex rounded text-[#404040] gap-2 justify-center items-center cursor-pointer border-2 border-dashed`}
          >
            <div className="flex justify-center items-center flex-col gap-y-2">
              <span className="text-2xl">
                <FaImage />
              </span>
              <span>Select Image</span>
            </div>
          </label>
          <input
            className="hidden"
            type="file"
            id="img"
            onChange={handleImageUpload}
          />
          {loading ? (
            <div className="w-[150px] h-[150px] flex justify-center items-center">
              <span>Loading...</span>
            </div>
          ) : (
            store.userInfo?.profileImage && (
              <img
                src={store.userInfo?.profileImage}
                alt="Profile"
                className="w-[150px] h-[150px] rounded-full mt-3"
              />
            )
          )}
        </div>
        <div className="text-[#404040] flex flex-col gap-y-1 justify-center items-start">
          <span className="font-bold">Name: {store.userInfo?.name}</span>
          <span className="font-bold">Email: {store.userInfo?.email}</span>
          <span className="font-bold">
            Category: {store.userInfo?.category}
          </span>
        </div>
      </div>
      <div className="bg-white px-6 py-4 text-[#404040]">
        <h2 className="pb-3 text-center">Change password</h2>

        <form onSubmit={handlePasswordChange}>
          {error && (
            <div className="text-red-500 text-center mb-3">{error}</div>
          )}
          {success && (
            <div className="text-green-500 text-center mb-3">{success}</div>
          )}
          <div className="grid grid-cols-1 gap-y-5 mb-3">
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-col gap-y-2">
                <label
                  className="text-md font-medium text-gray-600"
                  htmlFor="old_password"
                >
                  Old Password
                </label>
                <input
                  type="password"
                  id="old_password"
                  name="old_password"
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Old Password"
                  className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
                />
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-col gap-y-2">
                <label
                  className="text-md font-medium text-gray-600"
                  htmlFor="new_password"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="New Password"
                  className="px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10"
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="px-3 py-[6px] bg-green-700 rounded-sm text-white hover:bg-green-800"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
