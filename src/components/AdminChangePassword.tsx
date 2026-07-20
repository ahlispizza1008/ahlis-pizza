import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export const AdminChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully ✅");
      setNewPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow rounded text-left">
      <h2 className="text-xl font-bold mb-4">Change Admin Password</h2>

      <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
        <input
          type="password"
          required
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border p-3 rounded"
        />

        <input
          type="password"
          required
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-3 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[#e63946] text-white py-2 rounded font-bold"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-stone-600">{message}</p>
      )}
    </div>
  );
};