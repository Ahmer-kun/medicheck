import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import { THEMES } from "../data/themes";
import { useNavigate } from "react-router-dom";

function ContactPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    industry: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const logoImage = require("../pictures/MSG2.jpeg");
  
  const contactInfo = [
    {
      title: "General Inquiries",
      email: "contact.medicheck@gmail.com",
      description: "For general questions and information"
    },
    {
      title: "Technical Support",
      email: "contact.medicheck@gmail.com",
      description: "Technical issues and product support"
    },
    {
      title: "Business Partnerships",
      email: "contact.medicheck@gmail.com",
      description: "Collaboration and partnership opportunities"
    },
    {
      title: "Account Assistance",
      email: "contact.medicheck@gmail.com",
      description: "Help with account creation and access"
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        industry: "",
        message: ""
      });
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sendEmail = () => {
    const subject = encodeURIComponent("Medicheck Contact Inquiry");
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Company: ${formData.company}\n` +
      `Phone: ${formData.phone}\n` +
      `Industry: ${formData.industry}\n\n` +
      `Message:\n${formData.message}`
    );
    
    window.location.href = `mailto:contact.medicheck@gmail.com?subject=${subject}&body=${body}`;
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
                  className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
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
                <button className="text-blue-400 font-medium">
                  Contact
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/role-selection')}
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
                    className="text-gray-300 hover:text-blue-400 font-medium text-left py-2"
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
                    className="text-blue-400 font-medium text-left py-2"
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
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                <span className="font-semibold text-sm md:text-base">Get in Touch</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Contact 
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {" "}Medicheck
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
                Have questions about our blockchain medicine tracking solution? Our team is ready to help you transform your pharmaceutical supply chain.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-gray-900/50 to-blue-950/50 w-full">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-2">Send us a Message</h2>
                <p className="text-gray-300 mb-6">Fill out the form below and we'll get back to you within 24 hours.</p>
                
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✓</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-gray-300 mb-6">
                      Thank you for contacting Medicheck. We've received your message and will get back to you shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                          placeholder="john@company.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Company Name</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                          placeholder="Your Company"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Industry</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                      >
                        <option value="">Select your industry</option>
                        <option value="pharmaceutical">Pharmaceutical Manufacturer</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="hospital">Hospital</option>
                        <option value="regulator">Regulatory Agency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        rows="4"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                        placeholder="Tell us about your medicine tracking needs..."
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </div>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={sendEmail}
                        className="flex-1 bg-transparent border border-blue-500 text-blue-400 px-6 py-3 rounded-lg font-semibold hover:bg-blue-900/30 transition-colors"
                      >
                        Send via Email
                      </button>
                    </div>
                  </form>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                  
                  <div className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {info.title.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-lg mb-1">{info.title}</h3>
                          <p className="text-gray-300 text-sm mb-2">{info.description}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">Email:</span>
                              <a 
                                href={`mailto:${info.email}`} 
                                className="text-blue-400 hover:text-blue-300 truncate block"
                                title={info.email}
                              >
                                {info.email}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Office Location */}
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-blue-700/30">
                  <h3 className="text-xl font-bold text-white mb-4">Our Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                          @
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-white">Remote Operations</p>
                        <p className="text-gray-300 text-sm">Globally distributed team</p>
                        <p className="text-gray-300 text-sm">24/7 support available</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                          ⌚
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-white">Response Time</p>
                        <p className="text-gray-300 text-sm">We aim to respond within 24 hours</p>
                        <p className="text-gray-300 text-sm">Monday - Friday business days</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-blue-700/30">
                      <h4 className="font-medium text-white mb-2">Primary Contact</h4>
                      <p className="text-gray-300 text-sm mb-1">
                        All inquiries should be directed to:
                      </p>
                      <a 
                        href="mailto:contact.medicheck@gmail.com" 
                        className="text-blue-400 hover:text-blue-300 font-medium block break-all"
                      >
                        contact.medicheck@gmail.com
                      </a>
                    </div>
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
                Common Questions
              </h2>
              <p className="text-base sm:text-lg text-gray-300">
                Quick answers to frequently asked questions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  question: "How quickly can I get started?",
                  answer: "You can start immediately by creating an account. Basic access is available instantly after registration."
                },
                {
                  question: "Do you offer enterprise solutions?",
                  answer: "Yes, we provide customized enterprise solutions based on your specific needs and scale requirements."
                },
                {
                  question: "What is the setup process?",
                  answer: "Standard setup takes 1-2 weeks. We provide complete documentation and support throughout the process."
                },
                {
                  question: "Is training provided?",
                  answer: "Yes, comprehensive training materials and sessions are included for all account types."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h4 className="font-bold text-white text-lg mb-2">{faq.question}</h4>
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-300 mb-4">
                Don't see your question here?
              </p>
              <button
                onClick={() => {
                  const element = document.querySelector('form');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Ask us directly →
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-950 text-white py-12 px-4 w-full">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                <p className="text-gray-400 text-sm">
                  Secure, transparent, and compliant medicine tracking powered by blockchain technology.
                </p>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-4 text-gray-200">Pages</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><button onClick={() => navigate('/')} className="hover:text-blue-400 transition-colors text-left">Home</button></li>
                  <li><button onClick={() => navigate('/how-it-works')} className="hover:text-blue-400 transition-colors text-left">How It Works</button></li>
                  <li><button onClick={() => navigate('/industries')} className="hover:text-blue-400 transition-colors text-left">Industries</button></li>
                  <li><button className="text-blue-400">Contact</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-4 text-gray-200">Quick Links</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Get Started</li>
                  <li>Documentation</li>
                  <li>Support Center</li>
                  <li>System Status</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-bold mb-4 text-gray-200">Contact</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Email: contact.medicheck@gmail.com</li>
                  <li>Support: contact.medicheck@gmail.com</li>
                  <li>Remote Team</li>
                  <li>Global Operations</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p className="text-sm">© {new Date().getFullYear()} Medicheck. All rights reserved.</p>
              <p className="mt-2 text-xs">Secure • Transparent • Blockchain-Powered Medicine Tracking</p>
            </div>
          </div>
        </footer>
      </div>
    </BackgroundFix>
  );
}

export default ContactPage;


// Original Pages

// import React, { useState } from "react";
// import BackgroundFix from "../components/BackgroundFix";
// import { THEMES } from "../data/themes";
// import { useNavigate } from "react-router-dom";

// function ContactPage() {
//   const navigate = useNavigate();
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [showBackToTop, setShowBackToTop] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     company: "",
//     phone: "",
//     industry: "",
//     message: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const logoImage = require("../pictures/MSG2.jpeg");
  
//   const contactInfo = [
//     {
//       title: "General Inquiries",
//       email: "info@medicheck.com",
//       phone: "+1 (555) 123-4567",
//       icon: "📧",
//       description: "For general questions and information"
//     },
//     {
//       title: "Sales & Demo",
//       email: "sales@medicheck.com",
//       phone: "+1 (555) 123-4568",
//       icon: "💰",
//       description: "Schedule a demo or discuss pricing"
//     },
//     {
//       title: "Technical Support",
//       email: "support@medicheck.com",
//       phone: "+1 (555) 123-4569",
//       icon: "🔧",
//       description: "Technical issues and product support"
//     },
//     {
//       title: "Partnerships",
//       email: "partners@medicheck.com",
//       phone: "+1 (555) 123-4570",
//       icon: "🤝",
//       description: "Business development and partnerships"
//     }
//   ];

//   React.useEffect(() => {
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

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       console.log("Form submitted:", formData);
//       setLoading(false);
//       setSubmitted(true);
//       setFormData({
//         name: "",
//         email: "",
//         company: "",
//         phone: "",
//         industry: "",
//         message: ""
//       });
//     }, 1500);
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const sendEmail = () => {
//     const subject = encodeURIComponent("Medicheck Contact Inquiry");
//     const body = encodeURIComponent(
//       `Name: ${formData.name}\n` +
//       `Email: ${formData.email}\n` +
//       `Company: ${formData.company}\n` +
//       `Phone: ${formData.phone}\n` +
//       `Industry: ${formData.industry}\n\n` +
//       `Message:\n${formData.message}`
//     );
    
//     window.location.href = `mailto:contact.medicheck@gmail.com?subject=${subject}&body=${body}`;
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
//                 <button onClick={() => navigate('/')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   Home
//                 </button>
//                 <button onClick={() => navigate('/how-it-works')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   How It Works
//                 </button>
//                 <button onClick={() => navigate('/industries')} className="text-gray-300 hover:text-blue-400 font-medium transition-colors">
//                   Industries
//                 </button>
//                 <button className="text-blue-400 font-medium">Contact</button>
//               </div>
              
//               <button
//                 onClick={() => navigate('/role-selection')}
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
//             <div className="text-center max-w-4xl mx-auto">
//               <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full mb-6">
//                 <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
//                 <span className="font-semibold text-sm md:text-base">Get in Touch</span>
//               </div>
              
//               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
//                 Contact 
//                 <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//                   {" "}Medicheck
//                 </span>
//               </h1>
              
//               <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
//                 Have questions about our blockchain medicine tracking solution? Our team is ready to help you transform your pharmaceutical supply chain.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* Contact Form & Info */}
//         <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-gray-900/50 to-blue-950/50 w-full">
//           <div className="container mx-auto max-w-7xl">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
//               {/* Contact Form */}
//               <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
//                 <h2 className="text-2xl font-bold text-white mb-2">Send us a Message</h2>
//                 <p className="text-gray-300 mb-6">Fill out the form below and we'll get back to you within 24 hours.</p>
                
//                 {submitted ? (
//                   <div className="text-center py-12">
//                     <div className="text-6xl mb-4">✅</div>
//                     <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
//                     <p className="text-gray-300 mb-6">
//                       Thank you for contacting Medicheck. We've received your message and will get back to you shortly.
//                     </p>
//                     <button
//                       onClick={() => setSubmitted(false)}
//                       className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
//                     >
//                       Send Another Message
//                     </button>
//                   </div>
//                 ) : (
//                   <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-gray-300 text-sm font-medium mb-2">Full Name *</label>
//                         <input
//                           type="text"
//                           value={formData.name}
//                           onChange={(e) => handleInputChange('name', e.target.value)}
//                           className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                           placeholder="John Doe"
//                           required
//                         />
//                       </div>
                      
//                       <div>
//                         <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
//                         <input
//                           type="email"
//                           value={formData.email}
//                           onChange={(e) => handleInputChange('email', e.target.value)}
//                           className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                           placeholder="john@company.com"
//                           required
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-gray-300 text-sm font-medium mb-2">Company Name</label>
//                         <input
//                           type="text"
//                           value={formData.company}
//                           onChange={(e) => handleInputChange('company', e.target.value)}
//                           className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                           placeholder="Your Company"
//                         />
//                       </div>
                      
//                       <div>
//                         <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
//                         <input
//                           type="tel"
//                           value={formData.phone}
//                           onChange={(e) => handleInputChange('phone', e.target.value)}
//                           className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                           placeholder="+1 (555) 123-4567"
//                         />
//                       </div>
//                     </div>
                    
//                     <div>
//                       <label className="block text-gray-300 text-sm font-medium mb-2">Industry</label>
//                       <select
//                         value={formData.industry}
//                         onChange={(e) => handleInputChange('industry', e.target.value)}
//                         className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                       >
//                         <option value="">Select your industry</option>
//                         <option value="pharmaceutical">Pharmaceutical Manufacturer</option>
//                         <option value="distributor">Medical Distributor</option>
//                         <option value="hospital">Hospital Pharmacy</option>
//                         <option value="retail">Retail Pharmacy</option>
//                         <option value="regulator">Regulatory Agency</option>
//                         <option value="other">Other</option>
//                       </select>
//                     </div>
                    
//                     <div>
//                       <label className="block text-gray-300 text-sm font-medium mb-2">Message *</label>
//                       <textarea
//                         value={formData.message}
//                         onChange={(e) => handleInputChange('message', e.target.value)}
//                         rows="4"
//                         className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
//                         placeholder="Tell us about your medicine tracking needs..."
//                         required
//                       ></textarea>
//                     </div>
                    
//                     <div className="flex flex-col sm:flex-row gap-4">
//                       <button
//                         type="submit"
//                         disabled={loading}
//                         className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                       >
//                         {loading ? (
//                           <div className="flex items-center justify-center gap-2">
//                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                             Sending...
//                           </div>
//                         ) : (
//                           'Send Message'
//                         )}
//                       </button>
                      
//                       <button
//                         type="button"
//                         onClick={sendEmail}
//                         className="flex-1 bg-transparent border border-blue-500 text-blue-400 px-6 py-3 rounded-lg font-semibold hover:bg-blue-900/30 transition-colors"
//                       >
//                         Send via Email
//                       </button>
//                     </div>
//                   </form>
//                 )}
//               </div>
              
//               {/* Contact Info */}
//               <div className="space-y-6">
//                 <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
//                   <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                  
//                   <div className="space-y-6">
//                     {contactInfo.map((info, index) => (
//                       <div key={index} className="flex items-start gap-4 p-4 bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-colors">
//                         <div className="text-2xl">{info.icon}</div>
//                         <div>
//                           <h3 className="font-bold text-white mb-1">{info.title}</h3>
//                           <p className="text-gray-300 text-sm mb-2">{info.description}</p>
//                           <div className="space-y-1 text-sm">
//                             <div className="flex items-center gap-2">
//                               <span className="text-gray-400">Email:</span>
//                               <a href={`mailto:${info.email}`} className="text-blue-400 hover:text-blue-300">
//                                 {info.email}
//                               </a>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className="text-gray-400">Phone:</span>
//                               <a href={`tel:${info.phone}`} className="text-blue-400 hover:text-blue-300">
//                                 {info.phone}
//                               </a>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
                
//                 {/* Office Location */}
//                 <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-blue-700/30">
//                   <h3 className="text-xl font-bold text-white mb-4">Our Office</h3>
//                   <div className="space-y-4">
//                     <div className="flex items-start gap-3">
//                       <div className="text-xl">📍</div>
//                       <div>
//                         <p className="font-medium text-white">123 Medical Blvd, Suite 100</p>
//                         <p className="text-gray-300">San Francisco, CA 94107</p>
//                         <p className="text-gray-300">United States</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-start gap-3">
//                       <div className="text-xl">🕒</div>
//                       <div>
//                         <p className="font-medium text-white">Business Hours</p>
//                         <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
//                         <p className="text-gray-300">Saturday - Sunday: Closed</p>
//                       </div>
//                     </div>
                    
//                     <div className="pt-4 border-t border-blue-700/30">
//                       <h4 className="font-medium text-white mb-2">Response Time</h4>
//                       <p className="text-gray-300 text-sm">
//                         We aim to respond to all inquiries within 24 hours during business days.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* FAQ Section */}
//         <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-gray-900 to-blue-950 w-full">
//           <div className="container mx-auto max-w-4xl">
//             <div className="text-center mb-12">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
//                 Common Questions
//               </h2>
//               <p className="text-base sm:text-lg text-gray-300">
//                 Quick answers to frequently asked questions
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {[
//                 {
//                   question: "How quickly can I schedule a demo?",
//                   answer: "Demos can typically be scheduled within 48 hours. Contact our sales team to find a time that works for you."
//                 },
//                 {
//                   question: "Do you offer custom solutions?",
//                   answer: "Yes, we provide tailored solutions based on your specific needs and existing infrastructure."
//                 },
//                 {
//                   question: "What is your implementation timeline?",
//                   answer: "Standard implementation takes 2-4 weeks. Complex integrations may take longer depending on requirements."
//                 },
//                 {
//                   question: "Is training included?",
//                   answer: "Yes, comprehensive training is included for all users and administrators."
//                 }
//               ].map((faq, index) => (
//                 <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
//                   <h4 className="font-bold text-white text-lg mb-2">{faq.question}</h4>
//                   <p className="text-gray-300">{faq.answer}</p>
//                 </div>
//               ))}
//             </div>
            
//             <div className="text-center mt-8">
//               <p className="text-gray-300 mb-4">
//                 Don't see your question here?
//               </p>
//               <button
//                 onClick={() => {
//                   const element = document.querySelector('form');
//                   element?.scrollIntoView({ behavior: 'smooth' });
//                 }}
//                 className="text-blue-400 hover:text-blue-300 font-medium"
//               >
//                 Ask us directly →
//               </button>
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
//                   <li><button className="text-blue-400">Contact</button></li>
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-200">Quick Links</h4>
//                 <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
//                   <li>Request Demo</li>
//                   <li>Pricing</li>
//                   <li>Documentation</li>
//                   <li>Support Center</li>
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

// export default ContactPage;
