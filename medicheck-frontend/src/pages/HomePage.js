import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const logoImage = require("../pictures/MSG2.jpeg");
  
  // Testimonial images
  const testimonialImages = {
    0: "https://randomuser.me/api/portraits/women/65.jpg",
    1: "https://randomuser.me/api/portraits/men/32.jpg",
    2: "https://randomuser.me/api/portraits/men/55.jpg"
  };
  
  const features = [
    {
      title: "Batch Tracking",
      description: "Track medicine batches from production to pharmacy shelves with complete visibility",
      icon: "📦",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Counterfeit Detection",
      description: "Identify and flag suspicious or counterfeit drug batches using blockchain verification",
      icon: "🔍",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Expiration Monitoring",
      description: "Automatically monitor and alert about soon-to-expire medicines",
      icon: "⏰",
      color: "from-orange-500 to-amber-500"
    },
    {
      title: "Regulatory Compliance",
      description: "Ensure 100% compliance with pharmaceutical regulations and standards",
      icon: "📋",
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Supply Chain Visibility",
      description: "Gain complete visibility over the entire pharmaceutical supply chain",
      icon: "🔗",
      color: "from-rose-500 to-pink-500"
    },
    {
      title: "Blockchain Security",
      description: "Immutable blockchain records for tamper-proof medicine tracking",
      icon: "🔐",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const stats = [
    { value: "98%", label: "Compliance Rate", icon: "📈" },
    { value: "5,820+", label: "Total Batches Tracked", icon: "📦" },
    { value: "1,582", label: "Verified Authentic", icon: "✅" },
    { value: "236", label: "Expiring Soon Monitored", icon: "⚠️" }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Quality Control Director",
      company: "MediLife Pharmaceuticals",
      quote: "Medicheck has revolutionized our supply chain transparency. The blockchain tracking gives us unprecedented visibility.",
      avatar: "👩‍⚕️"
    },
    {
      name: "Michael Chen",
      role: "Pharmacist & Owner",
      company: "City Health Pharmacy",
      quote: "Our customers trust our medicines more knowing they can verify authenticity instantly. It's a game-changer.",
      avatar: "💊"
    },
    {
      name: "Robert Williams",
      role: "Supply Chain Manager",
      company: "National Medical Distributors",
      quote: "The real-time tracking and expiration monitoring have reduced our waste by 40%. Incredible platform.",
      avatar: "👨‍💼"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMobileMenu(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleGetStarted = () => {
    navigate("/role-selection");
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleNavClick = (page) => {
    if (page === 'home') {
      navigate('/');
    } else {
      navigate(`/${page}`);
    }
    setShowMobileMenu(false);
  };

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-gray-900 via-black to-blue-950 text-white">
        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-110 animate-bounce"
            aria-label="Back to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}>
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Logo Image */}
                <div className="w-12 h-12 flex-shrink-0">
                  <img 
                    src={logoImage} 
                    alt="Medicheck Logo" 
                    className="w-full h-full object-cover rounded-lg"
                    style={{ 
                      objectFit: 'cover',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Medicheck
                  </h1>
                  <p className="text-xs text-gray-300">Blockchain Medicine Tracker</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-400 font-medium transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate('/how-it-works')}
                  className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => navigate('/industries')}
                  className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
                >
                  Industries
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
                >
                  Contact
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
                >
                  Get Started
                </button>
                
                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden text-gray-300 hover:text-white p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleNavClick('home')}
                    className="text-blue-400 font-medium text-left py-2"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => handleNavClick('how-it-works')}
                    className="text-gray-300 hover:text-blue-400 font-medium text-left py-2"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => handleNavClick('industries')}
                    className="text-gray-300 hover:text-blue-400 font-medium text-left py-2"
                  >
                    Industries
                  </button>
                  <button
                    onClick={() => handleNavClick('contact')}
                    className="text-gray-300 hover:text-blue-400 font-medium text-left py-2"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/20 opacity-50"></div>
          <div className="container mx-auto relative z-10 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full mb-6">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  <span className="font-semibold text-sm md:text-base">Blockchain-Powered Medicine Tracking</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Secure • Transparent • 
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {" "}Blockchain-Powered
                  </span>
                  <br />Medicine Tracking
                </h1>
                
                <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
                  Medicheck provides comprehensive analytics to help stakeholders make informed decisions regarding medicine safety, distribution, and authenticity across the pharmaceutical supply chain.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
                  >
                    <span>🚀</span>
                    Start Tracking Now
                  </button>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="bg-gray-800 border-2 border-gray-700 text-gray-200 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-700 hover:border-blue-500/50 transition-all"
                  >
                    Explore Features
                  </button>
                </div>
                
                <div className="mt-8 flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Real-time Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Blockchain Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span>Regulatory Compliance</span>
                  </div>
                </div>
              </div>
              
              <div className="relative w-full">
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/10 shadow-2xl w-full">
                  <div className="bg-gray-800/80 rounded-2xl p-4 sm:p-6 shadow-lg w-full">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Analytics Dashboard</h3>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="bg-blue-900/30 p-3 sm:p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-300">Total Batches</p>
                            <p className="text-lg sm:text-2xl font-bold text-white">5,820</p>
                          </div>
                          <span className="text-xl sm:text-2xl">📦</span>
                        </div>
                      </div>
                      
                      <div className="bg-green-900/30 p-3 sm:p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-300">Verified Authentic</p>
                            <p className="text-lg sm:text-2xl font-bold text-white">1,582</p>
                          </div>
                          <span className="text-xl sm:text-2xl">✅</span>
                        </div>
                      </div>
                      
                      <div className="bg-orange-900/30 p-3 sm:p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-300">Expiring Soon</p>
                            <p className="text-lg sm:text-2xl font-bold text-white">236</p>
                          </div>
                          <span className="text-xl sm:text-2xl">⚠️</span>
                        </div>
                      </div>
                      
                      <div className="bg-purple-900/30 p-3 sm:p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-300">Compliance Rate</p>
                            <p className="text-lg sm:text-2xl font-bold text-white">98%</p>
                          </div>
                          <span className="text-xl sm:text-2xl">📈</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-3 sm:p-4 rounded-xl">
                      <p className="text-gray-200 font-medium text-sm sm:text-base">Live Blockchain Network</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-green-400 to-cyan-500 h-full rounded-full w-4/5"></div>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl rotate-12 animate-pulse opacity-50"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl -rotate-12 animate-pulse delay-1000 opacity-50"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 px-4 bg-gradient-to-b from-gray-900/50 to-blue-950/50 w-full">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Powerful Analytics & Insights
              </h2>
              <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
                Comprehensive analytics to track, monitor, and ensure the integrity of medicine batches across the supply chain
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                    activeFeature === index 
                      ? 'border-blue-500 shadow-xl' 
                      : 'border-gray-700 hover:border-blue-500/50'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-xl sm:text-2xl text-white mb-4 sm:mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300">
                    {feature.description}
                  </p>
                  <div className="mt-4 sm:mt-6 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-blue-400">Learn More →</span>
                    {activeFeature === index && (
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 sm:py-20 px-4 bg-gray-900/50 w-full">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Trusted by Industry Leaders
              </h2>
              <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
                See what industry professionals say about Medicheck
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 sm:p-8 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                      <div className="text-blue-400 text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section id="stats" className="py-16 sm:py-20 px-4 bg-gradient-to-br from-gray-900 to-blue-950 w-full">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Key Metrics & Analytics Reports
              </h2>
              <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
                Gain insight into critical aspects of your medicine operations
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                  <div className="text-4xl sm:text-5xl mb-4">{stat.icon}</div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm sm:text-base text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 sm:mt-12 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Supply Chain Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-3 sm:p-4 bg-blue-900/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm sm:text-base">Manufacturing Efficiency</span>
                    <span className="font-bold text-green-400 text-sm sm:text-base">94%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 bg-green-900/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm sm:text-base">Delivery Accuracy</span>
                    <span className="font-bold text-blue-400 text-sm sm:text-base">97%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '97%' }}></div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 bg-purple-900/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm sm:text-base">Customer Satisfaction</span>
                    <span className="font-bold text-purple-400 text-sm sm:text-base">98%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-blue-900 to-cyan-900 w-full">
          <div className="container mx-auto max-w-7xl text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your Medicine Tracking?
            </h2>
            <p className="text-lg sm:text-xl text-blue-200 mb-8 sm:mb-10 max-w-3xl mx-auto">
              Join hundreds of pharmaceutical companies already using Medicheck for secure, transparent medicine tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-700 px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2 sm:gap-3"
              >
                <span>🚀</span>
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className="bg-transparent border-2 border-white text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white/10 transition-all"
              >
                Schedule Demo
              </button>
            </div>
            
            <div className="mt-6 sm:mt-8 text-blue-200 text-sm sm:text-base">
              <p>No credit card required • 30-day free trial • Full support included</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-950 text-white py-8 sm:py-12 px-4 w-full">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex-shrink-0">
                    <img 
                      src={logoImage} 
                      alt="Medicheck Logo" 
                      className="w-full h-full object-cover rounded-lg"
                      style={{ 
                        objectFit: 'cover',
                        maxWidth: '100%',
                        maxHeight: '100%'
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">Medicheck</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Blockchain Medicine Tracker</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm sm:text-base">
                  Secure, transparent, and compliant medicine tracking powered by blockchain technology.
                </p>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Pages</h4>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <li><button onClick={() => navigate('/')} className="hover:text-blue-400 transition-colors text-left">Home</button></li>
                  <li><button onClick={() => navigate('/how-it-works')} className="hover:text-blue-400 transition-colors text-left">How It Works</button></li>
                  <li><button onClick={() => navigate('/industries')} className="hover:text-blue-400 transition-colors text-left">Industries</button></li>
                  <li><button onClick={() => navigate('/contact')} className="hover:text-blue-400 transition-colors text-left">Contact</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Industries</h4>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <li>Pharmaceuticals</li>
                  <li>Medical Distributors</li>
                  <li>Hospital Pharmacies</li>
                  <li>Retail Pharmacies</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Contact</h4>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <li>Email: contact.medicheck@gmail.com</li>
                  <li>Phone: +92332-2473-650</li>
                  <li>Address: IQRA University, North Karachi Campus</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 text-center text-gray-400">
              <p className="text-sm sm:text-base">© {new Date().getFullYear()} Medicheck. All rights reserved.</p>
              <p className="mt-2 text-xs sm:text-sm">Secure • Transparent • Blockchain-Powered Medicine Tracking</p>
            </div>
          </div>
        </footer>
      </div>
    </BackgroundFix>
  );
}

export default HomePage;

// Original File
// import React, { useState, useEffect } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";
// import { useNavigate } from "react-router-dom";

// function HomePage() {
//   const navigate = useNavigate();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [activeFeature, setActiveFeature] = useState(0);
//   const [showBackToTop, setShowBackToTop] = useState(false);
  
//   const logoImage = require("../pictures/MSG2.jpeg");
  
//   const features = [
//     {
//       title: "Batch Tracking",
//       description: "Track medicine batches from production to pharmacy shelves with complete visibility",
//       icon: "📦",
//       color: "from-blue-500 to-cyan-500"
//     },
//     {
//       title: "Counterfeit Detection",
//       description: "Identify and flag suspicious or counterfeit drug batches using blockchain verification",
//       icon: "🔍",
//       color: "from-green-500 to-emerald-500"
//     },
//     {
//       title: "Expiration Monitoring",
//       description: "Automatically monitor and alert about soon-to-expire medicines",
//       icon: "⏰",
//       color: "from-orange-500 to-amber-500"
//     },
//     {
//       title: "Regulatory Compliance",
//       description: "Ensure 100% compliance with pharmaceutical regulations and standards",
//       icon: "📋",
//       color: "from-purple-500 to-violet-500"
//     },
//     {
//       title: "Supply Chain Visibility",
//       description: "Gain complete visibility over the entire pharmaceutical supply chain",
//       icon: "🔗",
//       color: "from-rose-500 to-pink-500"
//     },
//     {
//       title: "Blockchain Security",
//       description: "Immutable blockchain records for tamper-proof medicine tracking",
//       icon: "🔐",
//       color: "from-indigo-500 to-blue-500"
//     }
//   ];

//   const stats = [
//     { value: "98%", label: "Compliance Rate", icon: "📈" },
//     { value: "5,820+", label: "Total Batches Tracked", icon: "📦" },
//     { value: "1,582", label: "Verified Authentic", icon: "✅" },
//     { value: "236", label: "Expiring Soon Monitored", icon: "⚠️" }
//   ];

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 50);
//       setShowBackToTop(window.scrollY > 300);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveFeature((prev) => (prev + 1) % features.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const scrollToSection = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: 'smooth'
//     });
//   };

//   const handleGetStarted = () => {
//     navigate("/role-selection");
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
//               <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
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
              
//               <div className="hidden md:flex items-center gap-6">
//                 <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   Features
//                 </button>
//                 <button onClick={() => navigate('/how-it-works')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   How It Works
//                 </button>
//                 <button onClick={() => navigate('/industries')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   Industries
//                 </button>
//                 <button onClick={() => navigate('/contact')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   Contact
//                 </button>
//               </div>
              
//               <button
//                 onClick={handleGetStarted}
//                 className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
//               >
//                 Get Started
//               </button>
//             </div>
//           </div>
//         </nav>

//         {/* Hero Section */}
//         <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 w-full">
//           <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/20 opacity-50"></div>
//           <div className="container mx-auto relative z-10 max-w-7xl">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//               <div>
//                 <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full mb-6">
//                   <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
//                   <span className="font-semibold text-sm md:text-base">Blockchain-Powered Medicine Tracking</span>
//                 </div>
                
//                 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
//                   Secure • Transparent • 
//                   <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//                     {" "}Blockchain-Powered
//                   </span>
//                   <br />Medicine Tracking
//                 </h1>
                
//                 <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
//                   Medicheck provides comprehensive analytics to help stakeholders make informed decisions regarding medicine safety, distribution, and authenticity across the pharmaceutical supply chain.
//                 </p>
                
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <button
//                     onClick={handleGetStarted}
//                     className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
//                   >
//                     <span>🚀</span>
//                     Start Tracking Now
//                   </button>
//                   <button
//                     onClick={() => scrollToSection('features')}
//                     className="bg-gray-800 border-2 border-gray-700 text-gray-200 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-700 hover:border-blue-500/50 transition-all"
//                   >
//                     Explore Features
//                   </button>
//                 </div>
                
//                 <div className="mt-8 flex flex-wrap items-center gap-4 text-gray-400 text-sm">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                     <span>Real-time Tracking</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
//                     <span>Blockchain Security</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
//                     <span>Regulatory Compliance</span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="relative w-full">
//                 <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/10 shadow-2xl w-full">
//                   <div className="bg-gray-800/80 rounded-2xl p-4 sm:p-6 shadow-lg w-full">
//                     <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Analytics Dashboard</h3>
                    
//                     {/* Stats Grid */}
//                     <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
//                       <div className="bg-blue-900/30 p-3 sm:p-4 rounded-xl">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-xs sm:text-sm text-gray-300">Total Batches</p>
//                             <p className="text-lg sm:text-2xl font-bold text-white">5,820</p>
//                           </div>
//                           <span className="text-xl sm:text-2xl">📦</span>
//                         </div>
//                       </div>
                      
//                       <div className="bg-green-900/30 p-3 sm:p-4 rounded-xl">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-xs sm:text-sm text-gray-300">Verified Authentic</p>
//                             <p className="text-lg sm:text-2xl font-bold text-white">1,582</p>
//                           </div>
//                           <span className="text-xl sm:text-2xl">✅</span>
//                         </div>
//                       </div>
                      
//                       <div className="bg-orange-900/30 p-3 sm:p-4 rounded-xl">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-xs sm:text-sm text-gray-300">Expiring Soon</p>
//                             <p className="text-lg sm:text-2xl font-bold text-white">236</p>
//                           </div>
//                           <span className="text-xl sm:text-2xl">⚠️</span>
//                         </div>
//                       </div>
                      
//                       <div className="bg-purple-900/30 p-3 sm:p-4 rounded-xl">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-xs sm:text-sm text-gray-300">Compliance Rate</p>
//                             <p className="text-lg sm:text-2xl font-bold text-white">98%</p>
//                           </div>
//                           <span className="text-xl sm:text-2xl">📈</span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-3 sm:p-4 rounded-xl">
//                       <p className="text-gray-200 font-medium text-sm sm:text-base">Live Blockchain Network</p>
//                       <div className="flex items-center gap-2 mt-2">
//                         <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
//                           <div className="bg-gradient-to-r from-green-400 to-cyan-500 h-full rounded-full w-4/5"></div>
//                         </div>
//                         <span className="text-xs sm:text-sm font-semibold text-green-400">Active</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Floating Elements */}
//                 <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl rotate-12 animate-pulse opacity-50"></div>
//                 <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl -rotate-12 animate-pulse delay-1000 opacity-50"></div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Features Section */}
//         <section id="features" className="py-16 sm:py-20 px-4 bg-gradient-to-b from-gray-900/50 to-blue-950/50 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12 sm:mb-16">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
//                 Powerful Analytics & Insights
//               </h2>
//               <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
//                 Comprehensive analytics to track, monitor, and ensure the integrity of medicine batches across the supply chain
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
//               {features.map((feature, index) => (
//                 <div
//                   key={index}
//                   className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
//                     activeFeature === index 
//                       ? 'border-blue-500 shadow-xl' 
//                       : 'border-gray-700 hover:border-blue-500/50'
//                   }`}
//                   onClick={() => setActiveFeature(index)}
//                 >
//                   <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-xl sm:text-2xl text-white mb-4 sm:mb-6`}>
//                     {feature.icon}
//                   </div>
//                   <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
//                     {feature.title}
//                   </h3>
//                   <p className="text-sm sm:text-base text-gray-300">
//                     {feature.description}
//                   </p>
//                   <div className="mt-4 sm:mt-6 flex items-center justify-between">
//                     <span className="text-xs sm:text-sm font-semibold text-blue-400">Learn More →</span>
//                     {activeFeature === index && (
//                       <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* Statistics Section */}
//         <section id="stats" className="py-16 sm:py-20 px-4 bg-gradient-to-br from-gray-900 to-blue-950 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12 sm:mb-16">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
//                 Key Metrics & Analytics Reports
//               </h2>
//               <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
//                 Gain insight into critical aspects of your medicine operations
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
//               {stats.map((stat, index) => (
//                 <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
//                   <div className="text-4xl sm:text-5xl mb-4">{stat.icon}</div>
//                   <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
//                   <div className="text-sm sm:text-base text-gray-300 font-medium">{stat.label}</div>
//                 </div>
//               ))}
//             </div>
            
//             <div className="mt-8 sm:mt-12 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg">
//               <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Supply Chain Performance</h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
//                 <div className="p-3 sm:p-4 bg-blue-900/30 rounded-xl">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-gray-300 text-sm sm:text-base">Manufacturing Efficiency</span>
//                     <span className="font-bold text-green-400 text-sm sm:text-base">94%</span>
//                   </div>
//                   <div className="w-full bg-gray-700 rounded-full h-2">
//                     <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
//                   </div>
//                 </div>
                
//                 <div className="p-3 sm:p-4 bg-green-900/30 rounded-xl">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-gray-300 text-sm sm:text-base">Delivery Accuracy</span>
//                     <span className="font-bold text-blue-400 text-sm sm:text-base">97%</span>
//                   </div>
//                   <div className="w-full bg-gray-700 rounded-full h-2">
//                     <div className="bg-blue-500 h-2 rounded-full" style={{ width: '97%' }}></div>
//                   </div>
//                 </div>
                
//                 <div className="p-3 sm:p-4 bg-purple-900/30 rounded-xl">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-gray-300 text-sm sm:text-base">Customer Satisfaction</span>
//                     <span className="font-bold text-purple-400 text-sm sm:text-base">98%</span>
//                   </div>
//                   <div className="w-full bg-gray-700 rounded-full h-2">
//                     <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* CTA Section */}
//         <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-blue-900 to-cyan-900 w-full">
//           <div className="container mx-auto max-w-7xl text-center">
//             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
//               Ready to Transform Your Medicine Tracking?
//             </h2>
//             <p className="text-lg sm:text-xl text-blue-200 mb-8 sm:mb-10 max-w-3xl mx-auto">
//               Join hundreds of pharmaceutical companies already using Medicheck for secure, transparent medicine tracking.
//             </p>
            
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <button
//                 onClick={handleGetStarted}
//                 className="bg-white text-blue-700 px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2 sm:gap-3"
//               >
//                 <span>🚀</span>
//                 Start Free Trial
//               </button>
//               <button
//                 onClick={() => navigate('/how-it-works')}
//                 className="bg-transparent border-2 border-white text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white/10 transition-all"
//               >
//                 Schedule Demo
//               </button>
//             </div>
            
//             <div className="mt-6 sm:mt-8 text-blue-200 text-sm sm:text-base">
//               <p>No credit card required • 30-day free trial • Full support included</p>
//             </div>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="bg-gray-950 text-white py-8 sm:py-12 px-4 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
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
//                 <p className="text-gray-400 text-sm sm:text-base">
//                   Secure, transparent, and compliant medicine tracking powered by blockchain technology.
//                 </p>
//               </div>
              
//               <div>
//                 <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Pages</h4>
//                 <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
//                   <li><button onClick={() => navigate('/')} className="hover:text-blue-400 transition-colors">Home</button></li>
//                   <li><button onClick={() => navigate('/how-it-works')} className="hover:text-blue-400 transition-colors">How It Works</button></li>
//                   <li><button onClick={() => navigate('/industries')} className="hover:text-blue-400 transition-colors">Industries</button></li>
//                   <li><button onClick={() => navigate('/contact')} className="hover:text-blue-400 transition-colors">Contact</button></li>
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Industries</h4>
//                 <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
//                   <li>Pharmaceuticals</li>
//                   <li>Medical Distributors</li>
//                   <li>Hospital Pharmacies</li>
//                   <li>Retail Pharmacies</li>
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Contact</h4>
//                 <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
//                   <li>Email: contact.medicheck@gmail.com</li>
//                   <li>Support: support@medicheck.com</li>
//                   <li>Phone: +1 (555) 123-4567</li>
//                   <li>Address: 123 Medical Blvd, Suite 100</li>
//                 </ul>
//               </div>
//             </div>
            
//             <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 text-center text-gray-400">
//               <p className="text-sm sm:text-base">© {new Date().getFullYear()} Medicheck. All rights reserved.</p>
//               <p className="mt-2 text-xs sm:text-sm">Secure • Transparent • Blockchain-Powered Medicine Tracking</p>
//             </div>
//           </div>
//         </footer>
//       </div>
//     </BackgroundFix>
//   );
// }

// export default HomePage;


