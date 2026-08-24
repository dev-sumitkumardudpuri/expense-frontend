import React, { useState, useEffect } from "react";
import { FiX, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AuthModal({ isOpen, onClose, isSignup, onLoginSuccess, theme }) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", email: "", password: "" });
      setShowPassword(false);
    }
  }, [isOpen]);

  // Email validation filter for primary domain registration
  const validateRealEmail = (email) => {
    const allowedDomains =
      /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail|icloud)\.[a-zA-Z]{2,}$/i;
    return allowedDomains.test(email);
  };

  // Google OAuth pipeline integration
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const toastId = toast.loading("Verifying Google account...");
      try {
        const userInfoResponse = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        const userInfo = userInfoResponse.data;

        const response = await axios.post(
          `${BACKEND_BASE}/api/auth/google-login`,
          {
            name: userInfo.name || "Google Guest",
            email: userInfo.email,
          },
        );

        const data = response.data;

        if (data.success) {
          toast.success(data.message || "Login successful!", { id: toastId });
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (onLoginSuccess) onLoginSuccess(data.user);
          onClose();
          navigate("/dashboard");
        } else {
          toast.error(data.message || "Failed to log in.", { id: toastId });
        }
      } catch (error) {
        console.error("Google authentication error:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to verify profile with Google.",
          { id: toastId },
        );
      }
    },
    onError: (error) => {
      console.error("Google login initiation failed:", error);
      toast.error("Google authentication process was cancelled.");
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Credentials form submission workflow
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    if (
      !submissionData.email ||
      !submissionData.password ||
      (isSignup && !submissionData.name)
    ) {
      toast.error("Please fill in all fields properly.");
      return;
    }

    if (isSignup && !validateRealEmail(submissionData.email)) {
      toast.error(
        "Please use a genuine email provider (Gmail, Outlook, Yahoo, iCloud).",
      );
      return;
    }

    setLoading(true);
    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";

    try {
      const response = await axios.post(
        `${BACKEND_BASE}${endpoint}`,
        submissionData,
      );
      const data = response.data;

      if (data.success) {
        toast.success(data.message || "Success!");
        if (isSignup) {
          onClose();
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (onLoginSuccess) onLoginSuccess(data.user);
          onClose();
          navigate("/dashboard");
        }
      } else {
        toast.error(data.message || "Authentication failed.");
      }
    } catch (error) {
      console.error("Auth submission error:", error);
      const serverMessage = error.response?.data?.message;
      toast.error(serverMessage || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl p-8 shadow-2xl transition-all duration-300 border ${
          theme === "dark"
            ? "bg-zinc-950 border-zinc-800 text-zinc-100 shadow-black/50"
            : "bg-white border-zinc-200 text-zinc-900 shadow-zinc-300/40"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-4 top-4 transition-colors cursor-pointer ${
            theme === "dark"
              ? "text-zinc-500 hover:text-zinc-200"
              : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          <FiX size={22} />
        </button>

        {/* Heading */}
        <h2 className="text-xl font-black text-center tracking-tight uppercase">
          {isSignup ? "Create " : "Welcome "}
          <span
            className={theme === "dark" ? "text-teal-400" : "text-teal-600"}
          >
            {isSignup ? "Account" : "Back"}
          </span>
        </h2>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignup && (
            <div className="relative">
              <FiUser className="absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="text"
                name="name"
                required={isSignup}
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full pl-11 pr-4 py-3 border font-medium bg-transparent rounded-xl text-sm focus:outline-none transition-all duration-200 ${
                  theme === "dark"
                    ? "border-zinc-800 focus:border-teal-500 text-white placeholder-zinc-600"
                    : "border-zinc-200 focus:border-zinc-950 text-zinc-900 placeholder-zinc-400"
                }`}
              />
            </div>
          )}

          <div className="relative">
            <FiMail className="absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-11 pr-4 py-3 border font-medium bg-transparent rounded-xl text-sm focus:outline-none transition-all duration-200 ${
                theme === "dark"
                  ? "border-zinc-800 focus:border-teal-500 text-white placeholder-zinc-600"
                  : "border-zinc-200 focus:border-zinc-950 text-zinc-900 placeholder-zinc-400"
              }`}
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full pl-11 pr-12 py-3 border font-medium bg-transparent rounded-xl text-sm focus:outline-none transition-all duration-200 ${
                theme === "dark"
                  ? "border-zinc-800 focus:border-teal-500 text-white placeholder-zinc-600"
                  : "border-zinc-200 focus:border-zinc-950 text-zinc-900 placeholder-zinc-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-3.5 transition-colors ${
                theme === "dark"
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer active:scale-98 shadow-md disabled:opacity-50 ${
              theme === "dark"
                ? "bg-teal-500 text-zinc-950 hover:bg-teal-400 shadow-teal-500/10"
                : "bg-zinc-950 text-white hover:bg-zinc-800"
            }`}
          >
            {loading ? "PROCESSING..." : isSignup ? "SIGN UP" : "LOG IN"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div
            className={`w-full border-t ${theme === "dark" ? "border-zinc-800" : "border-zinc-200"}`}
          ></div>
          <span
            className={`absolute px-3 text-[10px] font-bold tracking-widest ${
              theme === "dark"
                ? "bg-zinc-950 text-zinc-600"
                : "bg-white text-zinc-400"
            }`}
          >
            OR
          </span>
        </div>

        {/* Corrected & Fixed Google OAuth Button */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          className={`w-full flex items-center justify-center gap-3 py-3 px-4 border font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-sm ${
            theme === "dark"
              ? "border-zinc-800 text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900"
              : "border-zinc-200 text-zinc-700 bg-zinc-50 hover:bg-zinc-100"
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
        <p
          className="font-bold"
          style={{ fontSize: "12px", color: "gray", marginTop: "10px" }}
        >
          Demo Credentials: <br /> Email: user@gmail.com Password: user
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
