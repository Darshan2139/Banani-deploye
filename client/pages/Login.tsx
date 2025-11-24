import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/utils/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Loader2, ArrowLeft, Banana } from "lucide-react";
import { sendEmail } from "@/utils/emailClient";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already logged in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Get user profile for email
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("first_name")
          .eq("user_id", user.id)
          .maybeSingle();

        const firstName = profile?.first_name || "User";
        const timestamp = new Date().toLocaleString("en-IN");

        // Send login notification email
        await sendEmail("login", email, firstName, { timestamp });
      }

      // Successfully logged in, redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6 relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-white/80"
        title="Back to home"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">Back</span>
      </button>

      <Card className="w-full max-w-md shadow-2xl border-0 relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl"></div>
        <div className="p-6 sm:p-8 pt-8 sm:pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-lg animate-leaf-sway">
              <Banana className="w-6 h-6 text-yellow-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-green-900">
              BananiExpense
            </h1>
          </div>
          <p className="text-green-700 text-center text-sm sm:text-base mb-6">
            Welcome back! Sign in to your account
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 text-sm h-10 sm:h-11"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 text-sm h-10 sm:h-11"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 sm:py-2 rounded-lg transition-all flex items-center justify-center gap-2 h-11 sm:h-10 text-base sm:text-sm shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center mt-3">
              <Link
                to="/forgot-password"
                className="text-green-600 hover:text-green-700 font-semibold text-xs sm:text-sm"
              >
                Forgot Password?
              </Link>
            </div>
          </form>

          <p className="text-center text-gray-600 text-xs sm:text-sm mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
