import Link from "next/link";
import {
  ArrowUpRight,
  MousePointer,
  Star,
  Share2,
  BarChart,
} from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0fb0f0] to-black">
                Revio
              </span>{" "}
              - Get More Reviews With One Click
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Help your business collect more authentic reviews with our fast
              click-to-review system. Customers click, we connect, your
              reputation grows on Google and Meta platforms.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-custom-blue rounded-lg hover:bg-gradient-to-r hover:from-custom-blue hover:to-black transition-colors text-lg font-medium"
              >
                Create Review Links
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white shadow-sm">
                <MousePointer className="w-8 h-8 text-custom-blue" />
                <span className="font-medium">One-Click Reviews</span>
                <span className="text-xs text-center">
                  Simple interface for customers to leave feedback instantly
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white shadow-sm">
                <Star className="w-8 h-8 text-custom-blue" />
                <span className="font-medium">Smart Templates</span>
                <span className="text-xs text-center">
                  Pre-formatted review templates for quick submission
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white shadow-sm">
                <Share2 className="w-8 h-8 text-custom-blue" />
                <span className="font-medium">Meta & Google</span>
                <span className="text-xs text-center">
                  Direct posting to Google and Meta platforms
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white shadow-sm">
                <BarChart className="w-8 h-8 text-custom-blue" />
                <span className="font-medium">Analytics</span>
                <span className="text-xs text-center">
                  Track performance of technician review links
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
