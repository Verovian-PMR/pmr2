"use client";

import { useState } from "react";

export default function ProfilePage() {
  // Demo state — in production, this comes from auth context / API
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@vivipractice.com");
  const [phone, setPhone] = useState("+44 7700 900000");
  const [role] = useState("Pharmacy Admin");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    // Demo: just show success toast
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    // Demo: just show success toast
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  }

  const inputCls =
    "w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">My Profile</h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Update your account details and password.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
          <div className="px-6 py-5 border-b border-neutral-200">
            <h3 className="text-base font-semibold text-neutral-900">Account Details</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Your personal information.</p>
          </div>
          <form onSubmit={handleProfileSave} className="p-6 space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{name}</p>
                <p className="text-xs text-neutral-500">{role}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
              <input
                type="text"
                value={role}
                disabled
                className={`${inputCls} bg-neutral-50 text-neutral-500 cursor-not-allowed`}
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                Save Changes
              </button>
              {profileSaved && (
                <span className="text-sm text-emerald-600 font-medium animate-fadeIn">
                  Profile updated!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
          <div className="px-6 py-5 border-b border-neutral-200">
            <h3 className="text-base font-semibold text-neutral-900">Change Password</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Update your login password.</p>
          </div>
          <form onSubmit={handlePasswordSave} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputCls}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputCls}
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
                placeholder="Repeat new password"
              />
            </div>

            {passwordError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {passwordError}
              </p>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                Update Password
              </button>
              {passwordSaved && (
                <span className="text-sm text-emerald-600 font-medium animate-fadeIn">
                  Password updated!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
