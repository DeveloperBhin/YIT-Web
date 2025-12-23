"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    second_name: "",
    email: "",
    phone_number: "",
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
      const res = await api.post("/signup", form);
      alert("Signup successful!");
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
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
        <h2 className="text-2xl font-bold mb-4 text-center text-black">Register</h2>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        {["first_name", "second_name", "email", "phone_number", "password"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            name={field}
            placeholder={field.replace("_", " ").toUpperCase()}
            value={(form as any)[field]}
            onChange={handleChange}
            className="border w-full p-2 mb-3 rounded-md text-black"
            required
          />
        ))}

        <button
          disabled={loading}
          className="bg-blue-600 text-white w-full p-2 rounded-md hover:bg-blue-700"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm mt-3">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-medium">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
