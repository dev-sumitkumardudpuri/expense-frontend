import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, CheckCircle } from "lucide-react";
import axios from "axios";
import axiosReal from "axios";

function Topbar({
  user,
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  activeTab,
}) {
  const [liveTime, setLiveTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token") || user?.token;
    if (!token) return;

    try {
      const response = await axiosReal.get(
        `${API_BASE_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.success) {
        const fetchedData = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.notifications || [];

        setNotifications(fetchedData);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setNotifications([]);
      } else {
        console.error(
          "Notification polling synchronization failed:",
          err.message,
        );
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
    const interval = setInterval(() => {
      if (user) fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const clockInterval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const formattedDateStr = liveTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTimeStr = liveTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token") || user?.token;
    try {
      const response = await axiosReal.put(
        `${API_BASE_URL}/api/notifications/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.success) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to clear notification center logs:", err.message);
    }
  };

  return (
    <header
      className={`w-full border-b px-4 sm:px-6 py-4 flex items-center justify-between gap-4 transition-colors duration-200 select-none transform-gpu relative z-40 ${
        theme === "dark"
          ? "bg-zinc-950/40 border-zinc-900 text-zinc-100 backdrop-blur-md"
          : "bg-white border-zinc-100 text-zinc-900 shadow-sm"
      }`}
    >
      <div className="shrink-0 min-w-0 text-left">
        <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight truncate">
          Welcome back,{" "}
          <span className="text-teal-500 font-extrabold">
            {user?.name || "User"}
          </span>
        </h1>
        <p
          className={`text-[10px] sm:text-[11px] mt-0.5 font-medium truncate ${
            theme === "dark" ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          <span className="inline sm:hidden">Track your finances easily.</span>
          <span className="hidden sm:inline">
            Track your investments and daily expenses seamlessly.
          </span>
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-0">
        <AnimatePresence mode="wait">
          {activeTab === "transactions" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="relative w-28 xs:w-36 sm:w-48 md:w-56"
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border outline-none transition-all duration-150 ${
                  theme === "dark"
                    ? "bg-zinc-900/60 border-zinc-800 text-white placeholder-zinc-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-200"
                }`}
              />
              <Search
                size={13}
                className="absolute left-2.5 top-2.5 text-zinc-400 pointer-events-none opacity-70"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden lg:flex flex-col items-end font-mono shrink-0 select-none pr-1">
          <span className="text-xs font-semibold tracking-tight text-teal-500">
            {formattedTimeStr}
          </span>
          <span
            className={`text-[9px] font-medium tracking-wider uppercase ${
              theme === "dark" ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            {formattedDateStr}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl border transition-all duration-150 relative cursor-pointer active:scale-95 ${
              theme === "dark"
                ? "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
                : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <Bell size={14} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center rounded-full px-1 shadow-sm">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 top-10 w-64 sm:w-72 rounded-xl border p-3 shadow-2xl z-50 backdrop-blur-lg ${
                  theme === "dark"
                    ? "bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-black/80"
                    : "bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-300/60"
                }`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/10 dark:border-zinc-800/50 mb-2">
                  <h3 className="text-xs font-bold tracking-tight">
                    Recent Activity
                  </h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-teal-500 hover:underline font-semibold cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 text-center py-4 font-medium">
                      No recent notifications.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className="flex gap-2 items-start p-2 rounded-lg bg-zinc-500/5 text-[11px]"
                      >
                        <CheckCircle
                          size={12}
                          className="text-teal-500 mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium leading-tight text-left wrap-break-word">
                            {notif.text}
                          </p>
                          <span className="text-[9px] text-zinc-500 block mt-1 font-mono text-left">
                            {new Date(notif.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleTheme}
            className={`px-3 py-2 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-center text-xs font-semibold active:scale-95 ${
              theme === "dark"
                ? "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div
                  key="light-mode"
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center gap-1.5"
                >
                  <Sun size={14} className="text-teal-400 shrink-0" />
                  <span className="hidden sm:inline font-medium">Light</span>
                </motion.div>
              ) : (
                <motion.div
                  key="dark-mode"
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center gap-1.5"
                >
                  <Moon size={14} className="text-zinc-600 shrink-0" />
                  <span className="hidden sm:inline font-medium">Dark</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
