import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import { Eye, EyeClosed, Recycle } from "lucide-react";
import api from "../utils/api";
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("https://www.api.bharatscrapfacilities.com/api/admin/admin-login", {
        email: form.email,
        password: form.password,
      });

      const { accessToken, refreshToken, sessionId, user } = res.data;

      localStorage.setItem("adpt_token", accessToken);
      localStorage.setItem("adpt_refresh_token", refreshToken);
      localStorage.setItem("adpt_session_id", sessionId);
      localStorage.setItem("adpt_admin", JSON.stringify(user));
      localStorage.setItem("adpt_role", user?.role);
      localStorage.setItem("adpt_admin_id", user?._id);

      toast.success("Admin login successful");
      login(user, accessToken);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Admin Login error:", error);

      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong. Please try again.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f0] flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0f2412] flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#2e7d3210_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-md text-center">
          {/* Decorative Line */}
          <div className="flex justify-center mb-12">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#2e7d32] to-transparent" />
          </div>

          {/* Logo Icon */}
          <div className="mx-auto mb-8 w-16 h-16 bg-[#2e7d32] rounded-xl flex items-center justify-center shadow-xl shadow-[#2e7d32]/30">
            <Recycle className="w-9 h-9 text-white" />
          </div>

          {/* Brand Name */}
          <h1 className="text-5xl font-semibold text-[#f0f4f0] tracking-tight mb-2">
            Bharat Scrap
          </h1>
          <div className="text-[#6aaa6e] text-sm tracking-[4px] uppercase font-medium mb-6">
            Admin Panel
          </div>

          <p className="text-[#4a7a4e] text-lg leading-relaxed max-w-xs mx-auto">
            Buy, sell &amp; manage scrap materials with ease.
          </p>

          {/* Decorative Divider */}
          <div className="flex items-center gap-4 my-10">
            <div className="flex-1 h-px bg-[#2e7d32]/20" />
            <div className="text-[#2e7d32]">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 0L7.5 4.5H12L8.25 7.25L9.75 12L6 9L2.25 12L3.75 7.25L0 4.5H4.5Z" />
              </svg>
            </div>
            <div className="flex-1 h-px bg-[#2e7d32]/20" />
          </div>

          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 border border-[#2e7d32]/30 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#6aaa6e]" />
            <span className="text-[#6aaa6e] text-xs tracking-wide">Scrap Management System</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="w-14 h-14 bg-[#2e7d32] rounded-xl flex items-center justify-center shadow-lg shadow-[#2e7d32]/20">
              <Recycle className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              Admin Sign In
            </h2>
            <p className="text-gray-600">
              Access the Bharat Scrap dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-500 tracking-widest uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@bharatscrap.com"
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#2e7d32]/40 focus:border-[#2e7d32] transition-colors placeholder:text-gray-400"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-500 tracking-widest uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#2e7d32]/40 focus:border-[#2e7d32] transition-colors pr-12 placeholder:text-gray-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeClosed className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#2e7d32] rounded"
                />
                Remember me
              </label>
              {/* <button
                type="button"
                className="text-[#2e7d32] hover:underline font-medium"
              >
                Forgot password?
              </button> */}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2e7d32] hover:bg-[#256427] disabled:bg-[#2e7d32]/70 text-white font-semibold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#2e7d32]/30 disabled:cursor-not-allowed"
            >
              {loading ? <>Authenticating...</> : <>Sign In</>}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-10">
            © {new Date().getFullYear()} Bharat Scrap. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;