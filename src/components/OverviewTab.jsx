import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Sector,
} from "recharts";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
} from "lucide-react";

// Professional Custom Active Shape for premium bounce out effect
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // <-- Bounces out by 6px cleanly on hover
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: "drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.15))", // Adds an elegant premium lift shadow
          transition: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)", // Custom physics-based elastic spring transition
        }}
      />
    </g>
  );
};

function OverviewTab({
  data = {},
  chartFilter = "monthly",
  setChartFilter,
  theme,
  currency = "₹",
  referenceDate = new Date(), // <-- Syncing with Parent state
  setReferenceDate, // <-- Syncing with Parent state handler
}) {
  // Safe destructuring with fallback objects to prevent crashes
  const cards = data?.cards || {
    accountBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalSavings: 0,
  };
  const chartData = data?.chartData || [];
  const pieData = data?.pieData || [];
  const recentFeed = data?.recentFeed || [];

  const [activePieIndex, setActivePieIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Drag-to-scroll state engines for Horizontal Graph Wrapper
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const PIE_COLORS = [
    "#0d9488", // Teal
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#f43f5e", // Rose
    "#8b5cf6", // Violet
  ];

  const filterOptions = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  // Sync outside click for custom dropdown ref framework
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedFilter = localStorage.getItem("dashboardChartFilter");
    if (savedFilter && savedFilter !== chartFilter && setChartFilter) {
      setChartFilter(savedFilter);
    }
  }, [chartFilter, setChartFilter]);

  // Reset pagination state smoothly when user switches filter view
  const selectFilter = (value) => {
    if (setChartFilter) setChartFilter(value);
    localStorage.setItem("dashboardChartFilter", value);
    setIsDropdownOpen(false);
    if (setReferenceDate) setReferenceDate(new Date()); // Reset to present timestamp in parent
  };

  // FIXED: Pagination Handler now accurately mutates parent referenceDate to trigger useEffect API fetch
  const handlePagination = (direction) => {
    if (!setReferenceDate) return;

    const modifier = direction === "prev" ? -1 : 1;
    setReferenceDate((prevDate) => {
      const currentRef = prevDate ? new Date(prevDate) : new Date();
      const newDate = new Date(currentRef);
      if (chartFilter === "weekly") {
        newDate.setDate(newDate.getDate() + modifier * 7);
      } else if (chartFilter === "monthly") {
        newDate.setMonth(newDate.getMonth() + modifier);
      } else if (chartFilter === "yearly") {
        newDate.setFullYear(newDate.getFullYear() + modifier);
      }
      return newDate;
    });
  };

  // Generate beautiful real-time active range text string professionally
  const activeRangeText = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const activeDate = referenceDate ? new Date(referenceDate) : new Date();

    if (chartFilter === "weekly") {
      const currentDay = activeDate.getDay();
      const startOfWeek = new Date(activeDate);
      startOfWeek.setDate(activeDate.getDate() - currentDay);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.getDate()} ${months[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${months[endOfWeek.getMonth()]}`;
    }

    if (chartFilter === "monthly") {
      const fullMonths = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${fullMonths[activeDate.getMonth()]} ${activeDate.getFullYear()}`;
    }

    return `${activeDate.getFullYear()}`;
  }, [referenceDate, chartFilter]);

  // Safe weekday generator for cleaner charts without tampering original logic
  const displayChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    if (chartFilter === "weekly") {
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const activeDate = referenceDate ? new Date(referenceDate) : new Date();

      return chartData.map((item) => {
        if (!item._id) return item;

        const parts = item._id.split("/");
        if (parts.length === 2) {
          const currentYear = activeDate.getFullYear();
          const parsedDate = new Date(
            currentYear,
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10),
          );
          if (!isNaN(parsedDate)) {
            const dayName = daysOfWeek[parsedDate.getDay()];
            return {
              ...item,
              _id: `${dayName} (${item._id})`,
            };
          }
        }
        return item;
      });
    }

    return chartData;
  }, [chartData, chartFilter, referenceDate]);

  const totalPieValue = useMemo(() => {
    return pieData.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [pieData]);

  // Mouse Drag Events Framework
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleDragMove = (clientX, e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const x = clientX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Framer motion standard variants
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={gridContainerVariants}
      className="space-y-6 sm:space-y-8 pb-28 lg:pb-6 select-none transform-gpu text-sans"
    >
      {/* Global target style overrides to entirely wipe out black focus outline boxes */}
      <style>{`
        .recharts-wrapper, .recharts-surface, .recharts-sector, g, path, circle {
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .recharts-wrapper focus-visible, .recharts-surface focus-visible {
          outline: none !important;
        }
        ::-webkit-scrollbar {
          display: none !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* 1. METRIC CARDS GRID */}
      <motion.div
        variants={gridContainerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {/* Account Balance */}
        <motion.div
          variants={cardVariants}
          className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group hover:-translate-y-0.5 ${
            theme === "dark"
              ? "bg-zinc-900/40 border-zinc-900 text-white hover:border-zinc-800"
              : "bg-white border-zinc-100 text-zinc-900 shadow-sm hover:shadow-md"
          }`}
        >
          <div>
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Account Balance
            </p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-teal-500">
              {currency}
              {(cards?.accountBalance || 0).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500 transition-transform group-hover:scale-105 duration-200">
            <Wallet size={18} />
          </div>
        </motion.div>

        {/* Total Income */}
        <motion.div
          variants={cardVariants}
          className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group hover:-translate-y-0.5 ${
            theme === "dark"
              ? "bg-zinc-900/40 border-zinc-900 text-white hover:border-zinc-800"
              : "bg-white border-zinc-100 text-zinc-900 shadow-sm hover:shadow-md"
          }`}
        >
          <div>
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Total Income
            </p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-emerald-500">
              {currency}
              {(cards?.totalIncome || 0).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-105 duration-200">
            <ArrowDownLeft size={18} />
          </div>
        </motion.div>

        {/* Total Expense */}
        <motion.div
          variants={cardVariants}
          className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group hover:-translate-y-0.5 ${
            theme === "dark"
              ? "bg-zinc-900/40 border-zinc-900 text-white hover:border-zinc-800"
              : "bg-white border-zinc-100 text-zinc-900 shadow-sm hover:shadow-md"
          }`}
        >
          <div>
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Total Expense
            </p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-rose-500">
              {currency}
              {(cards?.totalExpense || 0).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 transition-transform group-hover:scale-105 duration-200">
            <ArrowUpRight size={18} />
          </div>
        </motion.div>

        {/* Total Savings */}
        <motion.div
          variants={cardVariants}
          className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group hover:-translate-y-0.5 ${
            theme === "dark"
              ? "bg-zinc-900/40 border-zinc-900 text-white hover:border-zinc-800"
              : "bg-white border-zinc-100 text-zinc-900 shadow-sm hover:shadow-md"
          }`}
        >
          <div>
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Total Savings
            </p>
            <h3 className="text-2xl font-black mt-1 tracking-tight text-blue-500">
              {currency}
              {(cards?.totalSavings || 0).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-105 duration-200">
            <PiggyBank size={18} />
          </div>
        </motion.div>
      </motion.div>

      {/* 2. VISUALIZATION LAYER */}
      <motion.div
        variants={cardVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Area Chart Component */}
        <div
          className={`lg:col-span-2 p-5 sm:p-6 rounded-2xl border flex flex-col justify-between min-h-95 transition-all duration-300 ${
            theme === "dark"
              ? "bg-zinc-900/40 border-zinc-900 text-white"
              : "bg-white border-zinc-100 text-zinc-900 shadow-sm"
          }`}
        >
          {/* Custom Header with Integrated Professional Nav Controls */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 z-30">
            <div>
              <h4 className="text-sm font-bold tracking-tight">
                Transaction Flow Analysis
              </h4>
              <p
                className={`text-[11px] font-semibold ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
              >
                Real-time cashflow trajectories and accounting velocity
              </p>
            </div>

            {/* Premium Control Wrapper (Arrows + Dropdown Layout) */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Premium Pagination Subsystem */}
              <div
                className={`flex items-center gap-1 p-1 rounded-xl border ${
                  theme === "dark"
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handlePagination("prev")}
                  className={`p-1 rounded-lg transition-all cursor-pointer ${
                    theme === "dark"
                      ? "hover:bg-zinc-900 text-zinc-400 hover:text-white"
                      : "hover:bg-white text-zinc-500 hover:text-zinc-900 shadow-sm"
                  }`}
                >
                  <ChevronLeft size={14} />
                </button>

                <span
                  className={`text-[10px] font-bold px-2 min-w-18.75 text-center tracking-tight ${
                    theme === "dark" ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  {activeRangeText}
                </span>

                <button
                  type="button"
                  onClick={() => handlePagination("next")}
                  className={`p-1 rounded-lg transition-all cursor-pointer ${
                    theme === "dark"
                      ? "hover:bg-zinc-900 text-zinc-400 hover:text-white"
                      : "hover:bg-white text-zinc-500 hover:text-zinc-900 shadow-sm"
                  }`}
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Sync Premium Dropdown Wrapper */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 pl-3 pr-2.5 py-2 text-xs font-bold rounded-xl border outline-none cursor-pointer transition-all ${
                    theme === "dark"
                      ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800/60"
                      : "bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <span>
                    {filterOptions.find((o) => o.value === chartFilter)?.label}
                  </span>
                  <ChevronDown size={13} className="text-zinc-400" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`absolute right-0 mt-1.5 w-28 rounded-xl border p-1 shadow-xl z-50 overflow-hidden ${
                        theme === "dark"
                          ? "bg-zinc-950 border-zinc-800 text-white"
                          : "bg-white border-zinc-200 text-zinc-900"
                      }`}
                    >
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => selectFilter(option.value)}
                          className={`flex items-center justify-between w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            chartFilter === option.value
                              ? "bg-teal-500/10 text-teal-500"
                              : theme === "dark"
                                ? "hover:bg-zinc-900 text-zinc-300"
                                : "hover:bg-zinc-50 text-zinc-600"
                          }`}
                        >
                          {option.label}
                          {chartFilter === option.value && <Check size={12} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Premium Swipeable Canvas System */}
          <div
            ref={scrollContainerRef}
            onMouseDown={(e) => handleDragStart(e.pageX)}
            onMouseMove={(e) => handleDragMove(e.pageX, e)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e)}
            onTouchEnd={handleDragEnd}
            className={`flex-1 w-full h-65 transform-gpu overflow-x-auto select-none touch-pan-x cursor-grab ${
              isDragging ? "cursor-grabbing" : ""
            }`}
          >
            {displayChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                No data available
              </div>
            ) : (
              <div className="h-full min-w-125 sm:min-w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={displayChartData}
                    margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="incomeFlow"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.06}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="expenseFlow"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f43f5e"
                          stopOpacity={0.06}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f43f5e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke={theme === "dark" ? "#1f1f23" : "#f4f4f5"}
                    />
                    <XAxis
                      dataKey="_id"
                      tick={{ fontSize: 10, fontWeight: "600" }}
                      stroke="#71717a"
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fontWeight: "600" }}
                      stroke="#71717a"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      shared={true}
                      cursor={{
                        stroke: theme === "dark" ? "#27272a" : "#e4e4e7",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                      wrapperStyle={{ pointerEvents: "none", zIndex: 100 }}
                      contentStyle={
                        theme === "dark"
                          ? {
                              backgroundColor: "#18181b",
                              borderColor: "#27272a",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#ffffff",
                            }
                          : {
                              backgroundColor: "#ffffff",
                              borderColor: "#f4f4f5",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#18181b",
                              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                            }
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#incomeFlow)"
                      activeDot={{
                        r: 5,
                        stroke: theme === "dark" ? "#18181b" : "#ffffff",
                        strokeWidth: 2,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#expenseFlow)"
                      activeDot={{
                        r: 5,
                        stroke: theme === "dark" ? "#18181b" : "#ffffff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Donut Pie Chart Component */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between min-h-95 transition-all duration-300 ${
            theme === "dark"
              ? "bg-zinc-900/40 border-zinc-900 text-white"
              : "bg-white border-zinc-100 text-zinc-900 shadow-sm"
          }`}
        >
          <div>
            <h4 className="text-sm font-bold tracking-tight">
              Expense Distribution
            </h4>
            <p
              className={`text-[11px] font-semibold ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
            >
              Segmented matrix breakdown
            </p>
          </div>

          <div className="flex-1 w-full h-55 flex items-center justify-center mt-4 transform-gpu relative">
            {pieData.length === 0 ? (
              <span className="text-xs font-semibold text-zinc-400">
                No structural outlay records found.
              </span>
            ) : (
              <>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 select-none">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block leading-none mb-1">
                    {activePieIndex !== -1
                      ? pieData[activePieIndex]?._id
                      : "Total"}
                  </span>
                  <span className="text-base font-black tracking-tight leading-none">
                    {activePieIndex !== -1
                      ? `${totalPieValue > 0 ? ((pieData[activePieIndex]?.value / totalPieValue) * 100).toFixed(1) : 0}%`
                      : `${currency}${totalPieValue.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={74}
                      outerRadius={92}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="_id"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(-1)}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          style={{
                            cursor: "pointer",
                            outline: "none",
                            transition: "fill 300ms ease",
                          }}
                        />
                      ))}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={7}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{
                        fontSize: "11px",
                        fontWeight: "600",
                        paddingTop: "10px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3. RECENT TRANSACTIONS FEED */}
      <motion.div
        variants={cardVariants}
        className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
          theme === "dark"
            ? "bg-zinc-900/40 border-zinc-900 text-white"
            : "bg-white border-zinc-100 text-zinc-900 shadow-sm"
        }`}
      >
        <div className="mb-4">
          <h4 className="text-sm font-bold tracking-tight">
            Recent Activity Log
          </h4>
          <p
            className={`text-[11px] font-semibold ${theme === "dark" ? "text-zinc-400" : "text-zinc-500"}`}
          >
            Latest mutations mapped across digital accounts
          </p>
        </div>

        <div
          className={`divide-y border-t ${theme === "dark" ? "divide-zinc-900 border-zinc-900" : "divide-zinc-50 border-zinc-50"}`}
        >
          {recentFeed.length === 0 ? (
            <p className="text-xs font-semibold text-zinc-400 py-8 text-center">
              No historical statements found on ledger accounts.
            </p>
          ) : (
            recentFeed.map((item) => (
              <div
                key={item._id}
                className={`flex justify-between items-center py-3.5 text-xs sm:text-sm font-semibold transition-all px-2 rounded-xl mt-1 ${
                  theme === "dark"
                    ? "hover:bg-zinc-900/40"
                    : "hover:bg-zinc-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
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
                      className={`tracking-tight font-bold ${theme === "dark" ? "text-zinc-100" : "text-zinc-800"}`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] uppercase font-bold border ${
                          theme === "dark"
                            ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                            : "bg-zinc-50 border-zinc-200/60 text-zinc-500"
                        }`}
                      >
                        {item.category}
                      </span>
                      •
                      <span className="flex items-center gap-0.5">
                        <Calendar size={10} className="opacity-70" />{" "}
                        {new Date(item.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold text-sm ${item.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {item.type === "income" ? "+" : "-"}
                  {currency}
                  {item.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default OverviewTab;
