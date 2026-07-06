import React from "react";

function Navbar({ openLogin, openRegister, theme, toggleTheme }) {
  return (
    <nav
      className={`w-full border-b px-4 sm:px-6 md:px-12 py-4 flex justify-between items-center fixed top-0 left-0 z-50 transition-colors duration-300 backdrop-blur-md ${
        theme === "dark"
          ? "border-zinc-800 bg-zinc-950/80 text-white"
          : "border-zinc-200 bg-white/80 text-zinc-900"
      }`}
    >
      {/* Brand Logo and Identity */}
      <div className="flex items-center gap-2 cursor-pointer group shrink-0 select-none">
        <svg
          className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110 ${
            theme === "dark" ? "text-teal-400" : "text-teal-600"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm sm:text-lg font-bold tracking-tight uppercase">
          Expense
          <span
            className={theme === "dark" ? "text-teal-400" : "text-teal-600"}
          >
            Tracker
          </span>
        </span>
      </div>

      {/* Navigation Actions */}
      <div className="flex gap-3 sm:gap-4 items-center">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${
            theme === "dark"
              ? "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
          }`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* Authentication Buttons */}
        <button
          onClick={openLogin}
          className={`text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer ${
            theme === "dark"
              ? "text-zinc-400 hover:text-white"
              : "text-zinc-600 hover:text-zinc-950"
          }`}
        >
          Sign In
        </button>

        <button
          onClick={openRegister}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 font-medium rounded-lg text-xs sm:text-sm transition-all duration-200 cursor-pointer active:scale-95 ${
            theme === "dark"
              ? "bg-teal-500 text-zinc-950 hover:bg-teal-400 shadow-sm"
              : "bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm"
          }`}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
