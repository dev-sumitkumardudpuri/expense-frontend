import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  // Initialize theme state from localStorage, defaulting to "dark"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Sync theme changes with the document root
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const openLogin = () => {
    setIsSignup(false);
    setIsOpen(true);
  };

  const openRegister = () => {
    setIsSignup(true);
    setIsOpen(true);
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 pt-24 sm:pt-28 overflow-x-hidden ${
        theme === "dark"
          ? "bg-zinc-950 text-zinc-100 selection:bg-teal-500/30"
          : "bg-white text-zinc-900 selection:bg-teal-500/20"
      }`}
    >
      {/* Navigation Header */}
      <Navbar
        openLogin={openLogin}
        openRegister={openRegister}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-24 grid md:grid-cols-2 gap-10 lg:gap-12 items-center relative">
        {/* Ambient Background Glow */}
        <div
          className={`absolute top-10 left-1/4 w-72 h-72 sm:w-80 sm:h-80 rounded-full filter blur-[120px] opacity-20 pointer-events-none transition-colors duration-500 ${
            theme === "dark" ? "bg-teal-500" : "bg-teal-300"
          }`}
        ></div>

        {/* Hero Left: Text & CTA (Ensured order-first on mobile) */}
        <div className="flex flex-col items-start text-left z-10 order-first md:order-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-[1.15]">
            Take Control of Your Money. <br />
            <span
              className={theme === "dark" ? "text-teal-400" : "text-teal-600"}
            >
              Track Expenses Effortlessly.
            </span>
          </h1>

          <p
            className={`mb-6 sm:mb-8 max-w-md text-sm sm:text-base md:text-lg leading-relaxed font-normal ${
              theme === "dark" ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            Manage your daily income, log recurring expenses, set strict
            budgets, and instantly download your financial analytics report.
            100% Secure.
          </p>

          <button
            onClick={openRegister}
            className={`w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 font-bold rounded-xl text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg active:scale-95 hover:scale-[1.02] ${
              theme === "dark"
                ? "bg-linear-to-r from-teal-500 to-emerald-500 text-zinc-950 shadow-teal-500/10"
                : "bg-zinc-950 text-white shadow-zinc-950/20 hover:bg-zinc-800"
            }`}
          >
            Start For Free
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* Hero Right: Dashboard Preview Mockup */}
        <div className="w-full z-10 mt-6 md:mt-0">
          <div
            className={`w-full min-h-90 sm:min-h-105 border rounded-2xl flex flex-col relative overflow-hidden transition-all duration-300 ${
              theme === "dark"
                ? "bg-zinc-900 border-zinc-800 shadow-black/80 shadow-2xl"
                : "bg-zinc-50 border-zinc-200 shadow-zinc-300/40 shadow-xl"
            }`}
          >
            {/* Window Top Bar */}
            <div
              className={`absolute top-0 left-0 w-full h-9 border-b flex items-center justify-between px-4 z-20 ${
                theme === "dark"
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-zinc-100 border-zinc-200"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80"></span>
                <span
                  className={`text-[10px] font-mono ml-2 ${theme === "dark" ? "text-zinc-500" : "text-zinc-600"}`}
                >
                  Dashboard
                </span>
              </div>
            </div>

            {/* Mockup App Content */}
            <div className="flex flex-1 pt-9 text-[11px] h-full">
              {/* Sidebar Navigation Mockup */}
              <div
                className={`w-14 sm:w-28 border-r p-2 flex flex-col justify-between select-none ${
                  theme === "dark"
                    ? "bg-zinc-950/60 border-zinc-800 text-zinc-400"
                    : "bg-white border-zinc-200 text-zinc-500"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1 px-1 py-1 font-bold text-teal-500">
                    <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                    <span className="hidden sm:inline text-[10px] uppercase tracking-wider">
                      Tracker
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div
                      className={`flex items-center justify-center sm:justify-start gap-1.5 p-1 rounded font-semibold ${
                        theme === "dark"
                          ? "bg-zinc-800 text-teal-400"
                          : "bg-zinc-100 text-teal-600"
                      }`}
                    >
                      <span>📊</span>{" "}
                      <span className="hidden sm:inline">Dashboard</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 p-1 rounded hover:opacity-80">
                      <span>⏳</span>{" "}
                      <span className="hidden sm:inline">History</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 p-1 rounded hover:opacity-80">
                      <span>📈</span>{" "}
                      <span className="hidden sm:inline">Report</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-1.5 p-1 text-rose-500 font-semibold border-t border-inherit pt-2 opacity-90">
                  <span>🚪</span>{" "}
                  <span className="hidden sm:inline">Logout</span>
                </div>
              </div>

              {/* Main App Content Mockup */}
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div
                  className={`p-2 px-3 border-b flex items-center justify-between gap-4 ${
                    theme === "dark"
                      ? "bg-zinc-900/40 border-zinc-800"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-md w-24 sm:w-36 ${
                      theme === "dark"
                        ? "bg-zinc-950/50 text-zinc-600"
                        : "bg-zinc-200/60 text-zinc-400"
                    }`}
                  >
                    <span>🔍</span>
                    <span className="text-[9px]">Search...</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span>🔔</span>
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full font-bold flex items-center justify-center border ${
                        theme === "dark"
                          ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                          : "bg-zinc-200 border-zinc-300 text-zinc-700"
                      }`}
                    >
                      U
                    </div>
                  </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="p-3 flex flex-col gap-3 flex-1 justify-between">
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`p-2 rounded-lg border ${
                        theme === "dark"
                          ? "bg-zinc-950/40 border-zinc-800"
                          : "bg-white border-zinc-200"
                      }`}
                    >
                      <p className="text-[8px] text-zinc-500 uppercase font-bold">
                        Balance
                      </p>
                      <p
                        className={`text-[10px] sm:text-xs font-black mt-0.5 ${
                          theme === "dark" ? "text-teal-400" : "text-teal-600"
                        }`}
                      >
                        ₹48,250
                      </p>
                    </div>
                    <div
                      className={`p-2 rounded-lg border ${
                        theme === "dark"
                          ? "bg-zinc-950/40 border-zinc-800"
                          : "bg-white border-zinc-200"
                      }`}
                    >
                      <p className="text-[8px] text-zinc-500 uppercase font-bold">
                        Expenses
                      </p>
                      <p className="text-[10px] sm:text-xs font-black mt-0.5 text-rose-500">
                        ₹12,400
                      </p>
                    </div>
                    <div
                      className={`p-2 rounded-lg border ${
                        theme === "dark"
                          ? "bg-zinc-950/40 border-zinc-800"
                          : "bg-white border-zinc-200"
                      }`}
                    >
                      <p className="text-[8px] text-zinc-500 uppercase font-bold">
                        Savings
                      </p>
                      <p className="text-[10px] sm:text-xs font-black mt-0.5 text-emerald-500">
                        ₹35,850
                      </p>
                    </div>
                  </div>

                  {/* Allocation Chart Area */}
                  <div
                    className={`p-3 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-3 flex-1 min-h-35 ${
                      theme === "dark"
                        ? "bg-zinc-950/20 border-zinc-800"
                        : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="flex flex-col gap-1 text-left w-full sm:w-1/2">
                      <p
                        className={`font-bold ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}
                      >
                        Expense Breakdown
                      </p>
                      <p className="text-[9px] text-zinc-500 leading-tight">
                        Monthly view of your primary spending habits.
                      </p>

                      <div className="mt-1 flex flex-col gap-1 text-[9px] font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>{" "}
                          Food (50%)
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>{" "}
                          Rent (30%)
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>{" "}
                          Utilities (20%)
                        </div>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20">
                      <div className="w-full h-full rounded-full border-6 sm:border-8 border-teal-500 border-r-amber-500 border-b-rose-500 transform rotate-45"></div>
                      <div
                        className={`absolute text-[8px] font-bold ${
                          theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        Live
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid Section */}
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t ${
          theme === "dark" ? "border-zinc-900" : "border-zinc-200"
        }`}
      >
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {/* Feature 01 */}
          <div
            className={`p-6 border rounded-xl transition-all duration-300 hover:scale-[1.01] ${
              theme === "dark"
                ? "bg-zinc-900/30 border-zinc-800/80"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div
              className={`text-base sm:text-lg font-bold mb-3 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
            >
              01 &bull; Smart Analytics
            </div>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"}`}
            >
              Beautiful interactive charts that map out your exact spend
              categories monthly without complicated accounting sheets.
            </p>
          </div>

          {/* Feature 02 */}
          <div
            className={`p-6 border rounded-xl transition-all duration-300 hover:scale-[1.01] ${
              theme === "dark"
                ? "bg-zinc-900/30 border-zinc-800/80"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div
              className={`text-base sm:text-lg font-bold mb-3 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
            >
              02 &bull; Instant Filters
            </div>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"}`}
            >
              Powerful real-time search queries. Instantly filter past
              transactions by title, range, vendor, or custom category tags.
            </p>
          </div>

          {/* Feature 03 */}
          <div
            className={`p-6 border rounded-xl transition-all duration-300 hover:scale-[1.01] ${
              theme === "dark"
                ? "bg-zinc-900/30 border-zinc-800/80"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div
              className={`text-base sm:text-lg font-bold mb-3 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
            >
              03 &bull; Global Export
            </div>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"}`}
            >
              Take your data anywhere. Download clean, print-ready PDFs or
              spreadsheet-compatible CSV spreadsheets in one click.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`w-full py-8 text-center border-t text-[11px] sm:text-xs font-medium transition-colors ${
          theme === "dark"
            ? "border-zinc-900 text-zinc-500 bg-zinc-950"
            : "border-zinc-200 text-zinc-500 bg-zinc-50"
        }`}
      >
        <p>
          © 2026 Expense Tracker. Secure, clean, and reliable finance
          management.
        </p>
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isSignup={isSignup}
        theme={theme}
      />
    </div>
  );
}

export default Home;
