import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Calendar,
  Filter,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import AddTransactionModal from "./AddTransactionModal";

// Fetch the base URL from Vite environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function TransactionsTab({ searchQuery, refreshData, theme, currency = "₹" }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Reference and state management for the custom dropdown filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Event listener hook to close the custom filter dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAllTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        `${API_BASE_URL}/api/transactions?search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) setTransactions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const executeDeleteAction = async () => {
    if (!deleteTargetId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `${API_BASE_URL}/api/transactions/${deleteTargetId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        setDeleteTargetId(null);
        fetchAllTransactions();
        if (typeof refreshData === "function") refreshData();
      }
    } catch (err) {
      console.error("Deletion failure:", err);
      setDeleteTargetId(null);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  const filteredList = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter === "all") return true;
      return t.type === typeFilter;
    });
  }, [transactions, typeFilter]);

  // Premium eye-blink pure fade transition configuration
  const blinkFade = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.25, ease: "linear" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15, ease: "linear" },
    },
  };

  // Helper labels mapping for display text on custom dropdown button
  const filterLabels = {
    all: "All Activities",
    income: "Credits Only",
    expense: "Debits Only",
  };

  // Helper mapping dropdown active options list item styles
  const getDropdownItemStyle = (itemValue) => {
    const isSelected = typeFilter === itemValue;
    if (theme === "dark") {
      return `px-3.5 py-2 text-left rounded-lg transition-colors cursor-pointer text-xs font-bold w-full ${
        isSelected
          ? "bg-zinc-800 text-teal-400"
          : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
      }`;
    } else {
      return `px-3.5 py-2 text-left rounded-lg transition-colors cursor-pointer text-xs font-bold w-full ${
        isSelected
          ? "bg-zinc-100 text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      }`;
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6 font-sans relative select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-500/10 pb-5">
        <div>
          <h2
            className={`text-xl sm:text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-zinc-900"}`}
          >
            Transaction History
          </h2>
          <p
            className={`text-xs mt-1 font-medium ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
          >
            Monitor, audit, and trace your historical financial movements.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Custom Dropdown Container Replacement */}
          <div
            ref={dropdownRef}
            className="relative flex-1 sm:flex-none min-w-37.5 z-50"
          >
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full flex items-center justify-between pl-3.5 pr-3 py-2 text-xs font-bold rounded-xl border outline-none cursor-pointer transition-all duration-200 ${
                theme === "dark"
                  ? `bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:bg-zinc-900 ${isFilterOpen ? "border-teal-500/50 ring-2 ring-teal-500/10" : ""}`
                  : `bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50/50 shadow-sm ${isFilterOpen ? "border-zinc-400 ring-2 ring-zinc-100" : ""}`
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter size={13} className="opacity-60 shrink-0" />
                <span>{filterLabels[typeFilter]}</span>
              </div>
              <ChevronDown
                size={13}
                className={`opacity-60 transition-transform duration-200 shrink-0 ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`absolute left-0 mt-1.5 w-full p-1.5 rounded-xl border shadow-xl flex flex-col gap-1 z-50 ${
                    theme === "dark"
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("all");
                      setIsFilterOpen(false);
                    }}
                    className={getDropdownItemStyle("all")}
                  >
                    All Activities
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("income");
                      setIsFilterOpen(false);
                    }}
                    className={getDropdownItemStyle("income")}
                  >
                    Credits Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("expense");
                      setIsFilterOpen(false);
                    }}
                    className={getDropdownItemStyle("expense")}
                  >
                    Debits Only
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-extrabold rounded-xl cursor-pointer active:scale-[0.96] transition-all duration-150 shadow-md shadow-teal-500/10 shrink-0 uppercase tracking-wider"
          >
            <Plus size={14} strokeWidth={2.5} /> Add Record
          </button>
        </div>
      </div>

      <div
        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
          theme === "dark"
            ? "bg-zinc-950/40 border-zinc-900 shadow-2xl shadow-black/40 backdrop-blur-md"
            : "bg-white border-zinc-200/60 shadow-sm shadow-zinc-100/50"
        }`}
      >
        <div className="overflow-x-auto selection:bg-transparent">
          <div className="min-w-190 w-full">
            <div
              className={`grid grid-cols-12 text-[11px] font-extrabold tracking-wider uppercase border-b p-4 px-6 ${
                theme === "dark"
                  ? "bg-zinc-900/30 text-zinc-400 border-zinc-900"
                  : "bg-zinc-50/70 text-zinc-500 border-zinc-200/60"
              }`}
            >
              <div className="col-span-4">Transaction Details</div>
              <div className="col-span-2 text-right pr-6">Amount</div>
              <div className="col-span-3 text-center">Category</div>
              <div className="col-span-2 text-center">Date</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            <div
              className={`divide-y ${theme === "dark" ? "divide-zinc-900/60" : "divide-zinc-100"}`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2
                    size={20}
                    className="animate-spin text-teal-500"
                    strokeWidth={2.5}
                  />
                  <span
                    className={`text-xs font-bold tracking-wide uppercase ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Syncing ledger...
                  </span>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {filteredList.length === 0 ? (
                    <motion.div
                      key="empty-state"
                      variants={blinkFade}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={`p-20 text-center font-bold text-xs tracking-normal ${theme === "dark" ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      No transaction entries located within the active filter
                      query.
                    </motion.div>
                  ) : (
                    <motion.div
                      key={typeFilter + filteredList.length} // Force pure clean eye-blink reset smoothly on update
                      variants={blinkFade}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {filteredList.map((t) => (
                        <div
                          key={t._id}
                          className={`grid grid-cols-12 items-center p-3.5 px-6 text-xs font-semibold transition-colors duration-200 ${
                            theme === "dark"
                              ? "hover:bg-zinc-900/30 text-zinc-200 border-l-2 border-l-transparent hover:border-l-teal-500/40"
                              : "hover:bg-zinc-50/50 bg-white text-zinc-800 border-l-2 border-l-transparent hover:border-l-zinc-400"
                          }`}
                        >
                          <div className="col-span-4 flex items-center gap-3.5 min-w-0">
                            <div
                              className={`p-2 rounded-xl shrink-0 ${
                                t.type === "income"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-rose-500/10 text-rose-500"
                              }`}
                            >
                              {t.type === "income" ? (
                                <ArrowDownLeft size={15} strokeWidth={2.5} />
                              ) : (
                                <ArrowUpRight size={15} strokeWidth={2.5} />
                              )}
                            </div>
                            <span className="font-bold tracking-tight truncate pr-2 max-w-[90%]">
                              {t.title || "Untitled"}
                            </span>
                          </div>

                          <div
                            className={`col-span-2 text-right pr-6 font-black text-sm tracking-tight ${
                              t.type === "income"
                                ? "text-emerald-500"
                                : "text-rose-500"
                            }`}
                          >
                            {t.type === "income" ? "+" : "-"}
                            {currency}
                            {Number(t.amount).toLocaleString("en-IN")}
                          </div>

                          <div className="col-span-3 flex justify-center min-w-0">
                            <span
                              className={`px-3 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider truncate max-w-40 ${
                                theme === "dark"
                                  ? "bg-zinc-900/50 border-zinc-800 text-zinc-400 shadow-inner"
                                  : "bg-zinc-50 border-zinc-200/60 text-zinc-600"
                              }`}
                            >
                              {t.category || "General"}
                            </span>
                          </div>

                          <div
                            className={`col-span-2 flex justify-center font-bold ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
                          >
                            <div className="flex items-center gap-2 font-mono text-[11px] tracking-tight">
                              <Calendar
                                size={12}
                                className={
                                  theme === "dark"
                                    ? "text-zinc-600"
                                    : "text-zinc-400"
                                }
                              />
                              {new Date(t.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>

                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => setDeleteTargetId(t._id)}
                              className={`p-2 rounded-xl cursor-pointer transition-all duration-150 active:scale-90 ${
                                theme === "dark"
                                  ? "text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                                  : "text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                              }`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            refresh={fetchAllTransactions}
            refreshOverview={refreshData}
            theme={theme}
            currency={currency}
          />
        )}
      </AnimatePresence>

      {createPortal(
        <AnimatePresence>
          {deleteTargetId && (
            <div className="fixed inset-0 z-999 flex items-center justify-center p-4 overflow-hidden select-none">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteTargetId(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "linear" }}
                className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl relative z-1000 ${
                  theme === "dark"
                    ? "bg-zinc-900 border-zinc-800 text-white"
                    : "bg-white border-zinc-200 text-zinc-900"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <h3 className="text-sm font-black tracking-tight text-rose-500 uppercase">
                      Confirm Ledger Erasure
                    </h3>
                    <p
                      className={`text-[11px] font-semibold leading-relaxed ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"}`}
                    >
                      Are you absolutely certain you want to permanently strip
                      this transaction data? This action cannot be reversed.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2.5 justify-end mt-6 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(null)}
                    className={`px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
                      theme === "dark"
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        : "bg-zinc-100 hover:bg-zinc-200/70 text-zinc-600"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeDeleteAction}
                    className="px-4 py-2 bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl shadow-lg shadow-rose-500/10 transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    Delete Record
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

export default TransactionsTab;
