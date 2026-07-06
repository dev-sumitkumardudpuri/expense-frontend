import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ShieldCheck,
  PieChart,
  Calendar,
  AlertCircle,
  X,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const BUDGET_CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Entertainment & Subscriptions",
  "Bills & Utilities",
  "Shopping & Lifestyle",
  "Travel & Transport",
  "Investment & Savings",
  "Health & Personal Care",
  "Others / Miscellaneous",
];

function BudgetTab({ theme, currency }) {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const categoryRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const [toast, setToast] = useState({ show: false, message: "" });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    targetId: null,
  });

  const token = localStorage.getItem("token");

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 4000);
  };

  const fetchBudgets = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { month, year },
      };
      const response = await axios.get(`${API_BASE_URL}/api/budgets`, config);
      if (response.data.success) {
        setBudgets(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
      if (monthRef.current && !monthRef.current.contains(event.target)) {
        setMonthDropdownOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target)) {
        setYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmitBudget = async (e) => {
    e.preventDefault();
    if (!category || !limitAmount)
      return triggerToast("Please fill all target fields.");

    const parsedAmount = parseFloat(limitAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return triggerToast("Please enter a valid positive budget amount.");
    }

    setLoading(true); // Fixed: loading(true) ko setLoading(true) kiya
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_BASE_URL}/api/budgets`,
        {
          category: category.trim(),
          limitAmount: parsedAmount,
          month,
          year,
        },
        config,
      );

      if (response.data.success) {
        setCategory("");
        setLimitAmount("");
        fetchBudgets();
      }
    } catch (err) {
      console.error("Budget allocation failed:", err);
      triggerToast("Failed to allocate budget guard.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = (id) => {
    setDeleteModal({ show: true, targetId: id });
  };

  const confirmDeleteBudget = async () => {
    const id = deleteModal.targetId;
    if (!id) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/api/budgets/${id}`, config);
      fetchBudgets();
    } catch (err) {
      console.error("Budget allocation purge failed:", err);
      triggerToast("Purge execution failed.");
    } finally {
      setDeleteModal({ show: false, targetId: null });
    }
  };

  const dropdownItemStyle = (isSelected) => {
    if (theme === "dark") {
      return `px-3 py-2 text-left rounded-lg transition-colors cursor-pointer text-xs w-full block ${
        isSelected
          ? "bg-zinc-800 text-white font-bold"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`;
    } else {
      return `px-3 py-2 text-left rounded-lg transition-colors cursor-pointer text-xs w-full block ${
        isSelected
          ? "bg-zinc-100 text-zinc-900 font-bold"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      }`;
    }
  };

  return (
    <div className="space-y-6 font-sans select-none pb-20 md:pb-0 relative">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-999999 flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold shadow-2xl backdrop-blur-md w-max max-w-[90vw] ${
              theme === "dark"
                ? "bg-zinc-900/90 border-zinc-800 text-rose-400 shadow-black/60"
                : "bg-white/90 border-zinc-200 text-rose-600 shadow-zinc-400/30"
            }`}
          >
            <AlertCircle size={15} className="shrink-0 text-rose-500" />
            <span>{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: "" })}
              className="p-1 rounded-md hover:bg-zinc-500/10 cursor-pointer transition-colors"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {deleteModal.show && (
              <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 overflow-hidden raw-modal-wrapper">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() =>
                    setDeleteModal({ show: false, targetId: null })
                  }
                  className="fixed inset-0 bg-black/75 backdrop-blur-[5px]"
                  style={{ zIndex: -1 }}
                />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{ type: "spring", duration: 0.35 }}
                  className={`w-full max-w-sm rounded-2xl border p-5 relative shadow-2xl ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-900 text-zinc-100 shadow-black/90"
                      : "bg-white border-zinc-100 text-zinc-900 shadow-zinc-500/30"
                  }`}
                >
                  <div className="flex gap-3.5 items-start">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight">
                        Purge Budget Guard?
                      </h3>
                      <p
                        className={`text-[11px] font-medium mt-1 leading-relaxed ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
                      >
                        Are you sure you want to delete this budget allocation?
                        This dynamic spending barrier will be removed instantly.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 justify-end mt-5">
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteModal({ show: false, targetId: null })
                      }
                      className={`px-3.5 py-2 text-[11px] font-bold rounded-xl border cursor-pointer transition-colors ${
                        theme === "dark"
                          ? "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white text-zinc-400"
                          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteBudget}
                      className="px-4 py-2 text-[11px] font-extrabold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors cursor-pointer shadow-md shadow-rose-500/10"
                    >
                      Delete Guard
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-500/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <PieChart size={22} className="text-teal-500" />
            Category Budget Center
          </h1>
          <p
            className={`text-xs mt-0.5 font-medium ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
          >
            Set strict spending caps on operational cost verticals seamlessly.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto z-30">
          <div ref={monthRef} className="relative flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
              className={`w-full sm:w-40 flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl border outline-none cursor-pointer transition-all ${
                theme === "dark"
                  ? "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-teal-500/50"
                  : "bg-white border-zinc-200 text-zinc-900 focus:border-zinc-300"
              }`}
            >
              <span>
                {new Date(0, month - 1).toLocaleString("default", {
                  month: "long",
                })}
              </span>
              <ChevronDown
                size={14}
                className={`text-zinc-400 transition-transform duration-200 ${monthDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {monthDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-1 w-full sm:w-40 p-1.5 rounded-xl border shadow-xl flex flex-col gap-0.5 max-h-60 overflow-y-auto z-50 ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      onClick={() => {
                        setMonth(i + 1);
                        setMonthDropdownOpen(false);
                      }}
                      className={dropdownItemStyle(month === i + 1)}
                    >
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={yearRef} className="relative">
            <button
              type="button"
              onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
              className={`w-24 flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl border outline-none cursor-pointer transition-all ${
                theme === "dark"
                  ? "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-teal-500/50"
                  : "bg-white border-zinc-200 text-zinc-900 focus:border-zinc-300"
              }`}
            >
              <span>{year}</span>
              <ChevronDown
                size={14}
                className={`text-zinc-400 transition-transform duration-200 ${yearDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {yearDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-1 w-24 p-1.5 rounded-xl border shadow-xl flex flex-col gap-0.5 z-50 ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  {[2025, 2026, 2027].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setYear(y);
                        setYearDropdownOpen(false);
                      }}
                      className={dropdownItemStyle(year === y)}
                    >
                      {y}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-2xl border self-start ${
            theme === "dark"
              ? "bg-zinc-950 border-zinc-900/60 shadow-2xl shadow-black/40"
              : "bg-white border-zinc-100 shadow-sm shadow-zinc-200/50"
          }`}
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-500 mb-4 flex items-center gap-1.5">
            <ShieldCheck size={16} />
            Set Smart Cap
          </h2>
          <form onSubmit={handleSubmitBudget} className="space-y-4">
            <div ref={categoryRef} className="relative z-20">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-400 mb-1">
                Expense Category
              </label>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer transition-all ${
                  theme === "dark"
                    ? "bg-zinc-900/60 border-zinc-800 text-white focus:border-teal-500/50"
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300"
                }`}
              >
                <span
                  className={
                    !category
                      ? theme === "dark"
                        ? "text-zinc-600"
                        : "text-zinc-400"
                      : ""
                  }
                >
                  {category || "Select category"}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform duration-200 ${categoryDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {categoryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute left-0 mt-1 w-full p-1.5 rounded-xl border shadow-xl flex flex-col gap-0.5 max-h-60 overflow-y-auto z-50 ${
                      theme === "dark"
                        ? "bg-zinc-950 border-zinc-800"
                        : "bg-white border-zinc-200"
                    }`}
                  >
                    {BUDGET_CATEGORIES.map((cat, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setCategoryDropdownOpen(false);
                        }}
                        className={dropdownItemStyle(category === cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-zinc-400 mb-1">
                Monthly Limit Cap ({currency || "$"})
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={limitAmount}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => setLimitAmount(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                  theme === "dark"
                    ? "bg-zinc-900/60 border-zinc-800 text-white placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10"
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-200/50"
                }`}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white text-xs font-extrabold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50 tracking-wide uppercase shadow-lg shadow-teal-500/10"
            >
              {loading ? "Allocating Target..." : "Deploy Budget Guard"}
            </motion.button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Active Dynamic Budgets
          </h2>
          {budgets.length === 0 ? (
            <div
              className={`text-center py-16 text-xs font-semibold border border-dashed rounded-2xl ${
                theme === "dark"
                  ? "border-zinc-800 text-zinc-500"
                  : "border-zinc-200 text-zinc-400"
              }`}
            >
              No specific category caps set for this fiscal cycle period.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {budgets.map((b) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={b._id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
                      theme === "dark"
                        ? "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-800"
                        : "bg-white border-zinc-200/60 shadow-xs hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-500 uppercase tracking-wider truncate max-w-full">
                          {b.category}
                        </span>
                        <h3 className="text-xl font-black mt-2 tracking-tight truncate">
                          {currency || "$"}
                          {Number(b.limitAmount).toLocaleString()}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        className={`transition-colors p-2 rounded-lg cursor-pointer active:scale-95 ${
                          theme === "dark"
                            ? "text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                            : "text-zinc-400 hover:text-rose-500 hover:bg-rose-50"
                        }`}
                        title="Purge Allocation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-[10px] font-bold mt-5 font-mono ${
                        theme === "dark" ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      <Calendar size={11} className="text-teal-500/70" />
                      <span>
                        Active Cycle: {month.toString().padStart(2, "0")}/{year}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BudgetTab;
