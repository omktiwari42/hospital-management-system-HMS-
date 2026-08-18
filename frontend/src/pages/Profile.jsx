import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";

import api from "../services/api";
import ProfileSkeleton from "../components/ProfileSkeleton";

import {
  FaEdit,
  FaTimes,
  FaCamera,
} from "react-icons/fa";

import { hmsToast } from "../utils/hmsToast";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  /* ===========================
     PROFILE PHOTO
  =========================== */

  const [uploading, setUploading] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [showCropper, setShowCropper] =
    useState(false);

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] =
    useState(1);

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState(null);

  /* ===========================
     PROFILE FORM
  =========================== */

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    gender: "",
    dob: "",
    emergency_contact: "",
    blood_group: "",
    allergies: "",
    medical_history: "",
  });

  /* ===========================
     LOAD PROFILE
  =========================== */

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(
        "/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user =
        response.data;

      setProfile(user);

      setForm({
        full_name:
          user.full_name || "",

        email:
          user.email || "",

        gender:
          user.gender || "",

        dob:
          user.dob || "",

        emergency_contact:
          user.emergency_contact || "",

        blood_group:
          user.blood_group || "",

        allergies:
          user.allergies || "",

        medical_history:
          user.medical_history || "",
      });

      /*
       * The database is the source of truth.
       * Synchronize sessionStorage with the
       * authenticated user's actual profile.
       */

      if (user.profile_image) {
        sessionStorage.setItem(
          "profile_image",
          user.profile_image
        );
      } else {
        sessionStorage.removeItem(
          "profile_image"
        );
      }

      sessionStorage.setItem(
        "full_name",
        user.full_name || "User"
      );

      sessionStorage.setItem(
        "role",
        user.role || ""
      );

      window.dispatchEvent(
        new Event("userUpdated")
      );

    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      if (
        error.response?.status ===
        401 ||
        error.response?.status ===
        403
      ) {
        sessionStorage.clear();
        localStorage.removeItem(
          "token"
        );

        navigate("/login");
      }

    } finally {
      setLoading(false);
    }
  }

  /* ===========================
     UPDATE PROFILE
  =========================== */

  async function updateProfile() {
    try {
      const token =
        sessionStorage.getItem("token");

      await api.put(
        "/profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      sessionStorage.setItem(
        "full_name",
        form.full_name
      );

      setProfile((prev) => ({
        ...prev,
        ...form,
      }));

      window.dispatchEvent(
        new Event("userUpdated")
      );

      setShowEdit(false);

      hmsToast.success(
        "Profile updated successfully!",
        "Your profile information has been saved."
      );

    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      hmsToast.error(
        err.response?.data?.message ||
        "Failed to update profile."
      );
    }
  }

  /* ===========================
     SELECT PHOTO
  =========================== */

  function handleImageSelect(e) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      hmsToast.error(
        "Invalid image",
        "Please select JPG, PNG, or WEBP."
      );

      e.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      hmsToast.error(
        "Image too large",
        "Profile photo must be smaller than 5 MB."
      );

      e.target.value = "";
      return;
    }

    const imageUrl =
      URL.createObjectURL(file);

    setSelectedImage(
      imageUrl
    );

    setShowCropper(true);

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);

    setCroppedAreaPixels(
      null
    );

    e.target.value = "";
  }

  /* ===========================
     CROP COMPLETE
  =========================== */

  function onCropComplete(
    _,
    croppedPixels
  ) {
    setCroppedAreaPixels(
      croppedPixels
    );
  }

  /* ===========================
     CREATE CROPPED IMAGE
  =========================== */

  function getCroppedImage(
    imageSrc,
    pixelCrop
  ) {
    return new Promise(
      (resolve, reject) => {
        const image =
          new Image();

        image.onload = () => {
          const canvas =
            document.createElement(
              "canvas"
            );

          const ctx =
            canvas.getContext("2d");

          if (!ctx) {
            reject(
              new Error(
                "Canvas context unavailable"
              )
            );

            return;
          }

          canvas.width =
            pixelCrop.width;

          canvas.height =
            pixelCrop.height;

          ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
          );

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(
                  new Error(
                    "Unable to create cropped image"
                  )
                );

                return;
              }

              const file =
                new File(
                  [blob],
                  "profile-photo.jpg",
                  {
                    type:
                      "image/jpeg",
                  }
                );

              resolve(file);
            },
            "image/jpeg",
            0.92
          );
        };

        image.onerror = () => {
          reject(
            new Error(
              "Unable to load selected image"
            )
          );
        };

        image.src =
          imageSrc;
      }
    );
  }

  /* ===========================
     SAVE CROPPED PHOTO
  =========================== */

  async function saveCroppedPhoto() {
    if (
      !selectedImage ||
      !croppedAreaPixels
    ) {
      return;
    }

    try {
      setUploading(true);

      const croppedFile =
        await getCroppedImage(
          selectedImage,
          croppedAreaPixels
        );

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const data =
        new FormData();

      data.append(
        "image",
        croppedFile
      );

      const res =
        await api.post(
          "/profile/upload-image",
          data,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const imageName =
        res.data.image;

      setProfile((prev) => ({
        ...prev,
        profile_image:
          imageName,
      }));

      sessionStorage.setItem(
        "profile_image",
        imageName
      );

      window.dispatchEvent(
        new Event("userUpdated")
      );

      hmsToast.success(
        "✅ Profile photo updated successfully!",
        "Your new profile picture is now visible."
      );

      closeCropper();

    } catch (error) {
      console.error(
        "Crop/upload error:",
        error
      );

      hmsToast.error(
        error.response?.data
          ?.message ||
        "Unable to update your profile photo."
      );

    } finally {
      setUploading(false);
    }
  }

  /* ===========================
     CLOSE CROPPER
  =========================== */

  function closeCropper() {
    if (selectedImage) {
      URL.revokeObjectURL(
        selectedImage
      );
    }

    setSelectedImage(null);

    setShowCropper(false);

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);

    setCroppedAreaPixels(
      null
    );
  }

  /* ===========================
     DELETE PHOTO
  =========================== */

  async function deletePhoto() {
    if (!profile.profile_image) {
      return;
    }

    try {
      setUploading(true);

      const token =
        sessionStorage.getItem("token");

      await api.delete(
        "/profile/delete-image",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      /*
       * Immediately remove image
       * from React state.
       */
      setProfile((prev) => ({
        ...prev,
        profile_image: null,
      }));

      /*
       * Remove cached image.
       */
      sessionStorage.removeItem(
        "profile_image"
      );

      /*
       * Immediately update Navbar.
       */
      window.dispatchEvent(
        new Event("userUpdated")
      );

      hmsToast.success(
        "🗑️ Profile photo removed successfully!",
        "Your default profile icon is now visible."
      );

    } catch (err) {
      console.error(
        "Profile photo delete error:",
        err
      );

      hmsToast.error(
        err.response?.data
          ?.message ||
        "Failed to remove profile photo."
      );

    } finally {
      setUploading(false);
    }
  }

  /* ===========================
     LOADING
  =========================== */

  if (loading) {
    return <ProfileSkeleton />;
  }

  /* ===========================
     PROFILE IMAGE URL
  =========================== */

  const profileImageUrl =
    profile.profile_image
      ? `${import.meta.env.VITE_API_URL.replace(
        /\/api\/?$/,
        ""
      )}/uploads/${profile.profile_image}`
      : null;

  /* ===========================
     UI
  =========================== */

  return (
    <div className="profile-page page">

      {/* ===========================
          PAGE HEADER
      =========================== */}

      <div className="page-header">

        <button
          className="back-btn"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>

        <h1>
          My Profile
        </h1>

        <div className="profile-actions">

          <button
            className="edit-profile-btn"
            onClick={() =>
              setShowEdit(true)
            }
          >
            <FaEdit />
            Edit Profile
          </button>

        </div>

      </div>

      {/* ===========================
          PROFILE CARD
      =========================== */}

      <div className="profile-card">

        {/* ===========================
            AVATAR
        =========================== */}

        <div className="profile-avatar-section">

          <div
            className={`profile-avatar ${uploading
                ? "profile-avatar-uploading"
                : ""
              }`}
          >

            {profileImageUrl ? (

              <img
                src={profileImageUrl}
                alt="Profile"
                className="profile-avatar-image"
              />

            ) : (

              <span className="profile-avatar-initial">

                {(
                  profile.full_name ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}

              </span>

            )}

            {uploading && (

              <div className="profile-avatar-overlay">

                <span className="upload-spinner"></span>

              </div>

            )}

          </div>

          {/* Hidden File Input */}

          <input
            id="profile-photo-input"
            hidden
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleImageSelect}
            disabled={uploading}
          />

          {/* Photo Buttons */}

          <div className="profile-photo-actions">

            <button
              type="button"
              className="change-photo-btn"
              onClick={() =>
                document
                  .getElementById(
                    "profile-photo-input"
                  )
                  ?.click()
              }
              disabled={uploading}
            >
              <FaCamera />

              {uploading
                ? "Updating..."
                : "Change Photo"}
            </button>

            {profile.profile_image && (

              <button
                type="button"
                className="delete-photo-btn"
                onClick={
                  deletePhoto
                }
                disabled={uploading}
              >
                🗑️ Remove Photo
              </button>

            )}

          </div>

          {uploading && (

            <div className="profile-photo-status">

              <span className="status-spinner"></span>

              Updating profile photo...

            </div>

          )}

        </div>

        {/* ===========================
            PROFILE DETAILS
        =========================== */}

        <div className="profile-details">

          <span className="role-badge">

            {profile.role ||
              "User"}

          </span>

          <div className="profile-grid">

            <div className="profile-item">

              <label>
                Full Name
              </label>

              <p>
                {profile.full_name ||
                  "-"}
              </p>

            </div>

            <div className="profile-item">

              <label>
                Phone Number
              </label>

              <p>
                {profile.phone ||
                  "-"}
              </p>

            </div>

            <div className="profile-item">

              <label>
                Email
              </label>

              <p>
                {profile.email ||
                  "Not Added"}
              </p>

            </div>

            <div className="profile-item">

              <label>
                Gender
              </label>

              <p>
                {profile.gender ||
                  "Not Added"}
              </p>

            </div>

            <div className="profile-item">

              <label>
                Date of Birth
              </label>

              <p>
                {profile.dob
                  ? new Date(
                    profile.dob
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month:
                        "long",
                      year:
                        "numeric",
                    }
                  )
                  : "Not Added"}
              </p>

            </div>

            <div className="profile-item">

              <label>
                Blood Group
              </label>

              <p>
                {profile.blood_group ||
                  "Not Added"}
              </p>

            </div>

            <div className="profile-item">

              <label>
                Emergency Contact
              </label>

              <p>
                {profile.emergency_contact ||
                  "Not Added"}
              </p>

            </div>

            <div className="profile-item">

              <label>
                Role
              </label>

              <p>
                {profile.role ||
                  "Not Added"}
              </p>

            </div>

            <div className="profile-item">

              <label>
                Account Status
              </label>

              <p className="status-active">
                Active
              </p>

            </div>

          </div>

          {/* Allergies */}

          <div className="profile-section">

            <h3>
              🩺 Allergies
            </h3>

            <div className="profile-box">

              {profile.allergies ||
                "No allergies recorded."}

            </div>

          </div>

          {/* Medical History */}

          <div className="profile-section">

            <h3>
              📋 Medical History
            </h3>

            <div className="profile-box">

              {profile.medical_history ||
                "No medical history available."}

            </div>

          </div>

        </div>

      </div>

      {/* ===========================
          EDIT PROFILE MODAL
      =========================== */}

      {showEdit && (

        <div className="profile-modal">

          <div className="profile-modal-content">

            <div className="profile-modal-header">

              <h2>
                Edit Profile
              </h2>

              <button
                onClick={() =>
                  setShowEdit(false)
                }
              >
                <FaTimes />
              </button>

            </div>

            <input
              placeholder="Full Name"
              value={
                form.full_name
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  full_name:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Email"
              value={
                form.email
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Gender"
              value={
                form.gender
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  gender:
                    e.target.value,
                })
              }
            />

            <input
              type="date"
              value={
                form.dob
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  dob:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Emergency Contact"
              value={
                form.emergency_contact
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  emergency_contact:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Blood Group"
              value={
                form.blood_group
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  blood_group:
                    e.target.value,
                })
              }
            />

            <textarea
              rows="3"
              placeholder="Allergies"
              value={
                form.allergies
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  allergies:
                    e.target.value,
                })
              }
            />

            <textarea
              rows="4"
              placeholder="Medical History"
              value={
                form.medical_history
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  medical_history:
                    e.target.value,
                })
              }
            />

            <div className="profile-modal-footer">

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowEdit(false)
                }
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={
                  updateProfile
                }
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ===========================
          INSTAGRAM STYLE CROPPER
      =========================== */}

      {showCropper &&
        selectedImage && (

          <div className="photo-crop-modal">

            <div className="photo-crop-container">

              {/* Header */}

              <div className="photo-crop-header">

                <h2>
                  Adjust Profile Photo
                </h2>

                <button
                  type="button"
                  onClick={
                    closeCropper
                  }
                  disabled={
                    uploading
                  }
                >
                  <FaTimes />
                </button>

              </div>

              {/* Crop Area */}

              <div className="photo-crop-area">

                <Cropper
                  image={
                    selectedImage
                  }
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  objectFit="contain"
                  onCropChange={
                    setCrop
                  }
                  onZoomChange={
                    setZoom
                  }
                  onCropComplete={
                    onCropComplete
                  }
                />

              </div>

              {/* Zoom */}

              <div className="crop-controls">

                <span>
                  Zoom
                </span>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) =>
                    setZoom(
                      Number(
                        e.target.value
                      )
                    )
                  }
                />

              </div>

              {/* Buttons */}

              <div className="photo-crop-actions">

                <button
                  type="button"
                  className="crop-cancel-btn"
                  onClick={
                    closeCropper
                  }
                  disabled={
                    uploading
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="crop-save-btn"
                  onClick={
                    saveCroppedPhoto
                  }
                  disabled={
                    uploading
                  }
                >
                  {uploading
                    ? "Uploading..."
                    : "Done"}
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Profile;