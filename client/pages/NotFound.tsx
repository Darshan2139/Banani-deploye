import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-2xl font-semibold text-gray-900">Page Not Found</p>
        <p className="text-gray-600 text-lg">
          Sorry! The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
