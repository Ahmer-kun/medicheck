import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { useNavigate } from "react-router-dom";

function IndustriesPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const logoImage = require("../pictures/MSG2.jpeg");

  const industries = [
    {
      id: "pharmaceuticals",
      title: "Pharmaceutical Manufacturers",
      description: "Track medicine batches from production through the entire supply chain with complete transparency and regulatory compliance.",
      icon: "🏭",
      color: "from-blue-500 to-cyan-500",
      features: [
        "Batch registration on blockchain",
        "Real-time production tracking",
        "Regulatory compliance automation",
        "Supply chain visibility",
        "Quality control integration"
      ],
      stats: [
        { label: "Batch Accuracy", value: "99.8%" },
        { label: "Compliance Rate", value: "98%" },
        { label: "Recall Reduction", value: "85%" }
      ]
    },
    {
      id: "hospitals",
      title: "Hospital Pharmacies",
      description: "Ensure patient safety with verified medicines, automated stock management, and expiration alerts for critical care environments.",
      icon: "🏥",
      color: "from-purple-500 to-violet-500",
      features: [
        "Medicine authenticity verification",
        "Automated stock management",
        "Expiration alerts system",
        "Patient safety compliance",
        "Inventory optimization tools"
      ],
      stats: [
        { label: "Medicine Safety", value: "100%" },
        { label: "Stock Accuracy", value: "96%" },
        { label: "Waste Reduction", value: "60%" }
      ]
    },
    {
      id: "retail",
      title: "Retail Pharmacies",
      description: "Build customer trust with transparent medicine sourcing and instant verification capabilities for retail environments.",
      icon: "🏪",
      color: "from-orange-500 to-amber-500",
      features: [
        "Customer verification portal",
        "Supply chain transparency",
        "Recall management system",
        "Customer trust building",
        "Sales analytics dashboard"
      ],
      stats: [
        { label: "Customer Trust", value: "95%" },
        { label: "Recall Response", value: "Immediate" },
        { label: "Sales Growth", value: "25%" }
      ]
    },
    {
      id: "manufacturing",
      title: "API & Raw Material Manufacturers",
      description: "Track active pharmaceutical ingredients and raw materials through the manufacturing process with blockchain verification.",
      icon: "⚗️",
      color: "from-green-500 to-emerald-500",
      features: [
        "API batch tracking",
        "Raw material traceability",
        "Quality certification storage",
        "Compliance documentation",
        "Supplier verification"
      ],
      stats: [
        { label: "Traceability", value: "100%" },
        { label: "Quality Assurance", value: "99%" },
        { label: "Audit Efficiency", value: "70%" }
      ]
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Quality Control Director",
      company: "MediLife Pharmaceuticals",
      quote: "Medicheck has revolutionized our supply chain. The blockchain tracking gives us unprecedented visibility into every batch from production to delivery.",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
      name: "Michael Chen",
      role: "Chief Pharmacist",
      company: "City Health Pharmacy",
      quote: "Our customers trust our medicines more knowing they can verify authenticity instantly. It's transformed how we manage inventory and ensure patient safety.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Robert Williams",
      role: "Manufacturing Director",
      company: "PharmaTech Solutions",
      quote: "Implementing Medicheck across our manufacturing facilities reduced compliance costs by 40% and improved audit efficiency by 70%. Essential for modern pharma.",
      avatar: "https://randomuser.me/api/portraits/men/55.jpg"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsScrolled(currentScroll > 50);
      setShowBackToTop(currentScroll > 300);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (currentScroll / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toggleMobileMenu = () => setShowMobileMenu(prev => !prev);
  const handleNavClick = (page) => {
    navigate(page === "home" ? "/" : `/${page}`);
    setShowMobileMenu(false);
  };

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#0B0E14] text-white font-sans">
        {/* Scroll progress bar */}
        <div
          className="fixed top-0 left-0 z-[60] h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Back to Top (fade, no bounce) */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-50 bg-gray-900/80 backdrop-blur-md border border-white/10 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 ${
            showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          aria-label="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-gray-900/85 backdrop-blur-xl shadow-xl border-b border-white/5" : "bg-transparent"
        }`}>
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0">
                  <img src={logoImage} alt="Medicheck Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Medicheck</h1>
                  <p className="text-xs text-slate-400">Blockchain Medicine Tracker</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <button onClick={() => navigate("/")} className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">Home</button>
                <button onClick={() => navigate("/how-it-works")} className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">How It Works</button>
                <button className="text-cyan-400 font-medium">Industries</button>
                <button onClick={() => navigate("/contact")} className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">Contact</button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/role-selection")}
                  className="bg-white text-blue-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base focus:ring-2 focus:ring-cyan-400"
                >
                  Get Started
                </button>
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden text-slate-300 hover:text-white p-2 focus:ring-2 focus:ring-cyan-400 rounded"
                  aria-label="Toggle menu"
                >
                  {showMobileMenu ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-white/5">
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col gap-3">
                  <button onClick={() => handleNavClick("home")} className="text-slate-300 hover:text-cyan-400 font-medium text-left py-2">Home</button>
                  <button onClick={() => handleNavClick("how-it-works")} className="text-slate-300 hover:text-cyan-400 font-medium text-left py-2">How It Works</button>
                  <button className="text-cyan-400 font-medium text-left py-2">Industries</button>
                  <button onClick={() => handleNavClick("contact")} className="text-slate-300 hover:text-cyan-400 font-medium text-left py-2">Contact</button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section (badge removed) */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/15 via-transparent to-cyan-900/15 opacity-40 pointer-events-none" />
          <div className="container mx-auto relative z-10 max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Tailored <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Solutions</span>
              <br />for Healthcare
            </h1>
            <p className="text-lg text-slate-200 leading-relaxed max-w-3xl mx-auto">
              Medicheck provides specialized solutions for every stakeholder in the pharmaceutical ecosystem, ensuring safety, transparency, and operational efficiency.
            </p>
          </div>
        </section>

        {/* Industry Solutions Tabs */}
        <section className="py-20 px-4 bg-gradient-to-b from-gray-900/30 to-blue-950/20 w-full">
          <div className="container mx-auto max-w-7xl">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto gap-3 mb-12 pb-2 scrollbar-hide">
              {industries.map((industry, index) => (
                <button
                  key={industry.id}
                  onClick={() => setActiveIndustry(index)}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                    activeIndustry === index
                      ? "bg-white text-blue-900 shadow-lg"
                      : "bg-gray-800/60 backdrop-blur-md border border-white/5 text-slate-300 hover:bg-gray-700/80"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{industry.icon}</span>
                    <span className="whitespace-nowrap">{industry.title.split(' ')[0]}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Active Industry Card */}
            <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 border border-white/5 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column */}
                <div>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${industries[activeIndustry].color} flex items-center justify-center text-white text-2xl mb-6`}>
                    {industries[activeIndustry].icon}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">{industries[activeIndustry].title}</h2>
                  <p className="text-slate-200 text-lg leading-relaxed mb-8">{industries[activeIndustry].description}</p>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {industries[activeIndustry].features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                          <span className="text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Performance Impact</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {industries[activeIndustry].stats.map((stat, i) => (
                        <div key={i} className="bg-gray-900/60 rounded-xl p-4 text-center">
                          <div className="text-2xl md:text-3xl font-bold text-white font-mono tabular-nums mb-1">{stat.value}</div>
                          <div className="text-slate-400 text-sm">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">Industry Benefits</h3>
                    <div className="space-y-3">
                      {["Enhanced patient safety and trust", "Regulatory compliance automation", "Supply chain transparency", "Reduced operational costs", "Improved brand reputation"].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                          <span className="text-slate-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
                    <h4 className="text-xl font-bold text-white mb-3">Ready to Transform?</h4>
                    <p className="text-slate-200 text-sm mb-4">
                      See how Medicheck can revolutionize your operations in the {industries[activeIndustry].title.toLowerCase()} sector.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => navigate("/role-selection")}
                        className="flex-1 bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                      >
                        Request Demo
                      </button>
                      <button
                        onClick={() => navigate("/contact")}
                        className="flex-1 border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all"
                      >
                        Contact Sales
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-gray-900/40 w-full">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Industry Testimonials</h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">Hear from healthcare leaders who have transformed their operations with Medicheck</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="relative bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 border border-white/5 shadow-lg">
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-l-2xl" />
                  <div className="flex items-center gap-4 mb-6">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
                    <div>
                      <div className="font-bold text-white text-lg">{testimonial.name}</div>
                      <div className="text-slate-400 text-sm">{testimonial.role}</div>
                      <div className="text-cyan-400 text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                  <blockquote className="text-slate-200 italic leading-relaxed">“{testimonial.quote}”</blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Solutions Grid */}
        <section className="py-20 px-4 bg-gradient-to-b from-gray-900/30 to-blue-950/20 w-full">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">All Industry Solutions</h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">Comprehensive solutions tailored for every stakeholder in the healthcare ecosystem</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {industries.map((industry, index) => (
                <div
                  key={industry.id}
                  onClick={() => setActiveIndustry(index)}
                  className={`bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border cursor-pointer transition-all duration-300 group ${
                    activeIndustry === index ? "border-emerald-500/80 shadow-lg" : "border-white/5 hover:border-white/20 hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center text-white text-xl flex-shrink-0`}>
                      {industry.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{industry.title}</h3>
                      <p className="text-slate-300 text-sm line-clamp-2">{industry.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {industry.stats.map((stat, i) => (
                      <div key={i} className="text-center p-2 bg-gray-900/40 rounded">
                        <div className="text-lg font-bold text-white font-mono tabular-nums">{stat.value}</div>
                        <div className="text-slate-400 text-xs">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveIndustry(index)}
                    className="w-full py-2.5 bg-gray-700/50 text-slate-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer – cleaned, no tagline */}
        <footer className="bg-gray-950 text-white py-12 px-4 w-full border-t border-white/5">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex-shrink-0">
                    <img src={logoImage} alt="Medicheck Logo" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Medicheck</h3>
                    <p className="text-xs text-slate-500">Blockchain Medicine Tracker</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm">Secure, transparent, and compliant medicine tracking powered by blockchain technology.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4 text-slate-200">Pages</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><button onClick={() => navigate("/")} className="hover:text-cyan-400 transition-colors text-left">Home</button></li>
                  <li><button onClick={() => navigate("/how-it-works")} className="hover:text-cyan-400 transition-colors text-left">How It Works</button></li>
                  <li><button className="text-cyan-400 text-left">Industries</button></li>
                  <li><button onClick={() => navigate("/contact")} className="hover:text-cyan-400 transition-colors text-left">Contact</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4 text-slate-200">Solutions</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>Pharmaceutical Manufacturers</li>
                  <li>Hospital Pharmacies</li>
                  <li>Retail Pharmacies</li>
                  <li>API Manufacturers</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4 text-slate-200">Contact</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-center gap-2"><span>✉️</span> contact.medicheck@gmail.com</li>
                  <li className="flex items-center gap-2"><span>📞</span> +1 (555) 123-4567</li>
                  <li className="flex items-center gap-2"><span>📍</span> 123 Medical Blvd, Suite 100</li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 text-center text-slate-500">
              <p className="text-sm">© {new Date().getFullYear()} Medicheck. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </BackgroundFix>
  );
}

export default IndustriesPage;

// import React, { useState, useEffect } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";
// import { useNavigate } from "react-router-dom";

// function IndustriesPage() {
//   const navigate = useNavigate();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [showBackToTop, setShowBackToTop] = useState(false);
//   const [activeIndustry, setActiveIndustry] = useState(0);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);
  
//   const logoImage = require("../pictures/MSG2.jpeg");
  
//   // Testimonial images
//   const testimonialImages = {
//     0: "https://randomuser.me/api/portraits/women/65.jpg",
//     1: "https://randomuser.me/api/portraits/men/32.jpg",
//     2: "https://randomuser.me/api/portraits/men/55.jpg"
//   };
  
//   const industries = [
//     {
//       id: "pharmaceuticals",
//       title: "Pharmaceutical Manufacturers",
//       description: "Track medicine batches from production through the entire supply chain with complete transparency and regulatory compliance.",
//       icon: "🏭",
//       color: "from-blue-500 to-cyan-500",
//       features: [
//         "Batch registration on blockchain",
//         "Real-time production tracking",
//         "Regulatory compliance automation",
//         "Supply chain visibility",
//         "Quality control integration"
//       ],
//       stats: [
//         { label: "Batch Accuracy", value: "99.8%" },
//         { label: "Compliance Rate", value: "98%" },
//         { label: "Recall Reduction", value: "85%" }
//       ]
//     },
//     {
//       id: "hospitals",
//       title: "Hospital Pharmacies",
//       description: "Ensure patient safety with verified medicines, automated stock management, and expiration alerts for critical care environments.",
//       icon: "🏥",
//       color: "from-purple-500 to-violet-500",
//       features: [
//         "Medicine authenticity verification",
//         "Automated stock management",
//         "Expiration alerts system",
//         "Patient safety compliance",
//         "Inventory optimization tools"
//       ],
//       stats: [
//         { label: "Medicine Safety", value: "100%" },
//         { label: "Stock Accuracy", value: "96%" },
//         { label: "Waste Reduction", value: "60%" }
//       ]
//     },
//     {
//       id: "retail",
//       title: "Retail Pharmacies",
//       description: "Build customer trust with transparent medicine sourcing and instant verification capabilities for retail environments.",
//       icon: "🏪",
//       color: "from-orange-500 to-amber-500",
//       features: [
//         "Customer verification portal",
//         "Supply chain transparency",
//         "Recall management system",
//         "Customer trust building",
//         "Sales analytics dashboard"
//       ],
//       stats: [
//         { label: "Customer Trust", value: "95%" },
//         { label: "Recall Response", value: "Immediate" },
//         { label: "Sales Growth", value: "25%" }
//       ]
//     },
//     {
//       id: "manufacturing",
//       title: "API & Raw Material Manufacturers",
//       description: "Track active pharmaceutical ingredients and raw materials through the manufacturing process with blockchain verification.",
//       icon: "⚗️",
//       color: "from-green-500 to-emerald-500",
//       features: [
//         "API batch tracking",
//         "Raw material traceability",
//         "Quality certification storage",
//         "Compliance documentation",
//         "Supplier verification"
//       ],
//       stats: [
//         { label: "Traceability", value: "100%" },
//         { label: "Quality Assurance", value: "99%" },
//         { label: "Audit Efficiency", value: "70%" }
//       ]
//     }
//   ];

//   const testimonials = [
//     {
//       name: "Dr. Sarah Johnson",
//       role: "Quality Control Director",
//       company: "MediLife Pharmaceuticals",
//       quote: "Medicheck has revolutionized our supply chain. The blockchain tracking gives us unprecedented visibility into every batch from production to delivery.",
//       avatar: "SJ",
//       image: testimonialImages[0]
//     },
//     {
//       name: "Michael Chen",
//       role: "Chief Pharmacist",
//       company: "City Health Pharmacy",
//       quote: "Our customers trust our medicines more knowing they can verify authenticity instantly. It's transformed how we manage inventory and ensure patient safety.",
//       avatar: "MC",
//       image: testimonialImages[1]
//     },
//     {
//       name: "Robert Williams",
//       role: "Manufacturing Director",
//       company: "PharmaTech Solutions",
//       quote: "Implementing Medicheck across our manufacturing facilities reduced compliance costs by 40% and improved audit efficiency by 70%. Essential for modern pharma.",
//       avatar: "RW",
//       image: testimonialImages[2]
//     }
//   ];

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 50);
//       setShowBackToTop(window.scrollY > 300);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: 'smooth'
//     });
//   };

//   const toggleMobileMenu = () => {
//     setShowMobileMenu(!showMobileMenu);
//   };

//   const handleNavClick = (page) => {
//     if (page === 'home') {
//       navigate('/');
//     } else {
//       navigate(`/${page}`);
//     }
//     setShowMobileMenu(false);
//   };

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-gray-900 via-black to-blue-950 text-white">
//         {/* Back to Top Button */}
//         {showBackToTop && (
//           <button
//             onClick={scrollToTop}
//             className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-110 animate-bounce"
//             aria-label="Back to top"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
//             </svg>
//           </button>
//         )}

//         {/* Navigation */}
//         <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//           isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
//         }`}>
//           <div className="container mx-auto px-4 py-4 max-w-7xl">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 {/* Logo Image */}
//                 <div className="w-12 h-12 flex-shrink-0">
//                   <img 
//                     src={logoImage} 
//                     alt="Medicheck Logo" 
//                     className="w-full h-full object-cover rounded-lg"
//                     style={{ 
//                       objectFit: 'cover',
//                       maxWidth: '100%',
//                       maxHeight: '100%'
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//                     Medicheck
//                   </h1>
//                   <p className="text-xs text-gray-300">Blockchain Medicine Tracker</p>
//                 </div>
//               </div>
              
//               {/* Desktop Navigation */}
//               <div className="hidden md:flex items-center gap-6">
//                 <button
//                   onClick={() => navigate('/')}
//                   className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
//                 >
//                   Home
//                 </button>
//                 <button
//                   onClick={() => navigate('/how-it-works')}
//                   className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
//                 >
//                   How It Works
//                 </button>
//                 <button className="text-blue-400 font-medium">
//                   Industries
//                 </button>
//                 <button
//                   onClick={() => navigate('/contact')}
//                   className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
//                 >
//                   Contact
//                 </button>
//               </div>
              
//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={() => navigate('/role-selection')}
//                   className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
//                 >
//                   Get Started
//                 </button>
                
//                 {/* Mobile Menu Button */}
//                 <button
//                   onClick={toggleMobileMenu}
//                   className="md:hidden text-gray-300 hover:text-white p-2"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           {/* Mobile Navigation Menu */}
//           {showMobileMenu && (
//             <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
//               <div className="container mx-auto px-4 py-4">
//                 <div className="flex flex-col gap-4">
//                   <button
//                     onClick={() => handleNavClick('home')}
//                     className="text-gray-300 hover:text-blue-400 font-medium text-left py-2"
//                   >
//                     Home
//                   </button>
//                   <button
//                     onClick={() => handleNavClick('how-it-works')}
//                     className="text-gray-300 hover:text-blue-400 font-medium text-left py-2"
//                   >
//                     How It Works
//                   </button>
//                   <button
//                     onClick={() => handleNavClick('industries')}
//                     className="text-blue-400 font-medium text-left py-2"
//                   >
//                     Industries
//                   </button>
//                   <button
//                     onClick={() => handleNavClick('contact')}
//                     className="text-gray-300 hover:text-blue-400 font-medium text-left py-2"
//                   >
//                     Contact
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </nav>

//         {/* Hero Section */}
//         <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 w-full">
//           <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/20 opacity-50"></div>
//           <div className="container mx-auto relative z-10 max-w-7xl">
//             <div className="text-center max-w-4xl mx-auto">
//               <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full mb-6">
//                 <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
//                 <span className="font-semibold text-sm md:text-base">Industry Solutions</span>
//               </div>
              
//               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
//                 Tailored 
//                 <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//                   {" "}Solutions
//                 </span>
//                 <br className="hidden sm:block" />
//                 for Healthcare
//               </h1>
              
//               <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
//                 Medicheck provides specialized solutions for every stakeholder in the pharmaceutical ecosystem, ensuring safety, transparency, and operational efficiency.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* Industry Solutions */}
//         <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-gray-900/50 to-blue-950/50 w-full">
//           <div className="container mx-auto max-w-7xl">
//             {/* Tab Navigation */}
//             <div className="flex overflow-x-auto gap-4 mb-8 md:mb-12 pb-4 scrollbar-hide">
//               {industries.map((industry, index) => (
//                 <button
//                   key={industry.id}
//                   onClick={() => setActiveIndustry(index)}
//                   className={`flex-shrink-0 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
//                     activeIndustry === index
//                       ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
//                       : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//                   }`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">{industry.icon}</span>
//                     <span className="text-sm whitespace-nowrap">{industry.title.split(' ')[0]}</span>
//                   </div>
//                 </button>
//               ))}
//             </div>

//             {/* Active Industry Content */}
//             <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-12 border border-gray-700">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
//                 {/* Left Column */}
//                 <div>
//                   <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl bg-gradient-to-br ${industries[activeIndustry].color} flex items-center justify-center text-white text-2xl md:text-3xl lg:text-4xl mb-6`}>
//                     {industries[activeIndustry].icon}
//                   </div>
                  
//                   <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
//                     {industries[activeIndustry].title}
//                   </h2>
                  
//                   <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
//                     {industries[activeIndustry].description}
//                   </p>
                  
//                   {/* Features */}
//                   <div className="mb-8">
//                     <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       {industries[activeIndustry].features.map((feature, index) => (
//                         <div key={index} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
//                           <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
//                           <span className="text-gray-300">{feature}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Right Column */}
//                 <div>
//                   {/* Stats */}
//                   <div className="mb-8">
//                     <h3 className="text-xl font-bold text-white mb-4">Performance Impact</h3>
//                     <div className="grid grid-cols-3 gap-4">
//                       {industries[activeIndustry].stats.map((stat, index) => (
//                         <div key={index} className="bg-gradient-to-br from-gray-900/50 to-blue-900/30 rounded-xl p-4 text-center">
//                           <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
//                           <div className="text-gray-300 text-sm">{stat.label}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
                  
//                   {/* Benefits */}
//                   <div className="mb-8">
//                     <h3 className="text-xl font-bold text-white mb-4">Industry Benefits</h3>
//                     <div className="space-y-3">
//                       {[
//                         "Enhanced patient safety and trust",
//                         "Regulatory compliance automation",
//                         "Supply chain transparency",
//                         "Reduced operational costs",
//                         "Improved brand reputation"
//                       ].map((benefit, index) => (
//                         <div key={index} className="flex items-center gap-3">
//                           <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
//                           <span className="text-gray-300">{benefit}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
                  
//                   {/* CTA */}
//                   <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-700/30">
//                     <h4 className="text-lg lg:text-xl font-bold text-white mb-3">Ready to Transform?</h4>
//                     <p className="text-gray-300 text-sm mb-4">
//                       See how Medicheck can revolutionize your operations in the {industries[activeIndustry].title.toLowerCase()} sector.
//                     </p>
//                     <div className="flex flex-col sm:flex-row gap-3">
//                       <button
//                         onClick={() => navigate('/role-selection')}
//                         className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105"
//                       >
//                         Request Demo
//                       </button>
//                       <button
//                         onClick={() => navigate('/contact')}
//                         className="flex-1 bg-transparent border border-blue-500 text-blue-400 px-6 py-3 rounded-lg font-semibold hover:bg-blue-900/30 transition-colors"
//                       >
//                         Contact Sales
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Testimonials Section */}
//         <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-gray-900 to-blue-950 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
//                 Industry Testimonials
//               </h2>
//               <p className="text-gray-300 text-base md:text-lg max-w-3xl mx-auto">
//                 Hear from healthcare leaders who have transformed their operations with Medicheck
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
//               {testimonials.map((testimonial, index) => (
//                 <div
//                   key={index}
//                   className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
//                 >
//                   <div className="mb-4">
//                     <div className="flex items-center gap-4">
//                       <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                         {testimonial.avatar}
//                       </div>
//                       <div>
//                         <h3 className="font-bold text-white text-lg">{testimonial.name}</h3>
//                         <p className="text-gray-300 text-sm">{testimonial.role}</p>
//                         <p className="text-blue-400 text-sm">{testimonial.company}</p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <p className="text-gray-300 italic leading-relaxed">
//                     "{testimonial.quote}"
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* All Solutions Grid */}
//         <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-gray-900/50 to-blue-950/50 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
//                 All Industry Solutions
//               </h2>
//               <p className="text-gray-300 text-base md:text-lg max-w-3xl mx-auto">
//                 Comprehensive solutions tailored for every stakeholder in the healthcare ecosystem
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
//               {industries.map((industry, index) => (
//                 <div
//                   key={industry.id}
//                   className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
//                     activeIndustry === index 
//                       ? 'border-blue-500 shadow-xl' 
//                       : 'border-gray-700 hover:border-blue-500/50'
//                   }`}
//                   onClick={() => setActiveIndustry(index)}
//                 >
//                   <div className="flex items-start gap-4 mb-4">
//                     <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${industry.color} flex items-center justify-center text-white text-xl flex-shrink-0`}>
//                       {industry.icon}
//                     </div>
//                     <div>
//                       <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">{industry.title}</h3>
//                       <p className="text-gray-300 text-sm line-clamp-2">{industry.description}</p>
//                     </div>
//                   </div>
                  
//                   <div className="grid grid-cols-3 gap-2 mb-4">
//                     {industry.stats.map((stat, idx) => (
//                       <div key={idx} className="text-center p-2 bg-gray-900/30 rounded">
//                         <div className="text-base font-bold text-white">{stat.value}</div>
//                         <div className="text-gray-400 text-xs">{stat.label}</div>
//                       </div>
//                     ))}
//                   </div>
                  
//                   <button
//                     onClick={() => setActiveIndustry(index)}
//                     className="w-full py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
//                   >
//                     Learn More
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="bg-gray-950 text-white py-12 px-4 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//               <div>
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-10 h-10 flex-shrink-0">
//                     <img 
//                       src={logoImage} 
//                       alt="Medicheck Logo" 
//                       className="w-full h-full object-cover rounded-lg"
//                       style={{ 
//                         objectFit: 'cover',
//                         maxWidth: '100%',
//                         maxHeight: '100%'
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <h3 className="text-lg sm:text-xl font-bold">Medicheck</h3>
//                     <p className="text-xs sm:text-sm text-gray-400">Blockchain Medicine Tracker</p>
//                   </div>
//                 </div>
//                 <p className="text-gray-400 text-sm">
//                   Secure, transparent, and compliant medicine tracking powered by blockchain technology.
//                 </p>
//               </div>
              
//               <div>
//                 <h4 className="text-base sm:text-lg font-bold mb-4 text-gray-200">Pages</h4>
//                 <ul className="space-y-2 text-gray-400 text-sm">
//                   <li><button onClick={() => navigate('/')} className="hover:text-blue-400 transition-colors text-left">Home</button></li>
//                   <li><button onClick={() => navigate('/how-it-works')} className="hover:text-blue-400 transition-colors text-left">How It Works</button></li>
//                   <li><button className="text-blue-400">Industries</button></li>
//                   <li><button onClick={() => navigate('/contact')} className="hover:text-blue-400 transition-colors text-left">Contact</button></li>
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="text-base sm:text-lg font-bold mb-4 text-gray-200">Solutions</h4>
//                 <ul className="space-y-2 text-gray-400 text-sm">
//                   <li>Pharmaceutical Manufacturers</li>
//                   <li>Hospital Pharmacies</li>
//                   <li>Retail Pharmacies</li>
//                   <li>API Manufacturers</li>
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="text-base sm:text-lg font-bold mb-4 text-gray-200">Contact</h4>
//                 <ul className="space-y-2 text-gray-400 text-sm">
//                   <li>Email: contact.medicheck@gmail.com</li>
//                   <li>Support: support@medicheck.com</li>
//                   <li>Phone: +1 (555) 123-4567</li>
//                   <li>Address: 123 Medical Blvd, Suite 100</li>
//                 </ul>
//               </div>
//             </div>
            
//             <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
//               <p className="text-sm">© {new Date().getFullYear()} Medicheck. All rights reserved.</p>
//               <p className="mt-2 text-xs">Secure • Transparent • Blockchain-Powered Medicine Tracking</p>
//             </div>
//           </div>
//         </footer>
//       </div>
//     </BackgroundFix>
//   );
// }

// export default IndustriesPage;
