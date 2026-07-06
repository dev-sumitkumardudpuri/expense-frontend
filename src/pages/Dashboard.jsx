import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import OverviewTab from "../components/OverviewTab";
import TransactionsTab from "../components/TransactionsTab";
import ProfileTab from "../components/ProfileTab";
import HistoryTab from "../components/HistoryTab";
import BudgetTab from "../components/BudgetTab";

// Base URL utility configuration for seamless deployment
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Dashboard() {
  const navigate = useNavigate();

  // Load active tab state with localStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("active_dashboard_tab") || "dashboard";
  });

  // Load UI dark/light mode preference
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [chartFilter, setChartFilter] = useState("monthly");

  // NEW STATE: Tracks active range mutations beautifully across time intervals
  const [referenceDate, setReferenceDate] = useState(new Date());

  const [user, setUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [dashboardData, setDashboardData] = useState({
    cards: {
      accountBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalSavings: 0,
    },
    chartData: [],
    pieData: [],
    recentFeed: [],
  });
  const [loading, setLoading] = useState(true);

  // Debounce handler for fluid search interface responsiveness
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync active view tab selection changes to local cache
  useEffect(() => {
    localStorage.setItem("active_dashboard_tab", activeTab);
  }, [activeTab]);

  const toggleTheme = () => {
    const updatedTheme = theme === "dark" ? "light" : "dark";
    setTheme(updatedTheme);
    localStorage.setItem("theme", updatedTheme);
  };

  // Keep HTML root class aligned with active theme state
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // Fetch metrics data from financial tracking API
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      // UPDATED PARAMETERS: Passing active reference date safely to backend
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          chartFilter,
          referenceDate: referenceDate.toISOString(), // Synergizes client updates to API ledger
        },
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/transactions/dashboard`,
        config,
      );
      if (response.data.success) {
        setDashboardData(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to sync dashboard metrics data:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    }
  }, [chartFilter, referenceDate, navigate]); // <-- Added referenceDate to dependency array

  const handleGlobalRefresh = useCallback(() => {
    fetchDashboardMetrics();
    setRefreshTrigger((prev) => prev + 1);
  }, [fetchDashboardMetrics]);

  // Update profile records inside global database storage
  const handleSaveProfileInDB = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update-profile`,
        updatedData,
        config,
      );

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return response.data;
      }
    } catch (error) {
      console.error("Database user profile update failed:", error);
      throw error;
    }
  };

  // Check user session status on initial lifecycle mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (user) fetchDashboardMetrics();
  }, [user, fetchDashboardMetrics, refreshTrigger]);

  // Content placeholder loader layout view
  const ShimmerLoader = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-6 animate-pulse select-none"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-28 rounded-2xl ${theme === "dark" ? "bg-zinc-900/60" : "bg-zinc-200"}`}
          />
        ))}
      </div>
    </motion.div>
  );

  // Tab View Controller Handler Switcher
  const renderActiveTabWorkspace = () => {
    const currentCurrency = user?.currency || "₹";

    switch (activeTab) {
      case "dashboard":
        return loading ? (
          <ShimmerLoader key="shimmer" />
        ) : (
          <OverviewTab
            key="overview"
            data={dashboardData}
            chartFilter={chartFilter}
            setChartFilter={setChartFilter}
            referenceDate={referenceDate} // <-- PASSED NEW STATE
            setReferenceDate={setReferenceDate} // <-- PASSED NEW STATE HANDLER
            refreshData={handleGlobalRefresh}
            theme={theme}
            currency={currentCurrency}
          />
        );
      case "transactions":
        return (
          <TransactionsTab
            key={`transactions-${refreshTrigger}`}
            searchQuery={debouncedSearchQuery}
            refreshData={handleGlobalRefresh}
            theme={theme}
            currency={currentCurrency}
          />
        );
      case "budgets":
        return (
          <BudgetTab key="budgets" theme={theme} currency={currentCurrency} />
        );
      case "profile":
        return (
          <ProfileTab
            key="profile"
            user={user}
            theme={theme}
            onSaveProfile={handleSaveProfileInDB}
          />
        );
      case "history":
        return (
          <HistoryTab key="history" theme={theme} currency={currentCurrency} />
        );
      default:
        return loading ? (
          <ShimmerLoader key="shimmer-def" />
        ) : (
          <OverviewTab
            key="overview-def"
            data={dashboardData}
            chartFilter={chartFilter}
            setChartFilter={setChartFilter}
            referenceDate={referenceDate} // <-- PASSED NEW STATE TO DEFAULT VIEW
            setReferenceDate={setReferenceDate} // <-- PASSED NEW STATE HANDLER TO DEFAULT VIEW
            theme={theme}
            currency={currentCurrency}
          />
        );
    }
  };

  return (
    <div
      className={`flex h-screen w-full font-sans transition-colors duration-300 overflow-hidden ${
        theme === "dark"
          ? "bg-zinc-950 text-zinc-50"
          : "bg-zinc-50 text-zinc-900"
      }`}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
        />

        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 transform-gpu scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full transform-gpu"
            >
              {renderActiveTabWorkspace()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
