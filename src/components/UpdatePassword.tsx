import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("Error updating password.");
    } else {
      setMessage("Password updated successfully!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Set New Password</h2>

      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <input
          type="password"
          required
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-[#e63946] text-white py-2 rounded"
        >
          Update Password
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
};