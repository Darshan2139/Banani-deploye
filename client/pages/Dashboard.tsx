import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase, BananaEntry, Language } from "@/utils/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Search,
  ChevronRight,
  Calendar,
  LogOut,
  Loader2,
  AlertCircle,
  TrendingUp,
  Settings,
  Globe,
  ArrowDown,
  User,
  X,
  ChevronDown,
} from "lucide-react";
import CalendarComponent from "@/components/Calendar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [entries, setEntries] = useState<BananaEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<BananaEntry[]>([]);
  const [searchDate, setSearchDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [headerBg, setHeaderBg] = useState("bg-white");
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchDate, entries]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setShowLanguageMenu(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle navbar transparency on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setHeaderBg("bg-white/90 backdrop-blur-md");
      } else {
        setHeaderBg("bg-white");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/login");
        return;
      }

      const email = user.email || "User";
      setUserEmail(email);

      try {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile && profile.first_name && profile.last_name) {
          setUserName(`${profile.first_name} ${profile.last_name}`);
        } else {
          const name = email.split("@")[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      } catch (err) {
        const name = email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }

      loadEntries(user.id);
    } catch (err: any) {
      setError("Failed to load data");
      console.error(err);
    }
  };

  const loadEntries = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("banana_entries")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (fetchError) {
        console.warn("Table not found or no data:", fetchError);
        setEntries([]);
        setFilteredEntries([]);
      } else {
        setEntries(data || []);
        setFilteredEntries(data || []);
      }
    } catch (err: any) {
      console.error(err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    if (!searchDate) {
      setFilteredEntries(entries);
      return;
    }

    const filtered = entries.filter((entry) => {
      const entryDate = new Date(entry.date).toLocaleDateString("en-IN");
      return entryDate.includes(searchDate);
    });
    setFilteredEntries(filtered);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const totalEarnings = entries.reduce(
    (sum, entry) => sum + (entry.total_earned || 0),
    0,
  );

  const monthlyEarnings = entries.reduce(
    (acc, entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });

      if (!acc[monthKey]) {
        acc[monthKey] = { monthName, total: 0 };
      }
      acc[monthKey].total += entry.total_earned || 0;
      return acc;
    },
    {} as Record<string, { monthName: string; total: number }>,
  );

  const sortedMonthlyEarnings = Object.entries(monthlyEarnings)
    .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
    .map(([_, value]) => value);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-6 sm:pb-8">
      {/* Header */}
      <header
        className={`${headerBg} border-b border-green-200 sticky top-0 z-50 shadow-sm transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-green-900">
              {t("common.app_name")}
            </h1>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Selector */}
              <div className="relative" ref={languageMenuRef}>
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-1 sm:gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg h-9 sm:h-10 transition-colors border border-green-200"
                  title="Change language"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {language === "en" ? "EN" : language === "gu" ? "ગુ" : "हि"}
                  </span>
                  <ArrowDown className="w-3 h-3 hidden sm:inline" />
                </button>

                {/* Language Dropdown */}
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-1 bg-white border border-green-200 rounded-lg shadow-lg z-50 min-w-32">
                    <button
                      onClick={() => {
                        setLanguage("en");
                        setShowLanguageMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${language === "en" ? "bg-green-100 text-green-900 font-semibold" : "text-gray-700"}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("gu");
                        setShowLanguageMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${language === "gu" ? "bg-green-100 text-green-900 font-semibold" : "text-gray-700"}`}
                    >
                      ગુજરાતી
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("hi");
                        setShowLanguageMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${language === "hi" ? "bg-green-100 text-green-900 font-semibold" : "text-gray-700"}`}
                    >
                      हिंदी
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 hover:shadow-lg transition-shadow font-semibold text-sm"
                  title="User Profile"
                >
                  {userName
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-50 min-w-56">
                    <div className="px-4 py-3 border-b border-green-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-gray-700 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings & Profile
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 border-t border-green-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-green-600 via-green-700 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-lg animate-grow-up">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2">
              {t("dashboard.welcome", { name: userName })}
            </h2>
            <p className="text-sm sm:text-lg text-green-100">
              {t("dashboard.subtitle")}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {/* New Entry Button */}
            <Link to="/calculator" className="group">
              <Card className="p-6 sm:p-8 bg-gradient-to-br from-yellow-400 to-orange-500 hover:shadow-lg hover:-translate-y-2 transition-all cursor-pointer border-0 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-900 text-xs sm:text-sm font-medium mb-1">
                      {t("dashboard.create_new")}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-orange-950">
                      {t("dashboard.new_entry")}
                    </h3>
                  </div>
                  <Plus className="w-10 h-10 sm:w-12 sm:h-12 text-orange-900 opacity-50 group-hover:opacity-70 group-hover:animate-float-gentle transition-opacity" />
                </div>
              </Card>
            </Link>

            {/* Total Earnings Card */}
            {entries.length > 0 && (
              <Card className="p-6 sm:p-8 bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-900 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {t("dashboard.total_earnings")}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-orange-700">
                      ₹ {totalEarnings.toFixed(2)}
                    </h3>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Monthly Earnings */}
          {sortedMonthlyEarnings.length > 0 && (
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-900 mb-4 sm:mb-6 flex items-center gap-2 animate-grow-up">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                {t("dashboard.monthly_earnings")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {sortedMonthlyEarnings.map((monthly, idx) => (
                  <Card
                    key={idx}
                    className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-600 hover:-translate-y-2 transition-all"
                  >
                    <p className="text-green-700 text-xs sm:text-sm font-medium mb-2">
                      {monthly.monthName}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700">
                      ₹ {monthly.total.toFixed(2)}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="space-y-4 sm:space-y-6" ref={calendarRef}>
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-green-200">
              <div
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full flex items-center justify-between gap-2 mb-3 sm:mb-4 hover:bg-green-50 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <label className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                    {t("dashboard.search_by_date")}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {searchDate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchDate("");
                      }}
                      className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-200 ${
                      showCalendar ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Calendar Component - Show/Hide */}
              {showCalendar && (
                <CalendarComponent
                  entries={entries}
                  onDateSelect={(date) => setSearchDate(date)}
                  selectedDate={searchDate}
                />
              )}
            </div>

            {/* Text input for manual entry */}
            {searchDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <p className="text-xs sm:text-sm text-green-700">
                  <span className="font-semibold">
                    {t("dashboard.search_by_date")}:
                  </span>{" "}
                  {searchDate}
                </p>
              </div>
            )}
          </div>

          {/* History Section */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-green-900 mb-4 sm:mb-6 flex items-center gap-2 animate-grow-up">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              {t("dashboard.your_entries")}
            </h3>

            {error && (
              <div className="mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-green-700">
                  {t("dashboard.table_not_created")}
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">
                  {searchDate
                    ? t("dashboard.no_entries_found")
                    : t("dashboard.no_entries")}
                </p>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {filteredEntries.map((entry) => (
                  <Link key={entry.id} to={`/entry/${entry.id}`}>
                    <Card className="p-4 sm:p-6 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer border-l-4 border-l-green-600 h-full">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                              {new Date(entry.date).toLocaleDateString(
                                "en-IN",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </h4>
                            {entry.dealer_name && (
                              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                                {entry.dealer_name}
                              </span>
                            )}
                            {entry.location && (
                              <span className="inline-block bg-green-100 text-green-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                                {entry.location}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-gray-500 mb-0.5">
                                {t("dashboard.total_weight")}
                              </p>
                              <p className="text-gray-900 font-semibold">
                                {(entry.grand_total || 0).toFixed(2)} kg
                              </p>
                            </div>
                            {entry.rate_per_20kg && (
                              <div>
                                <p className="text-gray-500 mb-0.5">
                                  {t("dashboard.rate_per_20kg")}
                                </p>
                                <p className="text-gray-900 font-semibold">
                                  ₹ {entry.rate_per_20kg}
                                </p>
                              </div>
                            )}
                            {entry.total_earned !== undefined &&
                              entry.total_earned !== null && (
                                <div>
                                  <p className="text-gray-500 mb-0.5">
                                    {t("dashboard.todays_earnings")}
                                  </p>
                                  <p className="text-orange-600 font-semibold animate-growth-pulse">
                                    ₹ {(entry.total_earned || 0).toFixed(2)}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
