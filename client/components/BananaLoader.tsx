import { Banana } from "lucide-react";

export const BananaLoader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-green-50 via-white to-yellow-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Banana with spin animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <Banana
            className="w-20 h-20 text-yellow-500 animate-banana-spin relative z-10"
            strokeWidth={1.5}
          />
        </div>

        {/* Loading text with dots animation */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-bold text-green-700">
            Growing Your Farm...
          </h2>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>

        {/* Progress bar with gradient */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden border border-green-300">
          <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 animate-gradient-shift rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
