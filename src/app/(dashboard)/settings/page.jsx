"use client";
import { useState } from "react";
import Image from "next/image";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Settings() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Dummy user data
  const [formData, setFormData] = useState({
    firstName: "Alexa",
    lastName: "Rawles",
    gender: "female",
    country: "us",
    language: "en",
    timeZone: "pst",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  const handlePasswordSave = () => {
    setShowPasswordSection(false);
    toast.success("Password updated successfully");
  };

  return (
    <Card className="p-6 md:p-8">
      <CardContent className="p-0 space-y-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <Image
                src="https://cdn.pixabay.com/photo/2024/09/23/10/39/man-9068618_640.jpg"
                alt="Alexa Rawles"
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-sm text-slate-500">alexarawles@gmail.com</p>
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
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition cursor-pointer"
              >
                Save
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
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`h-9 w-full rounded-md border border-primary px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-slate-50 appearance-none ${!isEditing ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <option value="">Select Country</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="in">India</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-500">Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`h-9 w-full rounded-md border border-primary px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-slate-50 appearance-none ${!isEditing ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <option value="">Select Language</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          {/* Time Zone */}
          <div className="space-y-1">
            <label className="block text-xs text-slate-500">Time Zone</label>
            <select
              name="timeZone"
              value={formData.timeZone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`h-9 w-full rounded-md border border-primary px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-slate-50 appearance-none ${!isEditing ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <option value="">Select Time Zone</option>
              <option value="pst">Pacific Time (PST)</option>
              <option value="est">Eastern Time (EST)</option>
              <option value="utc">UTC</option>
            </select>
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
                  onClick={() => setShowPasswordSection(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSave}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition cursor-pointer"
                >
                  Save Password
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
              <p className="text-sm font-medium text-slate-800">alexarawles@gmail.com</p>
              <p className="text-xs text-slate-400">1 month ago</p>
            </div>
          </div>

          <button className="px-4 py-2 bg-blue-100 text-blue-500 text-sm font-medium rounded-lg hover:bg-blue-200 transition cursor-pointer">
            + Add Email Address
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
