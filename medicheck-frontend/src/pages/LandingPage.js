// LandingPage.js - Updated with animated background instead of white
import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Import your logo
  const logoImage = require("../pictures/MSG2.jpeg");
  
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    navigate("/role-selection");
  };

  return (
    <BackgroundFix theme={THEMES.blue}>
      <div className="min-h-screen w-full overflow-x-hidden relative">
        {/* Animated Background Layer */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          {/* Animated gradient background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `
                radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
                  rgba(59, 130, 246, 0.15) 0%, 
                  transparent 50%),
                radial-gradient(circle at ${100 - mousePosition.x * 100}% ${100 - mousePosition.y * 100}%, 
                  rgba(139, 92, 246, 0.15) 0%, 
                  transparent 50%),
                linear-gradient(135deg, 
                  rgba(239, 246, 255, 0.95) 0%,
                  rgba(237, 233, 254, 0.9) 50%,
                  rgba(255, 251, 235, 0.85) 100%)
              `,
              animation: 'gradientShift 20s ease infinite'
            }}
          />
          
          {/* Animated grid pattern */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'gridMove 40s linear infinite'
            }}
          />
          
          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: `rgba(${Math.random() > 0.5 ? '59, 130, 246' : '139, 92, 246'}, ${0.1 + Math.random() * 0.1})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 20 + 10}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
          
          {/* Pulse rings */}
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-1/4 w-64 h-64 rounded-full border border-blue-200/20 animate-ping" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full border border-purple-200/20 animate-ping" 
                 style={{ animationDuration: '6s', animationDelay: '1s' }} />
          </div>
        </div>

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm'
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
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Medicheck
                  </h1>
                  <p className="text-xs text-gray-500">Blockchain Medicine Tracker</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Features
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  How It Works
                </button>
                <button onClick={() => scrollToSection('stats')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Statistics
                </button>
                <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Testimonials
                </button>
              </div>
              
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 w-full">
          <div className="container mx-auto relative z-10 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="font-semibold text-sm md:text-base">Blockchain-Powered Medicine Tracking</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Secure • Transparent • 
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}Blockchain-Powered
                  </span>
                  <br />Medicine Tracking
                </h1>
                
                <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
                  Medicheck provides comprehensive analytics to help stakeholders make informed decisions regarding medicine safety, distribution, and authenticity across the pharmaceutical supply chain.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
                  >
                    <span>🚀</span>
                    Start Tracking Now
                  </button>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-white hover:border-blue-200 transition-all"
                  >
                    Explore Features
                  </button>
                </div>
                
                <div className="mt-8 flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Blockchain Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Regulatory Compliance</span>
                  </div>
                </div>
              </div>
              
              <div className="relative w-full">
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/20 shadow-2xl w-full">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg w-full">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Analytics Dashboard</h3>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="bg-blue-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Total Batches</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-800">5,820</p>
                          </div>
                          <span className="text-xl sm:text-2xl">📦</span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Verified Authentic</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-800">1,582</p>
                          </div>
                          <span className="text-xl sm:text-2xl">✅</span>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Expiring Soon</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-800">236</p>
                          </div>
                          <span className="text-xl sm:text-2xl">⚠️</span>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Compliance Rate</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-800">98%</p>
                          </div>
                          <span className="text-xl sm:text-2xl">📈</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-100/80 to-purple-100/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl">
                      <p className="text-gray-700 font-medium text-sm sm:text-base">Live Blockchain Network</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-white h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full w-4/5"></div>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl rotate-12 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl -rotate-12 animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-16 sm:py-20 px-4 w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent"></div>
          <div className="container mx-auto relative z-10 max-w-7xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powerful Analytics & Insights
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive analytics to track, monitor, and ensure the integrity of medicine batches across the supply chain
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                    activeFeature === index 
                      ? 'border-blue-500 shadow-xl' 
                      : 'border-gray-100/50 hover:border-blue-200'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-xl sm:text-2xl text-white mb-4 sm:mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {feature.description}
                  </p>
                  <div className="mt-4 sm:mt-6 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-blue-600">Learn More →</span>
                    {activeFeature === index && (
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative py-16 sm:py-20 px-4 w-full">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
          <div className="container mx-auto relative z-10 max-w-7xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How Medicheck Works
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                A seamless process from manufacturing to pharmacy delivery
              </p>
            </div>
            
            <div className="relative">
              {/* Timeline */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
              
              <div className="space-y-8 sm:space-y-12">
                {[
                  {
                    step: "01",
                    title: "Manufacturer Registration",
                    description: "Pharmaceutical manufacturers register medicine batches on the blockchain",
                    icon: "🏭",
                    color: "blue"
                  },
                  {
                    step: "02",
                    title: "Blockchain Verification",
                    description: "Each batch gets a unique blockchain ID for tamper-proof tracking",
                    icon: "🔗",
                    color: "green"
                  },
                  {
                    step: "03",
                    title: "Supply Chain Tracking",
                    description: "Real-time tracking through distributors, warehouses, and logistics",
                    icon: "🚚",
                    color: "orange"
                  },
                  {
                    step: "04",
                    title: "Pharmacy Acceptance",
                    description: "Pharmacies verify and accept batches using blockchain verification",
                    icon: "🏪",
                    color: "purple"
                  },
                  {
                    step: "05",
                    title: "Customer Verification",
                    description: "End consumers can verify medicine authenticity via QR code scanning",
                    icon: "👥",
                    color: "pink"
                  },
                  {
                    step: "06",
                    title: "Analytics & Compliance",
                    description: "Comprehensive analytics for all stakeholders and regulatory compliance",
                    icon: "📊",
                    color: "indigo"
                  }
                ].map((item, index) => (
                  <div key={index} className={`relative flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}>
                    <div className="md:w-1/2"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${
                        item.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                        item.color === 'green' ? 'from-green-500 to-emerald-500' :
                        item.color === 'orange' ? 'from-orange-500 to-amber-500' :
                        item.color === 'purple' ? 'from-purple-500 to-violet-500' :
                        item.color === 'pink' ? 'from-rose-500 to-pink-500' :
                        'from-indigo-500 to-blue-500'
                      } flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg`}>
                        {item.step}
                      </div>
                    </div>
                    <div className={`md:w-1/2 mt-4 md:mt-0 ${
                      index % 2 === 0 ? 'md:pl-8 lg:pl-12' : 'md:pr-8 lg:pr-12'
                    }`}>
                      <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100/50">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <span className="text-xl sm:text-2xl">{item.icon}</span>
                          <h3 className="text-base sm:text-xl font-bold text-gray-800">{item.title}</h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section id="stats" className="relative py-16 sm:py-20 px-4 w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
          <div className="container mx-auto relative z-10 max-w-7xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Key Metrics & Analytics Reports
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Gain insight into critical aspects of your medicine operations
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                  <div className="text-4xl sm:text-5xl mb-4">{stat.icon}</div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 sm:mt-12 bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Supply Chain Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-3 sm:p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 text-sm sm:text-base">Manufacturing Efficiency</span>
                    <span className="font-bold text-green-600 text-sm sm:text-base">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 bg-green-50/80 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 text-sm sm:text-base">Delivery Accuracy</span>
                    <span className="font-bold text-blue-600 text-sm sm:text-base">97%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '97%' }}></div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 bg-purple-50/80 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 text-sm sm:text-base">Customer Satisfaction</span>
                    <span className="font-bold text-purple-600 text-sm sm:text-base">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="relative py-16 sm:py-20 px-4 w-full">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
          <div className="container mx-auto relative z-10 max-w-7xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Pharmaceutical Industry Leaders
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                See what industry professionals say about Medicheck
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
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
              ].map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl sm:text-4xl mb-4">{testimonial.avatar}</div>
                  <p className="text-sm sm:text-base text-gray-700 italic mb-4 sm:mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                      <div className="text-gray-600 text-xs sm:text-sm">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 sm:py-20 px-4 w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600"></div>
          <div className="container mx-auto relative z-10 max-w-7xl text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your Medicine Tracking?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-10 max-w-3xl mx-auto">
              Join hundreds of pharmaceutical companies already using Medicheck for secure, transparent medicine tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap,2 sm:gap-3"
              >
                <span>🚀</span>
                Start Free Trial
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="bg-transparent border-2 border-white text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white/10 transition-all"
              >
                Schedule Demo
              </button>
            </div>
            
            <div className="mt-6 sm:mt-8 text-blue-100 text-sm sm:text-base">
              <p>No credit card required • 30-day free trial • Full support included</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative bg-gray-900 text-white py-8 sm:py-12 px-4 w-full">
          <div className="absolute inset-0 bg-gray-900"></div>
          <div className="container mx-auto relative z-10 max-w-7xl">
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
                <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Features</h4>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <li>Batch Tracking</li>
                  <li>Counterfeit Detection</li>
                  <li>Expiration Monitoring</li>
                  <li>Regulatory Compliance</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Industries</h4>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <li>Pharmaceuticals</li>
                  <li>Medical Distributors</li>
                  <li>Hospital Pharmacies</li>
                  <li>Retail Pharmacies</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Contact</h4>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <li>Email: contact.medicheck@gmail.com</li>
                  <li>Support: support@medicheck.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Medical Blvd, Suite 100</li>
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

export default LandingPage;


//    Dark Background 

// // LandingPage.js - Updated with dark gradient background
// import React, { useState, useEffect } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";
// import { useNavigate } from "react-router-dom";

// function LandingPage() {
//   const navigate = useNavigate();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [activeFeature, setActiveFeature] = useState(0);
  
//   // Import your logo
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

//   const handleGetStarted = () => {
//     navigate("/role-selection");
//   };

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-gray-900 via-black to-blue-950 text-white">
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
              
//               <div className="hidden md:flex items-center gap-6">
//                 <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   Features
//                 </button>
//                 <button onClick={() => scrollToSection('how-it-works')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   How It Works
//                 </button>
//                 <button onClick={() => scrollToSection('stats')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   Statistics
//                 </button>
//                 <button onClick={() => scrollToSection('testimonials')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   Testimonials
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

//         {/* How It Works Section */}
//         <section id="how-it-works" className="py-16 sm:py-20 px-4 bg-gray-900/50 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12 sm:mb-16">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
//                 How Medicheck Works
//               </h2>
//               <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
//                 A seamless process from manufacturing to pharmacy delivery
//               </p>
//             </div>
            
//             <div className="relative">
//               {/* Timeline */}
//               <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-cyan-500"></div>
              
//               <div className="space-y-8 sm:space-y-12">
//                 {[
//                   {
//                     step: "01",
//                     title: "Manufacturer Registration",
//                     description: "Pharmaceutical manufacturers register medicine batches on the blockchain",
//                     icon: "🏭",
//                     color: "blue"
//                   },
//                   {
//                     step: "02",
//                     title: "Blockchain Verification",
//                     description: "Each batch gets a unique blockchain ID for tamper-proof tracking",
//                     icon: "🔗",
//                     color: "cyan"
//                   },
//                   {
//                     step: "03",
//                     title: "Supply Chain Tracking",
//                     description: "Real-time tracking through distributors, warehouses, and logistics",
//                     icon: "🚚",
//                     color: "green"
//                   },
//                   {
//                     step: "04",
//                     title: "Pharmacy Acceptance",
//                     description: "Pharmacies verify and accept batches using blockchain verification",
//                     icon: "🏪",
//                     color: "purple"
//                   },
//                   {
//                     step: "05",
//                     title: "Customer Verification",
//                     description: "End consumers can verify medicine authenticity via QR code scanning",
//                     icon: "👥",
//                     color: "pink"
//                   },
//                   {
//                     step: "06",
//                     title: "Analytics & Compliance",
//                     description: "Comprehensive analytics for all stakeholders and regulatory compliance",
//                     icon: "📊",
//                     color: "indigo"
//                   }
//                 ].map((item, index) => (
//                   <div key={index} className={`relative flex flex-col md:flex-row items-center ${
//                     index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
//                   }`}>
//                     <div className="md:w-1/2"></div>
//                     <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
//                       <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${
//                         item.color === 'blue' ? 'from-blue-500 to-blue-600' :
//                         item.color === 'cyan' ? 'from-cyan-500 to-blue-500' :
//                         item.color === 'green' ? 'from-green-500 to-emerald-500' :
//                         item.color === 'purple' ? 'from-purple-500 to-violet-500' :
//                         item.color === 'pink' ? 'from-rose-500 to-pink-500' :
//                         'from-indigo-500 to-blue-500'
//                       } flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg`}>
//                         {item.step}
//                       </div>
//                     </div>
//                     <div className={`md:w-1/2 mt-4 md:mt-0 ${
//                       index % 2 === 0 ? 'md:pl-8 lg:pl-12' : 'md:pr-8 lg:pr-12'
//                     }`}>
//                       <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700">
//                         <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
//                           <span className="text-xl sm:text-2xl">{item.icon}</span>
//                           <h3 className="text-base sm:text-xl font-bold text-white">{item.title}</h3>
//                         </div>
//                         <p className="text-sm sm:text-base text-gray-300">{item.description}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
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

//         {/* Testimonials Section */}
//         <section id="testimonials" className="py-16 sm:py-20 px-4 bg-gray-900/50 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12 sm:mb-16">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
//                 Trusted by Pharmaceutical Industry Leaders
//               </h2>
//               <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
//                 See what industry professionals say about Medicheck
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
//               {[
//                 {
//                   name: "Dr. Sarah Johnson",
//                   role: "Quality Control Director",
//                   company: "MediLife Pharmaceuticals",
//                   quote: "Medicheck has revolutionized our supply chain transparency. The blockchain tracking gives us unprecedented visibility.",
//                   avatar: "👩‍⚕️"
//                 },
//                 {
//                   name: "Michael Chen",
//                   role: "Pharmacist & Owner",
//                   company: "City Health Pharmacy",
//                   quote: "Our customers trust our medicines more knowing they can verify authenticity instantly. It's a game-changer.",
//                   avatar: "💊"
//                 },
//                 {
//                   name: "Robert Williams",
//                   role: "Supply Chain Manager",
//                   company: "National Medical Distributors",
//                   quote: "The real-time tracking and expiration monitoring have reduced our waste by 40%. Incredible platform.",
//                   avatar: "👨‍💼"
//                 }
//               ].map((testimonial, index) => (
//                 <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 sm:p-8 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
//                   <div className="text-3xl sm:text-4xl mb-4">{testimonial.avatar}</div>
//                   <p className="text-sm sm:text-base text-gray-300 italic mb-4 sm:mb-6">"{testimonial.quote}"</p>
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
//                       {testimonial.name.charAt(0)}
//                     </div>
//                     <div>
//                       <div className="font-bold text-white text-sm sm:text-base">{testimonial.name}</div>
//                       <div className="text-gray-400 text-xs sm:text-sm">{testimonial.role}</div>
//                       <div className="text-xs text-gray-500">{testimonial.company}</div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
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
//                 onClick={() => scrollToSection('features')}
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
//                 <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Features</h4>
//                 <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
//                   <li>Batch Tracking</li>
//                   <li>Counterfeit Detection</li>
//                   <li>Expiration Monitoring</li>
//                   <li>Regulatory Compliance</li>
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

// export default LandingPage;



// Original landing page

// // LandingPage.js - Updated with logo and layout fixes
// import React, { useState, useEffect } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";
// import { useNavigate } from "react-router-dom";

// function LandingPage() {
//   const navigate = useNavigate();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [activeFeature, setActiveFeature] = useState(0);
  
//   // Import your logo
//   const logoImage = require("../pictures/CMDS.jpeg");
  
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

//   const handleGetStarted = () => {
//     navigate("/role-selection");
//   };

//   return (
//     <BackgroundFix theme={THEMES.blue}>
//       <div className="min-h-screen w-full overflow-x-hidden">
//         {/* Navigation */}
//         <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//           isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
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
//                   <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                     Medicheck
//                   </h1>
//                   <p className="text-xs text-gray-500">Blockchain Medicine Tracker</p>
//                 </div>
//               </div>
              
//               <div className="hidden md:flex items-center gap-6">
//                 <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
//                   Features
//                 </button>
//                 <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
//                   How It Works
//                 </button>
//                 <button onClick={() => scrollToSection('stats')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
//                   Statistics
//                 </button>
//                 <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
//                   Testimonials
//                 </button>
//               </div>
              
//               <button
//                 onClick={handleGetStarted}
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
//               >
//                 Get Started
//               </button>
//             </div>
//           </div>
//         </nav>

//         {/* Hero Section */}
//         <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 w-full">
//           <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50"></div>
//           <div className="container mx-auto relative z-10 max-w-7xl">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//               <div>
//                 <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
//                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
//                   <span className="font-semibold text-sm md:text-base">Blockchain-Powered Medicine Tracking</span>
//                 </div>
                
//                 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
//                   Secure • Transparent • 
//                   <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                     {" "}Blockchain-Powered
//                   </span>
//                   <br />Medicine Tracking
//                 </h1>
                
//                 <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
//                   Medicheck provides comprehensive analytics to help stakeholders make informed decisions regarding medicine safety, distribution, and authenticity across the pharmaceutical supply chain.
//                 </p>
                
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <button
//                     onClick={handleGetStarted}
//                     className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
//                   >
//                     <span>🚀</span>
//                     Start Tracking Now
//                   </button>
//                   <button
//                     onClick={() => scrollToSection('features')}
//                     className="bg-white border-2 border-gray-200 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 hover:border-blue-200 transition-all"
//                   >
//                     Explore Features
//                   </button>
//                 </div>
                
//                 <div className="mt-8 flex flex-wrap items-center gap-4 text-gray-500 text-sm">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     <span>Real-time Tracking</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                     <span>Blockchain Security</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
//                     <span>Regulatory Compliance</span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="relative w-full">
//                 <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-white/20 shadow-2xl w-full">
//                   <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg w-full">
//                     <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Analytics Dashboard</h3>
                    
//                     {/* Stats Grid */}
//                     <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
//                       <div className="bg-blue-50 p-3 sm:p-4 rounded-xl">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-xs sm:text-sm text-gray-600">Total Batches</p>
//                             <p className="text-lg sm:text-2xl font-bold text-gray-800">5,820</p>
//                           </div>
//                           <span className="text-xl sm:text-2xl">📦</span>
//                         </div>
//                       </div>
                      
//                       <div className="bg-green-50 p-3 sm:p-4 rounded-xl">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-xs sm:text-sm text-gray-600">Verified Authentic</p>
//                             <p className="text-lg sm:text-2xl font-bold text-gray-800">1,582</p>
//                           </div>
//                           <span className="text-xl sm:text-2xl">✅</span>
//                         </div>
//                       </div>
                      
//                       <div className="bg-orange-50 p-3 sm:p-4 rounded-xl">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-xs sm:text-sm text-gray-600">Expiring Soon</p>
//                             <p className="text-lg sm:text-2xl font-bold text-gray-800">236</p>
//                           </div>
//                           <span className="text-xl sm:text-2xl">⚠️</span>
//                         </div>
//                       </div>
                      
//                       <div className="bg-purple-50 p-3 sm:p-4 rounded-xl">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-xs sm:text-sm text-gray-600">Compliance Rate</p>
//                             <p className="text-lg sm:text-2xl font-bold text-gray-800">98%</p>
//                           </div>
//                           <span className="text-xl sm:text-2xl">📈</span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 sm:p-4 rounded-xl">
//                       <p className="text-gray-700 font-medium text-sm sm:text-base">Live Blockchain Network</p>
//                       <div className="flex items-center gap-2 mt-2">
//                         <div className="flex-1 bg-white h-2 rounded-full overflow-hidden">
//                           <div className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full w-4/5"></div>
//                         </div>
//                         <span className="text-xs sm:text-sm font-semibold text-green-600">Active</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Floating Elements */}
//                 <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl rotate-12 animate-pulse"></div>
//                 <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl -rotate-12 animate-pulse delay-1000"></div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Features Section */}
//         <section id="features" className="py-16 sm:py-20 px-4 bg-gradient-to-b from-white to-blue-50 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12 sm:mb-16">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                 Powerful Analytics & Insights
//               </h2>
//               <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
//                 Comprehensive analytics to track, monitor, and ensure the integrity of medicine batches across the supply chain
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
//               {features.map((feature, index) => (
//                 <div
//                   key={index}
//                   className={`bg-white rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
//                     activeFeature === index 
//                       ? 'border-blue-500 shadow-xl' 
//                       : 'border-gray-100 hover:border-blue-200'
//                   }`}
//                   onClick={() => setActiveFeature(index)}
//                 >
//                   <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-xl sm:text-2xl text-white mb-4 sm:mb-6`}>
//                     {feature.icon}
//                   </div>
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
//                     {feature.title}
//                   </h3>
//                   <p className="text-sm sm:text-base text-gray-600">
//                     {feature.description}
//                   </p>
//                   <div className="mt-4 sm:mt-6 flex items-center justify-between">
//                     <span className="text-xs sm:text-sm font-semibold text-blue-600">Learn More →</span>
//                     {activeFeature === index && (
//                       <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* How It Works Section */}
//         <section id="how-it-works" className="py-16 sm:py-20 px-4 bg-white w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12 sm:mb-16">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                 How Medicheck Works
//               </h2>
//               <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
//                 A seamless process from manufacturing to pharmacy delivery
//               </p>
//             </div>
            
//             <div className="relative">
//               {/* Timeline */}
//               <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
              
//               <div className="space-y-8 sm:space-y-12">
//                 {[
//                   {
//                     step: "01",
//                     title: "Manufacturer Registration",
//                     description: "Pharmaceutical manufacturers register medicine batches on the blockchain",
//                     icon: "🏭",
//                     color: "blue"
//                   },
//                   {
//                     step: "02",
//                     title: "Blockchain Verification",
//                     description: "Each batch gets a unique blockchain ID for tamper-proof tracking",
//                     icon: "🔗",
//                     color: "green"
//                   },
//                   {
//                     step: "03",
//                     title: "Supply Chain Tracking",
//                     description: "Real-time tracking through distributors, warehouses, and logistics",
//                     icon: "🚚",
//                     color: "orange"
//                   },
//                   {
//                     step: "04",
//                     title: "Pharmacy Acceptance",
//                     description: "Pharmacies verify and accept batches using blockchain verification",
//                     icon: "🏪",
//                     color: "purple"
//                   },
//                   {
//                     step: "05",
//                     title: "Customer Verification",
//                     description: "End consumers can verify medicine authenticity via QR code scanning",
//                     icon: "👥",
//                     color: "pink"
//                   },
//                   {
//                     step: "06",
//                     title: "Analytics & Compliance",
//                     description: "Comprehensive analytics for all stakeholders and regulatory compliance",
//                     icon: "📊",
//                     color: "indigo"
//                   }
//                 ].map((item, index) => (
//                   <div key={index} className={`relative flex flex-col md:flex-row items-center ${
//                     index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
//                   }`}>
//                     <div className="md:w-1/2"></div>
//                     <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
//                       <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${
//                         item.color === 'blue' ? 'from-blue-500 to-cyan-500' :
//                         item.color === 'green' ? 'from-green-500 to-emerald-500' :
//                         item.color === 'orange' ? 'from-orange-500 to-amber-500' :
//                         item.color === 'purple' ? 'from-purple-500 to-violet-500' :
//                         item.color === 'pink' ? 'from-rose-500 to-pink-500' :
//                         'from-indigo-500 to-blue-500'
//                       } flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg`}>
//                         {item.step}
//                       </div>
//                     </div>
//                     <div className={`md:w-1/2 mt-4 md:mt-0 ${
//                       index % 2 === 0 ? 'md:pl-8 lg:pl-12' : 'md:pr-8 lg:pr-12'
//                     }`}>
//                       <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
//                         <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
//                           <span className="text-xl sm:text-2xl">{item.icon}</span>
//                           <h3 className="text-base sm:text-xl font-bold text-gray-800">{item.title}</h3>
//                         </div>
//                         <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Statistics Section */}
//         <section id="stats" className="py-16 sm:py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12 sm:mb-16">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                 Key Metrics & Analytics Reports
//               </h2>
//               <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
//                 Gain insight into critical aspects of your medicine operations
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
//               {stats.map((stat, index) => (
//                 <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
//                   <div className="text-4xl sm:text-5xl mb-4">{stat.icon}</div>
//                   <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
//                   <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
//                 </div>
//               ))}
//             </div>
            
//             <div className="mt-8 sm:mt-12 bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
//               <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Supply Chain Performance</h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
//                 <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-gray-700 text-sm sm:text-base">Manufacturing Efficiency</span>
//                     <span className="font-bold text-green-600 text-sm sm:text-base">94%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
//                   </div>
//                 </div>
                
//                 <div className="p-3 sm:p-4 bg-green-50 rounded-xl">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-gray-700 text-sm sm:text-base">Delivery Accuracy</span>
//                     <span className="font-bold text-blue-600 text-sm sm:text-base">97%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div className="bg-blue-500 h-2 rounded-full" style={{ width: '97%' }}></div>
//                   </div>
//                 </div>
                
//                 <div className="p-3 sm:p-4 bg-purple-50 rounded-xl">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-gray-700 text-sm sm:text-base">Customer Satisfaction</span>
//                     <span className="font-bold text-purple-600 text-sm sm:text-base">98%</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Testimonials Section */}
//         <section id="testimonials" className="py-16 sm:py-20 px-4 bg-white w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="text-center mb-12 sm:mb-16">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                 Trusted by Pharmaceutical Industry Leaders
//               </h2>
//               <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
//                 See what industry professionals say about Medicheck
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
//               {[
//                 {
//                   name: "Dr. Sarah Johnson",
//                   role: "Quality Control Director",
//                   company: "MediLife Pharmaceuticals",
//                   quote: "Medicheck has revolutionized our supply chain transparency. The blockchain tracking gives us unprecedented visibility.",
//                   avatar: "👩‍⚕️"
//                 },
//                 {
//                   name: "Michael Chen",
//                   role: "Pharmacist & Owner",
//                   company: "City Health Pharmacy",
//                   quote: "Our customers trust our medicines more knowing they can verify authenticity instantly. It's a game-changer.",
//                   avatar: "💊"
//                 },
//                 {
//                   name: "Robert Williams",
//                   role: "Supply Chain Manager",
//                   company: "National Medical Distributors",
//                   quote: "The real-time tracking and expiration monitoring have reduced our waste by 40%. Incredible platform.",
//                   avatar: "👨‍💼"
//                 }
//               ].map((testimonial, index) => (
//                 <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
//                   <div className="text-3xl sm:text-4xl mb-4">{testimonial.avatar}</div>
//                   <p className="text-sm sm:text-base text-gray-700 italic mb-4 sm:mb-6">"{testimonial.quote}"</p>
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
//                       {testimonial.name.charAt(0)}
//                     </div>
//                     <div>
//                       <div className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
//                       <div className="text-gray-600 text-xs sm:text-sm">{testimonial.role}</div>
//                       <div className="text-xs text-gray-500">{testimonial.company}</div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* CTA Section */}
//         <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 w-full">
//           <div className="container mx-auto max-w-7xl text-center">
//             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
//               Ready to Transform Your Medicine Tracking?
//             </h2>
//             <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-10 max-w-3xl mx-auto">
//               Join hundreds of pharmaceutical companies already using Medicheck for secure, transparent medicine tracking.
//             </p>
            
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <button
//                 onClick={handleGetStarted}
//                 className="bg-white text-blue-600 px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2 sm:gap-3"
//               >
//                 <span>🚀</span>
//                 Start Free Trial
//               </button>
//               <button
//                 onClick={() => scrollToSection('features')}
//                 className="bg-transparent border-2 border-white text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white/10 transition-all"
//               >
//                 Schedule Demo
//               </button>
//             </div>
            
//             <div className="mt-6 sm:mt-8 text-blue-100 text-sm sm:text-base">
//               <p>No credit card required • 30-day free trial • Full support included</p>
//             </div>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4 w-full">
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
//                 <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Features</h4>
//                 <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
//                   <li>Batch Tracking</li>
//                   <li>Counterfeit Detection</li>
//                   <li>Expiration Monitoring</li>
//                   <li>Regulatory Compliance</li>
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Industries</h4>
//                 <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
//                   <li>Pharmaceuticals</li>
//                   <li>Medical Distributors</li>
//                   <li>Hospital Pharmacies</li>
//                   <li>Retail Pharmacies</li>
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Contact</h4>
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

// export default LandingPage;
