import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/utils/supabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Banana,
  TrendingUp,
  BarChart3,
  Lock,
  Smartphone,
  Zap,
  ArrowRight,
  Check,
  Globe,
  ArrowDown,
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [headerBg, setHeaderBg] = useState("bg-white/80");
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkAuth();
  }, [navigate]);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle navbar transparency on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setHeaderBg("bg-white/95 backdrop-blur-md");
      } else {
        setHeaderBg("bg-white/80");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-yellow-50">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 ${headerBg} backdrop-blur-md border-b border-green-200 z-50 transition-all duration-300`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-3 sm:gap-4 justify-between">
          <Link to="/" className="flex items-center gap-2 group whitespace-nowrap">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-lg group-hover:shadow-lg transition-shadow animate-leaf-sway">
              <Banana className="w-6 h-6 text-yellow-300" />
            </div>
            <h1 className="text-2xl font-bold text-green-900">BananiExpense</h1>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end w-full sm:w-auto">
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

            <Link to="/login">
              <Button
                variant="ghost"
                className="text-green-700 hover:text-green-900 font-semibold"
              >
                {t("landing.navbar_login")}
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold transition-all hover:shadow-lg">
                {t("landing.navbar_get_started")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-bold text-green-900 leading-tight animate-grow-up">
                  {t("landing.hero_title")}{" "}
                  <span className="text-yellow-500">
                    {t("landing.hero_title_highlight")}
                  </span>
                </h2>
                <p className="text-xl text-gray-600">
                  {t("landing.hero_subtitle")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 text-lg rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1">
                    {t("landing.hero_create_account")}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full font-bold py-4 text-lg rounded-lg border-2 border-green-600 text-green-700 hover:bg-green-50 transition-colors"
                  >
                    {t("landing.hero_login")}
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500">
                {t("landing.hero_benefits")}
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative hidden md:block">
              <div className="bg-gradient-to-br from-green-100 to-yellow-100 rounded-3xl p-8 shadow-2xl border-2 border-green-200 animate-float-gentle">
                <div className="bg-white rounded-2xl p-6 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-green-900">
                      {t("landing.hero_today_entry")}
                    </h3>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {t("landing.hero_new")}
                    </span>
                  </div>
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {t("landing.hero_total_weight")}
                      </span>
                      <span className="font-bold text-lg text-gray-900">
                        125.5 kg
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {t("landing.hero_rate_per_20kg")}
                      </span>
                      <span className="font-bold text-lg text-gray-900">
                        ₹ 600
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-gray-600 font-semibold">
                        {t("landing.hero_todays_earnings")}
                      </span>
                      <span className="font-bold text-2xl text-orange-600 animate-growth-pulse">
                        ₹ 3,765
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gradient-to-b from-white via-green-50 to-white py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold text-green-900 mb-4 animate-grow-up">
                {t("landing.features_title")}
              </h3>
              <p className="text-xl text-gray-600">
                {t("landing.features_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:-translate-y-2 transition-transform duration-300 group">
                <div className="bg-green-600 p-3 rounded-lg w-fit mb-4 group-hover:animate-leaf-sway">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {t("landing.feature_columns_title")}
                </h4>
                <p className="text-green-700">
                  {t("landing.feature_columns_desc")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl border border-green-300 hover:-translate-y-2 transition-transform duration-300 group">
                <div className="bg-orange-600 p-3 rounded-lg w-fit mb-4 group-hover:animate-growth-pulse">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {t("landing.feature_earnings_title")}
                </h4>
                <p className="text-green-700">
                  {t("landing.feature_earnings_desc")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-300 hover:-translate-y-2 transition-transform duration-300 group">
                <div className="bg-yellow-600 p-3 rounded-lg w-fit mb-4 group-hover:animate-float-gentle">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {t("landing.feature_mobile_title")}
                </h4>
                <p className="text-green-700">
                  {t("landing.feature_mobile_desc")}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:-translate-y-2 transition-transform duration-300 group">
                <div className="bg-green-700 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {t("landing.feature_security_title")}
                </h4>
                <p className="text-green-700">
                  {t("landing.feature_security_desc")}
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-300 hover:-translate-y-2 transition-transform duration-300 group">
                <div className="bg-orange-600 p-3 rounded-lg w-fit mb-4 group-hover:animate-growth-pulse">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {t("landing.feature_excel_title")}
                </h4>
                <p className="text-green-700">
                  {t("landing.feature_excel_desc")}
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-8 bg-gradient-to-br from-yellow-50 to-green-50 rounded-2xl border border-yellow-200 hover:-translate-y-2 transition-transform duration-300 group">
                <div className="bg-green-600 p-3 rounded-lg w-fit mb-4 group-hover:animate-leaf-sway">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {t("landing.feature_payment_title")}
                </h4>
                <p className="text-green-700">
                  {t("landing.feature_payment_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-green-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold text-green-900 mb-4 animate-grow-up">
                {t("landing.howitworks_title")}
              </h3>
              <p className="text-xl text-gray-600">
                {t("landing.howitworks_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 animate-growth-pulse shadow-lg">
                  1
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {t("landing.howitworks_step1_title")}
                </h4>
                <p className="text-green-700">
                  {t("landing.howitworks_step1_desc")}
                </p>
              </div>

              <div className="text-center">
                <div
                  className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 animate-growth-pulse shadow-lg"
                  style={{ animationDelay: "0.3s" }}
                >
                  2
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {t("landing.howitworks_step2_title")}
                </h4>
                <p className="text-green-700">
                  {t("landing.howitworks_step2_desc")}
                </p>
              </div>

              <div className="text-center">
                <div
                  className="w-16 h-16 bg-gradient-to-br from-green-700 to-green-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 animate-growth-pulse shadow-lg"
                  style={{ animationDelay: "0.6s" }}
                >
                  3
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {t("landing.howitworks_step3_title")}
                </h4>
                <p className="text-green-700">
                  {t("landing.howitworks_step3_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-green-600 via-green-700 to-orange-600 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-grow-up">
              {t("landing.cta_title")}
            </h3>
            <p className="text-xl text-green-100 mb-8">
              {t("landing.cta_subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto bg-white text-green-700 hover:bg-green-50 font-bold py-4 px-8 text-lg rounded-lg transition-all hover:shadow-2xl">
                  {t("landing.cta_create_account")}
                </Button>
              </Link>
              <Link to="/login" className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto border-2 border-white bg-transparent text-white hover:bg-white hover:text-green-700 font-bold py-4 px-8 text-lg rounded-lg transition-all">
                  {t("landing.cta_login")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-green-900 text-green-100 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h5 className="font-bold text-white mb-4">
                  {t("common.app_name")}
                </h5>
                <p className="text-sm">{t("landing.footer_description")}</p>
              </div>
              <div>
                <h5 className="font-bold text-white mb-4">
                  {t("landing.footer_product")}
                </h5>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t("landing.footer_features")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t("landing.footer_pricing")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t("landing.footer_security")}
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-white mb-4">
                  {t("landing.footer_company")}
                </h5>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t("landing.footer_about")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t("landing.footer_blog")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t("landing.footer_contact")}
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-white mb-4">
                  {t("landing.footer_legal")}
                </h5>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t("landing.footer_privacy")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t("landing.footer_terms")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-green-800 pt-8 text-center text-sm">
              <p>{t("landing.footer_copyright")}</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
