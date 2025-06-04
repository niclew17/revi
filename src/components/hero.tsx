import Link from "next/link";
import { ArrowUpRight, Check, Mic, Star, Share2, BarChart } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Revi
              </span>{" "}
              - Get More Reviews With Voice
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Help your business collect more authentic reviews through the
              power of voice. Customers speak, we convert, your reputation
              grows.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
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
                <Mic className="w-8 h-8 text-blue-500" />
                <span className="font-medium">Voice Recording</span>
                <span className="text-xs text-center">
                  Simple interface for customers to record feedback
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white shadow-sm">
                <Star className="w-8 h-8 text-blue-500" />
                <span className="font-medium">AI Transcription</span>
                <span className="text-xs text-center">
                  Automatically convert voice to optimized text
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white shadow-sm">
                <Share2 className="w-8 h-8 text-blue-500" />
                <span className="font-medium">Multi-Platform</span>
                <span className="text-xs text-center">
                  Share to Google, Facebook, and Instagram
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white shadow-sm">
                <BarChart className="w-8 h-8 text-blue-500" />
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
