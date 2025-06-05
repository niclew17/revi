import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  Mic,
  MessageSquare,
  Share2,
  BarChart,
  Link,
  Users2,
  Headphones,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Revi Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our streamlined process makes collecting and sharing customer
              reviews easier than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-custom-blue/10 rounded-full flex items-center justify-center mb-6">
                <Link className="w-8 h-8 text-custom-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                1. Create Review Links
              </h3>
              <p className="text-gray-600">
                Generate unique review links for each of your service
                technicians through our admin dashboard.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-custom-blue/10 rounded-full flex items-center justify-center mb-6">
                <Mic className="w-8 h-8 text-custom-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                2. Collect Voice Reviews
              </h3>
              <p className="text-gray-600">
                Customers use these links to record their voice feedback in
                seconds - no typing required.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-custom-blue/10 rounded-full flex items-center justify-center mb-6">
                <Share2 className="w-8 h-8 text-custom-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                3. Share Everywhere
              </h3>
              <p className="text-gray-600">
                Our AI converts voice to optimized text reviews that can be
                shared across multiple platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to streamline your review collection process
              and boost your online presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Mic className="w-6 h-6" />,
                title: "Voice Recording Interface",
                description:
                  "Simple, intuitive recording with audio visualization",
              },
              {
                icon: <Users2 className="w-6 h-6" />,
                title: "Admin Dashboard",
                description:
                  "Create and manage unique review links for each technician",
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "AI Transcription Engine",
                description:
                  "Convert voice to optimized text for different platforms",
              },
              {
                icon: <Share2 className="w-6 h-6" />,
                title: "Multi-Platform Publishing",
                description:
                  "One-click posting to Google, Facebook, and Instagram",
              },
              {
                icon: <Link className="w-6 h-6" />,
                title: "Link Management",
                description:
                  "Generate and track performance of technician links",
              },
              {
                icon: <BarChart className="w-6 h-6" />,
                title: "Analytics Dashboard",
                description: "Comprehensive insights into review performance",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-custom-blue mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Service businesses love how Revi simplifies their review
              collection process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Headphones className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">HVAC Service Manager</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Our technicians love sharing their Revi links with customers.
                We've seen a 300% increase in reviews since implementing the
                system."
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Headphones className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Michael Rodriguez</h4>
                  <p className="text-sm text-gray-500">
                    Plumbing Company Owner
                  </p>
                </div>
              </div>
              <p className="text-gray-600">
                "The voice recording feature is a game-changer. Our customers
                find it so much easier than typing out reviews on multiple
                platforms."
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Headphones className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Jennifer Lee</h4>
                  <p className="text-sm text-gray-500">
                    Electrical Services Director
                  </p>
                </div>
              </div>
              <p className="text-gray-600">
                "The analytics dashboard gives us incredible insights into which
                technicians are generating the most positive feedback."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your service business. No hidden fees.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-16 max-w-5xl mx-auto">
            {plans?.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-custom-blue to-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Review Process?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join service businesses that are collecting more authentic reviews
            with less effort.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 text-custom-blue bg-white rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Create Your First Review Link
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
