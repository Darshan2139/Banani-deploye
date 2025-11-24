import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase, Language } from "@/utils/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Check,
  ArrowDown,
  LogOut,
} from "lucide-react";

interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  language: Language;
}

export default function Settings() {
  const navigate = useNavigate();
  const { t, language, setLanguage, loading: languageLoading } = useLanguage();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    language: "en" as Language,
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profileError && profile) {
        setUserProfile(profile as UserProfile);
        setFormData({
          username: profile.username || "",
          display_name: profile.display_name || "",
          bio: profile.bio || "",
          language: (profile.language || "en") as Language,
        });
      }
    } catch (err: any) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    setError("");
    setSuccess("");
    setUpdatingProfile(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("User not authenticated");
        setUpdatingProfile(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setSuccess(t("settings.profile_updated"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || t("settings.error_updating"));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      await setLanguage(newLanguage);
      setFormData((prev) => ({ ...prev, language: newLanguage }));
      setSuccess(t("settings.profile_updated"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to update language preference");
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError(t("settings.password_mismatch"));
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError(t("validation.password_too_short"));
      return;
    }

    setUpdatingPassword(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("User not authenticated");
        setUpdatingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.new_password,
      });

      if (updateError) throw updateError;

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setSuccess(t("settings.password_updated"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout");
    }
  };

  if (loading || languageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-6 sm:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-green-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1 sm:gap-2 text-green-700 hover:text-green-900 p-2 h-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t("common.back")}</span>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-green-900 animate-grow-up">
              {t("settings.title")}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-grow-up">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Profile Settings Section */}
          <Card className="p-4 sm:p-6 border border-green-200">
            <h2 className="text-lg sm:text-xl font-bold text-green-900 mb-4 sm:mb-6">
              {t("settings.profile_section")}
            </h2>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("settings.username")}
                </label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleProfileChange("username", e.target.value)
                  }
                  className="w-full text-sm h-10 sm:h-11 border-green-200 focus:ring-green-600"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label
                  htmlFor="display_name"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("settings.display_name")}
                </label>
                <Input
                  id="display_name"
                  type="text"
                  value={formData.display_name}
                  onChange={(e) =>
                    handleProfileChange("display_name", e.target.value)
                  }
                  className="w-full text-sm h-10 sm:h-11 border-green-200 focus:ring-green-600"
                  placeholder="Enter display name"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("settings.bio")}
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  className="w-full text-sm p-2 sm:p-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 min-h-24"
                  placeholder="Enter bio"
                />
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={updatingProfile}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 sm:py-3 rounded-lg h-10 sm:h-11 transition-all hover:shadow-lg"
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("common.save")}
                  </>
                ) : (
                  t("settings.update_profile")
                )}
              </Button>
            </div>
          </Card>

          {/* Language Preference Section */}
          <Card className="p-4 sm:p-6 border border-green-200">
            <h2 className="text-lg sm:text-xl font-bold text-green-900 mb-4 sm:mb-6">
              {t("settings.preferences_section")}
            </h2>

            <div>
              <label
                htmlFor="language"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
              >
                {t("settings.language_preference")}
              </label>
              <div className="relative inline-block w-full sm:w-64">
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) =>
                    handleLanguageChange(e.target.value as Language)
                  }
                  className="w-full appearance-none bg-white border border-green-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="en">English</option>
                  <option value="gu">ગુજરાતી</option>
                  <option value="hi">हिंदी</option>
                </select>
                <ArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>
            </div>
          </Card>

          {/* Security Settings Section */}
          <Card className="p-4 sm:p-6 border border-green-200">
            <h2 className="text-lg sm:text-xl font-bold text-green-900 mb-4 sm:mb-6">
              {t("settings.security_section")}
            </h2>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label
                  htmlFor="new_password"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("settings.new_password")}
                </label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    handlePasswordChange("new_password", e.target.value)
                  }
                  className="w-full text-sm h-10 sm:h-11 border-green-200 focus:ring-green-600"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  {t("settings.confirm_password")}
                </label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    handlePasswordChange("confirm_password", e.target.value)
                  }
                  className="w-full text-sm h-10 sm:h-11 border-green-200 focus:ring-green-600"
                  placeholder="Confirm password"
                />
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={updatingPassword || !passwordData.new_password}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 sm:py-3 rounded-lg h-10 sm:h-11 transition-all hover:shadow-lg"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("common.save")}
                  </>
                ) : (
                  t("settings.reset_password")
                )}
              </Button>
            </div>
          </Card>

          {/* Logout Section */}
          <Card className="p-4 sm:p-6 border-2 border-red-200 bg-red-50">
            <h2 className="text-lg sm:text-xl font-bold text-red-900 mb-3 sm:mb-4">
              {t("common.logout")}
            </h2>
            <p className="text-sm text-red-700 mb-4 sm:mb-6">
              Sign out from your account. You'll need to login again to access
              your data.
            </p>
            <Button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 sm:py-3 rounded-lg h-10 sm:h-11 flex items-center justify-center gap-2 transition-all hover:shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              {t("common.logout")}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
