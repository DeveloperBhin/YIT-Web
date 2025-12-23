"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    type: "email",
    value: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("login", form);
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      router.push("/dashboard"); // redirect to homepage or dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <select
          name="type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border w-full p-2 mb-3 rounded-md"
        >
          <option value="email">Login with Email</option>
          <option value="phone">Login with Phone</option>
        </select>

        <input
          type="text"
          name="value"
          placeholder={form.type === "email" ? "Email" : "Phone number"}
          value={form.value}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded-md"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded-md"
          required
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white w-full p-2 rounded-md hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm mt-3">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 font-medium">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
