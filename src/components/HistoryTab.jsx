import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

// Get API base URL from Vite environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function HistoryTab({ theme, currency = "₹" }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        let res;

        try {
          res = await axios.get(`${API_BASE_URL}/api/transactions/history`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          // Fallback to primary transactions API if the history endpoint returns a 404 error
          if (err.response && err.response.status === 404) {
            res = await axios.get(`${API_BASE_URL}/api/transactions`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } else {
            throw err;
          }
        }

        // Parse structured backend response mapping to extract valid array matrices cleanly
        let dataArray = [];
        if (res && res.data) {
          if (res.data.success && Array.isArray(res.data.data)) {
            dataArray = res.data.data;
          } else if (Array.isArray(res.data.transactions)) {
            dataArray = res.data.transactions;
          } else if (Array.isArray(res.data.data)) {
            dataArray = res.data.data;
          } else if (Array.isArray(res.data)) {
            dataArray = res.data;
          }
        }

        setHistory(dataArray);
        setLoading(false);
      } catch (error) {
        console.error(
          "Critical failure during report fetching:",
          error.message,
        );
        setHistory([]);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // --- CSV Export Logic ---
  const exportToCSV = () => {
    if (!Array.isArray(history) || history.length === 0)
      return alert("There is no data available to export!");

    const csvData = history.map((item, index) => ({
      S_No: index + 1,
      Title: item.title || "N/A",
      Type: item.type ? item.type.toUpperCase() : "N/A",
      Amount: item.amount || 0,
      Category: item.category || "General",
      Date: item.date ? new Date(item.date).toLocaleDateString("en-IN") : "N/A",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Financial_Ledger_Report_${new Date().toLocaleDateString("en-IN")}.csv`,
    );
    link.click();
  };

  // --- PDF Export Logic ---
  const exportToPDF = () => {
    if (!Array.isArray(history) || history.length === 0)
      return alert("There is no data available to export!");

    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("FINANCIAL STATEMENTS & LEDGER REPORT", 14, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);

      const currencyPrefix = currency === "₹" ? "INR" : currency;

      const tableRows = history.map((item, index) => [
        index + 1,
        item.title || "N/A",
        item.type ? item.type.toUpperCase() : "N/A",
        `${currencyPrefix} ${(item.amount || 0).toLocaleString("en-IN")}`,
        item.category || "General",
        item.date ? new Date(item.date).toLocaleDateString("en-IN") : "N/A",
      ]);

      autoTable(doc, {
        startY: 32,
        head: [
          [
            "#",
            "Statement Title",
            "Accounting Type",
            "Net Amount",
            "Category Block",
            "Posting Date",
          ],
        ],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [24, 24, 27], fontStyle: "bold" },
      });

      doc.save(
        `Ledger_Statement_${new Date().toLocaleDateString("en-IN")}.pdf`,
      );
    } catch (pdfError) {
      console.error("PDF generation layout failure:", pdfError);
      alert("An error occurred during the PDF download trigger sequence.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 select-none">
        <Loader2
          size={22}
          className="animate-spin text-teal-500"
          strokeWidth={2.5}
        />
        <span
          className={`text-xs font-bold tracking-wide uppercase ${
            theme === "dark" ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          Syncing ledger...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-24 md:pb-0 text-sans transform-gpu"
      style={{ scrollbarGutter: "stable" }}
    >
      {/* Upper Action Bar */}
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border transition-all duration-300 ${
          theme === "dark"
            ? "bg-zinc-900/40 border-zinc-900 text-white"
            : "bg-white border-zinc-100 text-zinc-900 shadow-sm"
        }`}
      >
        <div>
          <h2 className="text-base font-bold tracking-tight">
            Audit Statements & Reports
          </h2>
          <p
            className={`text-[11px] font-semibold mt-0.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
          >
            Monitor ledger distribution frameworks and extract signed digital
            statements.
          </p>
        </div>

        {/* Export Triggers */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.97]"
          >
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer border active:scale-[0.97] ${
              theme === "dark"
                ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                : "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            <FileText size={14} /> Download PDF
          </button>
        </div>
      </div>

      {/* Responsive Ledger Presentation Table */}
      <div
        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
          theme === "dark"
            ? "border-zinc-900 bg-zinc-900/20"
            : "border-zinc-100 bg-white shadow-sm"
        }`}
      >
        <div
          className="overflow-x-auto transform-gpu scrollbar-thin"
          style={{
            WebkitOverflowScrolling: "touch",
            overflowY: "hidden",
          }}
        >
          <table className="w-full text-left border-collapse text-xs font-semibold whitespace-nowrap">
            <thead>
              <tr
                className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                  theme === "dark"
                    ? "bg-zinc-900/60 text-zinc-400 border-zinc-900"
                    : "bg-zinc-50/70 text-zinc-500 border-zinc-100"
                }`}
              >
                <th className="p-4 pl-6">Txn Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Amount</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`divide-y ${theme === "dark" ? "divide-zinc-900" : "divide-zinc-50"}`}
            >
              {!Array.isArray(history) || history.length === 0 ? (
                <motion.tr variants={itemVariants}>
                  <td
                    colSpan="4"
                    className="p-12 text-center text-xs font-semibold text-zinc-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 opacity-90">
                      <AlertCircle size={22} className="text-zinc-500" />
                      <span>
                        No active transaction structures mapped on this ledger.
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                history.map((item) => (
                  <motion.tr
                    variants={itemVariants}
                    key={item._id}
                    className={`transition-colors duration-150 ${
                      theme === "dark"
                        ? "hover:bg-zinc-900/40"
                        : "hover:bg-zinc-50/50"
                    }`}
                  >
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          item.type === "income"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {item.type === "income" ? (
                          <ArrowDownLeft size={15} />
                        ) : (
                          <ArrowUpRight size={15} />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-bold tracking-tight ${theme === "dark" ? "text-zinc-100" : "text-zinc-800"}`}
                        >
                          {item.title || "Untitled"}
                        </p>
                        <p className="text-[10px] text-zinc-400 capitalize font-semibold mt-0.5">
                          {item.type || "transaction"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wide ${
                          theme === "dark"
                            ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                            : "bg-zinc-50 border-zinc-200/60 text-zinc-500"
                        }`}
                      >
                        {item.category || "General"}
                      </span>
                    </td>
                    <td
                      className={`p-4 ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="opacity-70" />
                        {item.date
                          ? new Date(item.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </div>
                    </td>
                    <td
                      className={`p-4 pr-6 text-right font-bold text-sm ${
                        item.type === "income"
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {item.type === "income" ? "+" : "-"}
                      {currency}
                      {Number(item.amount || 0).toLocaleString("en-IN")}
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default HistoryTab;
