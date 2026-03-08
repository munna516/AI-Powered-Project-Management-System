"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import Loading from "../Loading/Loading";

const PROFILE_QUERY_KEY = ["userProfile"];
const PROFILE_GET_ENDPOINT = "/api/user/profile/me";
const PROFILE_UPDATE_ENDPOINT = "/api/user/update-profile";
const CHANGE_PASSWORD_ENDPOINT = "/api/auth/change-password";

function fetchUserProfile() {
  return apiGet(PROFILE_GET_ENDPOINT);
}

export default function SettingsContent() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    country: "",
    language: "",
    timeZone: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchUserProfile,
  });

  const profile = profileData?.data;

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        gender: (profile.gender || "").toLowerCase(),
        country: profile.country || "",
        language: profile.language || "",
        timeZone: profile.timezone || "",
      });
      setEmail(profile.email || "");
    }
  }, [profile]);

  const updateAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("avatar", file);
      return apiPatch(PROFILE_UPDATE_ENDPOINT, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      setProfileImage(null);
      setAvatarFile(null);
      toast.success("Profile picture updated successfully");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to update profile picture");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("country", data.country);
      formData.append("gender", data.gender);
      formData.append("language", data.language);
      formData.append("timezone", data.timeZone);
      return apiPatch(PROFILE_UPDATE_ENDPOINT, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success("Profile updated successfully");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      return apiPost(
        CHANGE_PASSWORD_ENDPOINT,
        {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        },
        { skip401Redirect: true }
      );
    },
    onSuccess: () => {
      setShowPasswordSection(false);
      setOldPassword("");
      setNewPassword("");
      toast.success("Password updated successfully");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to change password");
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const hasAvatarChange = avatarFile != null;
    const hasProfileChange = profile && (
      formData.firstName !== (profile.firstName || "") ||
      formData.lastName !== (profile.lastName || "") ||
      formData.country !== (profile.country || "") ||
      formData.gender !== (profile.gender || "").toLowerCase() ||
      formData.language !== (profile.language || "") ||
      formData.timeZone !== (profile.timezone || "")
    );

    if (hasAvatarChange) {
      updateAvatarMutation.mutate(avatarFile);
    }
    if (hasProfileChange) {
      updateProfileMutation.mutate({
        ...formData,
        gender: formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : "",
      });
    }

    if (!hasAvatarChange && !hasProfileChange) {
      toast.error("No changes to save");
      return;
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(null);
    setAvatarFile(null);
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        gender: (profile.gender || "").toLowerCase(),
        country: profile.country || "",
        language: profile.language || "",
        timeZone: profile.timezone || "",
      });
    }
  };

  const handlePasswordSave = () => {
    if (!oldPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Please enter your new password");
      return;
    }
    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
      toast.success("Image selected");
    } else {
      toast.error("Please select an image file (JPEG, PNG, etc.)");
    }
  };

  const hasAvatar = profileImage || profile?.avatarUrl;
  const profileImageSrc = profileImage || profile?.avatarUrl;
  const avatarInitial = (formData.firstName || profile?.firstName || "?").charAt(0).toUpperCase();
  const isSaving = updateAvatarMutation.isPending || updateProfileMutation.isPending;
  const isChangingPassword = changePasswordMutation.isPending;

  if (isLoading) {
    return <Loading  />
  }



  return (
    <Card className="p-6 md:p-8">
      <CardContent className="p-0 space-y-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden group flex-shrink-0">
              {hasAvatar ? (
                <img
                  src={profileImageSrc}
                  alt={`${formData.firstName} ${formData.lastName}`.trim() || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-white text-2xl font-semibold">
                  {avatarInitial}
                </div>
              )}
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-xs font-medium">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-sm text-slate-500">{email}</p>
            </div>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="primary"
              size="lg"
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition cursor-pointer disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Personal Info Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-500">First Name</label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`bg-slate-50 ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-500">Last Name</label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`bg-slate-50 ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-500">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`h-9 w-full rounded-md border border-primary px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-slate-50 appearance-none ${!isEditing ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Country */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-500">Country</label>
            <Input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Enter country"
              disabled={!isEditing}
              className={`bg-slate-50 ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Language */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-500">Language</label>
            <Input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              placeholder="Enter language"
              disabled={!isEditing}
              className={`bg-slate-50 ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Time Zone */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-500">Time Zone</label>
            <Input
              type="text"
              name="timeZone"
              value={formData.timeZone}
              onChange={handleInputChange}
              placeholder="Enter time zone"
              disabled={!isEditing}
              className={`bg-slate-50 ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-slate-700">Password</h3>
            {!showPasswordSection && (
              <Button
                onClick={() => setShowPasswordSection(true)}
                variant="primary"
                size="lg"
              >
                Change Password
              </Button>
            )}
          </div>

          {showPasswordSection && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Password */}
                <div className="space-y-1">
                  <label className="block text-xs text-slate-500">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="bg-slate-50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-xs text-slate-500">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-slate-50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowPasswordSection(false);
                    setOldPassword("");
                    setNewPassword("");
                  }}
                  disabled={isChangingPassword}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSave}
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition cursor-pointer disabled:opacity-70"
                >
                  {isChangingPassword ? "Saving..." : "Save Password"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Email Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-700">My email Address</h3>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MdOutlineEmail className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{email}</p>
              <p className="text-xs text-slate-400">1 month ago</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
