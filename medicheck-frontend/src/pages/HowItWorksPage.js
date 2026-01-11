import React, { useState } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { useNavigate } from "react-router-dom";

function HowItWorksPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const logoImage = require("../pictures/MSG2.jpeg");
  
  const steps = [
    {
      number: "01",
      title: "Manufacturer Registration",
      description: "Pharmaceutical manufacturers register medicine batches on the blockchain with complete production details including batch number, manufacture date, expiry date, and formulation.",
      icon: "🏭",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "02",
      title: "Blockchain Verification",
      description: "Each batch gets a unique, immutable blockchain ID. This creates a tamper-proof digital certificate that travels with the medicine throughout its lifecycle.",
      icon: "🔗",
      color: "from-green-500 to-emerald-500"
    },
    {
      number: "03",
      title: "Supply Chain Tracking",
      description: "As medicine moves through the supply chain (distributors, warehouses, logistics), each transfer is recorded on the blockchain in real-time with timestamps and GPS verification.",
      icon: "🚚",
      color: "from-orange-500 to-amber-500"
    },
    {
      number: "04",
      title: "Pharmacy Acceptance",
      description: "Pharmacies scan incoming medicines to verify authenticity. The blockchain confirms the batch hasn't been tampered with and provides complete history from manufacturer to pharmacy.",
      icon: "🏪",
      color: "from-purple-500 to-violet-500"
    },
    {
      number: "05",
      title: "Customer Verification",
      description: "End consumers can verify medicine authenticity via QR code scanning. Patients get assurance their medicine is genuine, safe, and properly stored throughout the supply chain.",
      icon: "👥",
      color: "from-pink-500 to-rose-500"
    },
    {
      number: "06",
      title: "Analytics & Compliance",
      description: "Stakeholders access comprehensive analytics dashboards. Regulators can audit the entire supply chain. Automated alerts for recalls, expirations, and suspicious activities.",
      icon: "📊",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const benefits = [
    {
      title: "End-to-End Transparency",
      description: "Track every medicine from production to patient",
      icon: "👁️"
    },
    {
      title: "Instant Verification",
      description: "Verify authenticity in seconds with QR codes",
      icon: "⚡"
    },
    {
      title: "Regulatory Compliance",
      description: "Automated compliance reporting for regulators",
      icon: "📋"
    },
    {
      title: "Reduced Counterfeits",
      description: "Blockchain verification eliminates fake medicines",
      icon: "✅"
    }
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
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
              
              <div className="hidden md:flex items-center gap-6">
                <button onClick={() => navigate('/')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
                  Home
                </button>
                <button className="text-blue-400 font-medium">How It Works</button>
                <button onClick={() => navigate('/industries')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
                  Industries
                </button>
                <button onClick={() => navigate('/contact')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
                  Contact
                </button>
              </div>
              
              <button
                onClick={() => navigate('/role-selection')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/20 opacity-50"></div>
          <div className="container mx-auto relative z-10 max-w-7xl">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                <span className="font-semibold text-sm md:text-base">Step-by-Step Process</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                How Medicheck 
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {" "}Works
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
                A seamless, transparent process from manufacturing to pharmacy delivery, powered by blockchain technology for ultimate security and traceability.
              </p>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-gray-900/50 to-blue-950/50 w-full">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Steps Timeline */}
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-8 top-16 h-full w-0.5 bg-gradient-to-b from-blue-500 to-cyan-500 opacity-50"></div>
                    )}
                    
                    <div className="flex gap-4 md:gap-6">
                      {/* Step Number */}
                      <div className="relative z-10">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                          {step.number}
                        </div>
                      </div>
                      
                      {/* Step Content */}
                      <div className="flex-1 pt-2">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}>
                            {step.icon}
                          </div>
                          <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        </div>
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Benefits Sidebar */}
              <div className="lg:pl-12">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-6">Key Benefits</h3>
                  
                  <div className="space-y-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900/70 transition-colors">
                        <div className="text-2xl">{benefit.icon}</div>
                        <div>
                          <h4 className="font-bold text-white text-lg mb-1">{benefit.title}</h4>
                          <p className="text-gray-300 text-sm">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Technology Stack */}
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h4 className="font-bold text-white mb-4">Powered By</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-900/30 rounded-lg">
                        <div className="text-2xl mb-2">🔗</div>
                        <div className="text-sm text-gray-300">Blockchain</div>
                      </div>
                      <div className="text-center p-3 bg-gray-900/30 rounded-lg">
                        <div className="text-2xl mb-2">📱</div>
                        <div className="text-sm text-gray-300">Mobile QR</div>
                      </div>
                      <div className="text-center p-3 bg-gray-900/30 rounded-lg">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="text-sm text-gray-300">Analytics</div>
                      </div>
                      <div className="text-center p-3 bg-gray-900/30 rounded-lg">
                        <div className="text-2xl mb-2">🔐</div>
                        <div className="text-sm text-gray-300">Security</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* CTA Card */}
                <div className="mt-8 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-blue-700/30">
                  <h3 className="text-xl font-bold text-white mb-3">Ready to Get Started?</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Join the revolution in medicine tracking. Schedule a demo to see how Medicheck can transform your supply chain.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/role-selection')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105"
                    >
                      Start Free Trial
                    </button>
                    <button
                      onClick={() => navigate('/contact')}
                      className="bg-transparent border border-blue-500 text-blue-400 px-6 py-3 rounded-lg font-semibold hover:bg-blue-900/30 transition-colors"
                    >
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-gray-900 to-blue-950 w-full">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-lg text-gray-300">
                Everything you need to know about Medicheck
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  question: "How secure is the blockchain technology?",
                  answer: "Medicheck uses enterprise-grade blockchain with military-grade encryption. Each transaction is immutable and cryptographically secured, making it virtually impossible to tamper with medicine records."
                },
                {
                  question: "Can I integrate Medicheck with existing systems?",
                  answer: "Yes, Medicheck offers API integration with major ERP, inventory, and pharmacy management systems. Our team provides seamless integration support."
                },
                {
                  question: "How long does implementation take?",
                  answer: "Typically 2-4 weeks for standard implementation. The timeline depends on your existing infrastructure and specific requirements."
                },
                {
                  question: "Is training provided for staff?",
                  answer: "Yes, we provide comprehensive training for all stakeholders including manufacturers, pharmacists, and quality control teams."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h4 className="font-bold text-white text-lg mb-2">{faq.question}</h4>
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              ))}
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
                  <li><button onClick={() => navigate('/')} className="hover:text-blue-400 transition-colors">Home</button></li>
                  <li><button className="text-blue-400">How It Works</button></li>
                  <li><button onClick={() => navigate('/industries')} className="hover:text-blue-400 transition-colors">Industries</button></li>
                  <li><button onClick={() => navigate('/contact')} className="hover:text-blue-400 transition-colors">Contact</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Resources</h4>
                <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                  <li>Documentation</li>
                  <li>API Reference</li>
                  <li>Case Studies</li>
                  <li>Whitepapers</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Contact</h4>
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

export default HowItWorksPage;