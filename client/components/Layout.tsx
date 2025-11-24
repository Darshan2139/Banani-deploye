import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabaseClient";
import { Button } from "@/components/ui/button";
import { LogOut, Banana } from "lucide-react";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export const Layout = ({ children, showNav = true }: LayoutProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (!showNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-green-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-lg group-hover:shadow-lg transition-shadow animate-leaf-sway">
                <Banana className="w-6 h-6 text-yellow-300" />
              </div>
              <h1 className="text-2xl font-bold text-green-900">
                BananiExpense
              </h1>
            </Link>

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-green-700">{user.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-green-700 hover:text-green-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-green-50 border-t border-green-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-green-700">
            © 2025 BananiExpense. Track your banana entries with ease.
          </p>
        </div>
      </footer>
    </div>
  );
};
