import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  User,
  History,
  LogOut,
  Wallet,
} from "lucide-react";

function Sidebar({ activeTab, setActiveTab, theme }) {
  const navigate = useNavigate();

  // Navigation schema configured for core interface architecture
  const navigationTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "budgets", label: "Budgets", icon: PieChart },
    { id: "profile", label: "Profile", icon: User },
    { id: "history", label: "History & Reports", icon: History },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem("active_dashboard_tab", tabId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("active_dashboard_tab");
    navigate("/");
  };

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Fixed: added 'hidden' so it won't break on mobile screens) */}
      <aside
        className={`w-64 h-full flex-col border-r transition-colors duration-300 hidden md:flex shrink-0 font-sans transform-gpu ${
          theme === "dark"
            ? "bg-zinc-950 border-zinc-900 text-zinc-400"
            : "bg-white border-zinc-100 text-zinc-500"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-2.5 border-b border-inherit">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
            <Wallet size={20} className="animate-pulse" />
          </div>
          <span className="text-base font-black tracking-tight text-teal-500 uppercase text-left">
            Expense
            <span className={theme === "dark" ? "text-white" : "text-zinc-900"}>
              Tracker
            </span>
          </span>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 flex flex-col gap-1.5 mt-3">
          {navigationTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer group outline-none ${
                  isSelected
                    ? theme === "dark"
                      ? "text-teal-400"
                      : "text-white"
                    : theme === "dark"
                      ? "hover:text-zinc-100 text-zinc-400"
                      : "hover:text-zinc-900 text-zinc-500"
                }`}
              >
                {/* Sliding Background Indicator Layer */}
                {isSelected && (
                  <motion.div
                    layoutId="activeDesktopTabBg"
                    className={`absolute inset-0 rounded-xl z-0 ${
                      theme === "dark"
                        ? "bg-teal-500/10"
                        : "bg-zinc-900 shadow-md shadow-zinc-900/10"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Content Foreground */}
                <span className="relative z-10 flex items-center gap-3 w-full text-left">
                  <IconComponent
                    size={16}
                    className={
                      isSelected
                        ? "text-teal-500 dark:text-teal-400"
                        : "opacity-70 group-hover:opacity-100 transition-opacity"
                    }
                  />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-inherit">
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 dark:text-rose-400 transition-all duration-200 cursor-pointer ${
              theme === "dark" ? "hover:bg-rose-500/10" : "hover:bg-rose-50"
            }`}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 h-16 border-t flex md:hidden justify-around items-center px-1 shadow-2xl transition-colors duration-300 font-sans transform-gpu ${
          theme === "dark"
            ? "bg-zinc-950/90 border-zinc-900 text-zinc-400 backdrop-blur-lg"
            : "bg-white/95 border-zinc-100 text-zinc-500 backdrop-blur-lg shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.03)]"
        }`}
      >
        {navigationTabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 outline-none cursor-pointer ${
                isSelected
                  ? "text-teal-500 dark:text-teal-400 font-bold"
                  : "opacity-60 text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {/* Mobile Active Indicator Pill */}
              {isSelected && (
                <motion.div
                  layoutId="activeMobileTabIndicator"
                  className="absolute top-0 w-8 h-0.5 bg-teal-500 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <IconComponent
                size={16}
                className={
                  isSelected
                    ? "text-teal-500 dark:text-teal-400 scale-[1.05]"
                    : "transition-transform"
                }
              />
              <span className="text-[9px] tracking-tight font-bold">
                {tab.id === "dashboard" ? "Home" : tab.label.split(" ")[0]}
              </span>
            </button>
          );
        })}

        {/* Exit Control Link */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 text-rose-500 opacity-80 hover:opacity-100 cursor-pointer"
        >
          <LogOut size={16} />
          <span className="text-[9px] tracking-tight font-bold">Exit</span>
        </button>
      </div>
    </>
  );
}

export default Sidebar;
