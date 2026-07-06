import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShieldCheck,
  Mail,
  Fingerprint,
  Edit3,
  X,
  Save,
  Coins,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

const CURRENCY_OPTIONS = [
  { value: "₹", label: "INR (₹) - Indian Rupee" },
  { value: "$", label: "USD ($) - US Dollar" },
  { value: "€", label: "EUR (€) - Euro" },
  { value: "£", label: "GBP (£) - British Pound" },
];

function ProfileTab({ user, theme, onSaveProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currency: user?.currency || "₹",
  });

  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currencyRef = useRef(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      currency: user?.currency || "₹",
    });
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!onSaveProfile) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveProfile(formData);
      setIsEditing(false);
      showNotification(
        "Profile and Currency settings updated successfully!",
        "success",
      );
    } catch (error) {
      console.error("Form submit error:", error);
      const serverErrorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile. Server error.";
      showNotification(serverErrorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrencyDropdownOpen(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      currency: user?.currency || "₹",
    });
  };

  const userId = user?.id || user?._id || "System verification pending";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const elementVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  const dropdownItemStyle = (itemValue, currentFormValue) => {
    const isSelected = itemValue === currentFormValue;
    if (theme === "dark") {
      return `px-3 py-2.5 text-left rounded-lg transition-colors cursor-pointer text-xs w-full ${
        isSelected
          ? "bg-zinc-800 text-white font-bold"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`;
    } else {
      return `px-3 py-2.5 text-left rounded-lg transition-colors cursor-pointer text-xs w-full ${
        isSelected
          ? "bg-zinc-100 text-zinc-900 font-bold"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      }`;
    }
  };

  return (
    <>
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 140, damping: 15 }}
            className={`fixed top-6 right-6 z-9999 flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-xs font-bold shadow-lg backdrop-blur-md transition-all ${
              theme === "dark"
                ? "bg-zinc-900/90 border-zinc-800 text-white"
                : "bg-white/90 border-zinc-100 text-zinc-900 shadow-zinc-200/50"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
            )}
            <p className="tracking-tight pr-2">{toast.message}</p>
            <button
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              className="text-zinc-400 hover:text-zinc-500 transition-colors p-0.5 rounded-md"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 max-w-xl pb-24 md:pb-6 select-none text-sans transform-gpu"
      >
        <motion.div
          variants={elementVariants}
          layout="position"
          className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300 ${
            theme === "dark"
              ? "bg-zinc-900/40 border-zinc-900 text-white"
              : "bg-white border-zinc-100 text-zinc-900 shadow-sm"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center text-xl font-bold border border-teal-500/20 tracking-wider shrink-0 shadow-inner">
              {getInitials(formData.name)}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-base font-bold tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
                {formData.name || "Verified User"}
                <ShieldCheck
                  size={16}
                  className="text-teal-500 inline drop-shadow-sm"
                />
              </h3>
              <p className="text-xs font-semibold text-zinc-400 flex items-center justify-center sm:justify-start gap-2">
                Account Status:
                <span className="text-emerald-500 font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  Active
                </span>
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 active:scale-95 ${
                theme === "dark"
                  ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
              }`}
            >
              <Edit3 size={13} /> Edit Profile
            </button>
          )}
        </motion.div>

        <motion.div
          variants={elementVariants}
          layout="position"
          className={`p-6 rounded-2xl border transition-colors duration-300 ${
            theme === "dark"
              ? "bg-zinc-900/40 border-zinc-900 text-white"
              : "bg-white border-zinc-100 text-zinc-900 shadow-sm"
          }`}
        >
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h4 className="text-sm font-bold tracking-tight">
                Account Profile Settings
              </h4>
              <p
                className={`text-[11px] font-semibold mt-0.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
              >
                Manage your verified primary account attributes and secure
                identification.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-bold">
            <div>
              <span
                className={`font-semibold flex items-center gap-1.5 mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
              >
                <User size={13} className="opacity-70" /> Full Name
              </span>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full p-3.5 rounded-xl border font-bold tracking-tight outline-none transition-all duration-200 text-xs ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 disabled:opacity-50"
                      : "bg-white border-zinc-200 text-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 shadow-sm disabled:opacity-50"
                  }`}
                  placeholder="Enter full name"
                />
              ) : (
                <p
                  className={`p-3.5 rounded-xl border font-bold tracking-tight ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-800 text-zinc-100"
                      : "bg-zinc-50 border-zinc-200/60 text-zinc-800"
                  }`}
                >
                  {formData.name || "Data stream unavailable"}
                </p>
              )}
            </div>

            <div>
              <span
                className={`font-semibold flex items-center gap-1.5 mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
              >
                <Mail size={13} className="opacity-70" /> Email Address
              </span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full p-3.5 rounded-xl border font-bold tracking-tight outline-none transition-all duration-200 text-xs ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 disabled:opacity-50"
                      : "bg-white border-zinc-200 text-zinc-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 shadow-sm disabled:opacity-50"
                  }`}
                  placeholder="Enter email address"
                />
              ) : (
                <p
                  className={`p-3.5 rounded-xl border font-bold tracking-tight ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-800 text-zinc-100"
                      : "bg-zinc-50 border-zinc-200/60 text-zinc-800"
                  }`}
                >
                  {formData.email || "Data stream unavailable"}
                </p>
              )}
            </div>

            <div ref={currencyRef} className="relative">
              <span
                className={`font-semibold flex items-center gap-1.5 mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
              >
                <Coins size={13} className="opacity-70" /> Primary Currency
              </span>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      setCurrencyDropdownOpen(!currencyDropdownOpen)
                    }
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold tracking-tight outline-none transition-all duration-150 text-xs text-left cursor-pointer disabled:opacity-50 ${
                      currencyDropdownOpen
                        ? theme === "dark"
                          ? "border-teal-500/50 ring-1 ring-teal-500/30"
                          : "border-teal-500 ring-1 ring-teal-500/20"
                        : ""
                    } ${
                      theme === "dark"
                        ? "bg-zinc-950 border-zinc-800 text-zinc-100"
                        : "bg-white border-zinc-200 text-zinc-800 shadow-sm"
                    }`}
                  >
                    <span>
                      {CURRENCY_OPTIONS.find(
                        (opt) => opt.value === formData.currency,
                      )?.label || "Select Currency"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-zinc-400 transition-transform duration-200 ${currencyDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {currencyDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute settle-dropdown z-50 mt-1 w-full p-1.5 rounded-xl border shadow-xl flex flex-col gap-1 ${
                          theme === "dark"
                            ? "bg-zinc-950 border-zinc-800"
                            : "bg-white border-zinc-200"
                        }`}
                      >
                        {CURRENCY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                currency: opt.value,
                              }));
                              setCurrencyDropdownOpen(false);
                            }}
                            className={dropdownItemStyle(
                              opt.value,
                              formData.currency,
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <p
                  className={`p-3.5 rounded-xl border font-bold tracking-tight ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-800 text-zinc-100"
                      : "bg-zinc-50 border-zinc-200/60 text-zinc-800"
                  }`}
                >
                  {formData.currency === "₹" && "INR (₹)"}
                  {formData.currency === "$" && "USD ($)"}
                  {formData.currency === "€" && "EUR (€)"}
                  {formData.currency === "£" && "GBP (£)"}
                </p>
              )}
            </div>

            <div>
              <span
                className={`font-semibold flex items-center gap-1.5 mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
              >
                <Fingerprint size={13} className="opacity-70" /> User Security
                ID
              </span>
              <div
                className={`p-3.5 rounded-xl border font-mono tracking-wider text-[11px] flex items-center justify-between ${
                  theme === "dark"
                    ? "bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60"
                    : "bg-zinc-50 border-zinc-200/60 text-zinc-400 opacity-70"
                }`}
              >
                <span className="truncate pr-4">{userId}</span>
              </div>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex items-center justify-end gap-2.5 pt-2"
                >
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-50 ${
                      theme === "dark"
                        ? "bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        : "bg-transparent border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                    }`}
                  >
                    <X size={13} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-white hover:bg-teal-600 transition-all active:scale-95 shadow-sm shadow-teal-500/10 disabled:bg-teal-600/70"
                  >
                    <Save size={13} />{" "}
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default ProfileTab;
