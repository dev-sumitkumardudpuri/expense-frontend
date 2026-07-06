import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Tag,
  FileText,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

const PRESET_CATEGORIES = [
  "Salary",
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

function AddTransactionModal({
  isOpen,
  onClose,
  refresh,
  refreshOverview,
  theme,
  currency = "₹",
}) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    frequency: "monthly",
    recurringDate: 1,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const typeRef = useRef(null);
  const categoryRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split("T")[0],
        isRecurring: false,
        frequency: "monthly",
        recurringDate: 1,
      });
      setErrorMsg("");
      setIsSubmitting(false);
      setTypeDropdownOpen(false);
      setCategoryDropdownOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setTypeDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please compute a valid corporate transaction amount.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.category) {
      setErrorMsg("Please select an analytical category allocation.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        amount: parsedAmount,
        recurringDate: formData.isRecurring
          ? parseInt(formData.recurringDate, 10)
          : undefined,
        frequency: formData.isRecurring ? formData.frequency : undefined,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/transactions`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        if (refresh) refresh();
        if (refreshOverview) refreshOverview();
        onClose();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Operational system network failure.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpense = formData.type === "expense";
  const accentColor = isExpense
    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10 text-white"
    : "bg-teal-500 hover:bg-teal-600 shadow-teal-500/10 text-white";

  const focusBorderColor = isExpense
    ? "focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 border-rose-500/30"
    : "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 border-teal-500/30";

  const dropdownItemStyle = (itemValue, currentFormValue) => {
    const isSelected = itemValue === currentFormValue;
    if (theme === "dark") {
      return `px-3 py-2 text-left rounded-lg transition-colors cursor-pointer text-xs ${
        isSelected
          ? "bg-zinc-800 text-white font-bold"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`;
    } else {
      return `px-3 py-2 text-left rounded-lg transition-colors cursor-pointer text-xs ${
        isSelected
          ? "bg-zinc-100 text-zinc-900 font-bold"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      }`;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 overflow-hidden select-none font-sans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-sm ${
          theme === "dark" ? "bg-zinc-950/60" : "bg-zinc-900/30"
        }`}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ type: "spring", duration: 0.25 }}
        className={`w-full max-w-md p-6 rounded-2xl border flex flex-col gap-5 shadow-2xl relative z-50 max-h-[90vh] overflow-y-auto style-scrollbar ${
          theme === "dark"
            ? "bg-zinc-900 border-zinc-800 text-white shadow-black/50"
            : "bg-white border-zinc-100 text-zinc-900 shadow-zinc-200/40"
        }`}
      >
        <div className="flex justify-between items-center border-b border-zinc-500/10 pb-3">
          <div>
            <h3 className="text-base font-black tracking-tight">
              Instrument Ledger Entry
            </h3>
            <p
              className={`text-[10px] font-semibold mt-0.5 ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
            >
              Log account transactions cleanly into the system database.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className={`p-1.5 rounded-xl cursor-pointer transition-all active:scale-95 ${
              theme === "dark"
                ? "bg-zinc-800 text-zinc-400 hover:text-white"
                : "bg-zinc-100 text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <X size={14} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-[11px] bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl font-bold">
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-[11px] font-bold"
        >
          <div>
            <label
              className={`flex items-center gap-1.5 mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
            >
              <FileText size={12} className="text-teal-500/80" /> Transaction
              Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Zomato Dinner or Netflix Premium"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full p-2.5 font-semibold rounded-xl border outline-none transition-all duration-150 ${focusBorderColor} ${
                theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600"
                  : "bg-zinc-50 border-zinc-200 text-zinc-800 placeholder-zinc-400"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`flex items-center gap-1.5 mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
              >
                <DollarSign size={12} className="text-teal-500/80" /> Statement
                Value
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder={`${currency} 0.00`}
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className={`w-full p-2.5 font-semibold rounded-xl border outline-none transition-all duration-150 ${focusBorderColor} ${
                  theme === "dark"
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600"
                    : "bg-zinc-50 border-zinc-200 text-zinc-800 placeholder-zinc-400"
                }`}
              />
            </div>

            <div ref={typeRef} className="relative">
              <label
                className={`flex items-center gap-1.5 mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
              >
                Accounting Stream
              </label>
              <button
                type="button"
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold outline-none transition-all duration-150 text-left ${
                  typeDropdownOpen ? focusBorderColor : ""
                } ${
                  theme === "dark"
                    ? "bg-zinc-950 border-zinc-800 text-white"
                    : "bg-zinc-50 border-zinc-200 text-zinc-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  {isExpense ? (
                    <>
                      <ArrowUpRight size={13} className="text-rose-500" />
                      Debit (Outflow)
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft size={13} className="text-teal-500" />
                      Credit (Inflow)
                    </>
                  )}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform duration-200 ${typeDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {typeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute z-100 mt-1 w-full p-1.5 rounded-xl border shadow-xl flex flex-col gap-1 ${
                      theme === "dark"
                        ? "bg-zinc-950 border-zinc-800"
                        : "bg-white border-zinc-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, type: "expense" });
                        setTypeDropdownOpen(false);
                      }}
                      className={dropdownItemStyle("expense", formData.type)}
                    >
                      Debit (Outflow)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, type: "income" });
                        setTypeDropdownOpen(false);
                      }}
                      className={dropdownItemStyle("income", formData.type)}
                    >
                      Credit (Inflow)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div ref={categoryRef} className="relative">
            <label
              className={`flex items-center gap-1.5 mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
            >
              <Tag size={12} className="text-teal-500/80" /> Analytical Category
              Allocation
            </label>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold outline-none transition-all duration-150 text-left ${
                categoryDropdownOpen ? focusBorderColor : ""
              } ${
                theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white"
                  : "bg-zinc-50 border-zinc-200 text-zinc-800"
              }`}
            >
              <span
                className={
                  formData.category ? "" : "text-zinc-400 dark:text-zinc-600"
                }
              >
                {formData.category || "Select category"}
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
                  className={`absolute z-100 mt-1 w-full max-h-48 overflow-y-auto style-scrollbar p-1.5 rounded-xl border shadow-xl flex flex-col gap-1 ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  {PRESET_CATEGORIES.map((cat, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, category: cat });
                        setCategoryDropdownOpen(false);
                      }}
                      className={dropdownItemStyle(cat, formData.category)}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label
              className={`flex items-center gap-1.5 mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
            >
              <Calendar size={12} className="text-teal-500/80" /> Execution
              Timestamp Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className={`w-full p-2.5 font-semibold rounded-xl border outline-none transition-all duration-150 ${focusBorderColor} ${
                theme === "dark"
                  ? "bg-zinc-950 border-zinc-800 text-white font-mono dark:scheme-dark"
                  : "bg-zinc-50 border-zinc-200 text-zinc-900 font-mono"
              }`}
            />
          </div>

          <div
            className={`p-3 rounded-xl border transition-all ${
              theme === "dark"
                ? "bg-zinc-950/40 border-zinc-800/80"
                : "bg-zinc-50 border-zinc-200/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw
                  size={12}
                  className={
                    formData.isRecurring
                      ? "text-teal-500 animate-spin"
                      : "opacity-40"
                  }
                  style={{
                    animationDuration: formData.isRecurring ? "3s" : "0s",
                  }}
                />
                <div>
                  <p
                    className={
                      theme === "dark" ? "text-zinc-200" : "text-zinc-800"
                    }
                  >
                    Automate Engine Cycle
                  </p>
                  <p
                    className={`text-[9px] font-medium ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Auto-execute processing maps sequentially.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    isRecurring: !formData.isRecurring,
                  })
                }
                className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer outline-none ${
                  formData.isRecurring
                    ? "bg-teal-500"
                    : "bg-zinc-400 dark:bg-zinc-700"
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${
                    formData.isRecurring ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {formData.isRecurring && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800"
                >
                  <div>
                    <label
                      className={`block mb-1 text-[10px] ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      Frequency Scope
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData({ ...formData, frequency: e.target.value })
                      }
                      className={`w-full p-2 rounded-xl border text-xs outline-none ${focusBorderColor} ${
                        theme === "dark"
                          ? "bg-zinc-900 border-zinc-800 text-white"
                          : "bg-white border-zinc-200 text-zinc-900"
                      }`}
                    >
                      <option value="daily">Daily Loop</option>
                      <option value="weekly">Weekly Interval</option>
                      <option value="monthly">Monthly Standard</option>
                      <option value="yearly">Yearly Annually</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block mb-1 text-[10px] ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      Execution Cycle Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required={formData.isRecurring}
                      value={formData.recurringDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurringDate: e.target.value,
                        })
                      }
                      className={`w-full p-2 font-semibold rounded-xl border outline-none ${focusBorderColor} ${
                        theme === "dark"
                          ? "bg-zinc-900 border-zinc-800 text-white"
                          : "bg-white border-zinc-200 text-zinc-900"
                      }`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 ${accentColor} font-extrabold rounded-xl cursor-pointer mt-2 transition-all text-xs tracking-wide uppercase shadow-lg flex items-center justify-center gap-2 ${isSubmitting ? "opacity-80" : ""}`}
          >
            {isSubmitting && <RefreshCw size={12} className="animate-spin" />}
            {isSubmitting ? "Processing..." : "Save Ledger Record"}
          </motion.button>
        </form>
      </motion.div>
    </div>,
    document.body,
  );
}

export default AddTransactionModal;
