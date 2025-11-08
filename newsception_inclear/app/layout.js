
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Menu, X, Sun, Moon, Search, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const isLandingPage = currentPageName === "Landing";

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-[#1a1a1a]' : 'bg-[#e8e8e8]'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Crimson+Text:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        :root {
          --shadow-light: 6px 6px 12px rgba(0, 0, 0, 0.1);
          --shadow-dark: -6px -6px 12px rgba(255, 255, 255, 0.8);
          --shadow-inset-light: inset 4px 4px 8px rgba(0, 0, 0, 0.1);
          --shadow-inset-dark: inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        }

        .dark {
          --shadow-light: 6px 6px 12px rgba(0, 0, 0, 0.5);
          --shadow-dark: -6px -6px 12px rgba(255, 255, 255, 0.05);
          --shadow-inset-light: inset 4px 4px 8px rgba(0, 0, 0, 0.5);
          --shadow-inset-dark: inset -4px -4px 8px rgba(255, 255, 255, 0.05);
        }

        .neomorphic {
          box-shadow: var(--shadow-light), var(--shadow-dark);
        }

        .neomorphic-inset {
          box-shadow: var(--shadow-inset-light), var(--shadow-inset-dark);
        }

        .neomorphic-pressed {
          box-shadow: inset 3px 3px 6px rgba(0, 0, 0, 0.15),
                      inset -3px -3px 6px rgba(255, 255, 255, 0.7);
        }

        .font-serif {
          font-family: 'Playfair Display', 'Crimson Text', serif;
        }

        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e8e8]'} border-b ${isDark ? 'border-[#2a2a2a]' : 'border-[#d0d0d0]'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl(isAuthenticated ? "Dashboard" : "Landing")} className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2"
              >
                <div className={`w-8 h-8 rounded-lg neomorphic flex items-center justify-center ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e8e8]'}`}>
                  <span className={`text-lg font-serif font-bold ${isDark ? 'text-[#d4af37]' : 'text-[#b8860b]'}`}>N</span>
                </div>
                <div>
                  <h1 className={`text-xl font-serif font-bold ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                    Newsception
                  </h1>
                  <p className={`text-[10px] font-sans ${isDark ? 'text-gray-500' : 'text-gray-600'} -mt-1`}>
                    The whole story in one place
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {isAuthenticated && (
                <>
                  <Link to={createPageUrl("Dashboard")}>
                    <Button 
                      variant="ghost" 
                      className={`font-sans ${currentPageName === "Dashboard" ? (isDark ? 'text-[#d4af37]' : 'text-[#b8860b]') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Explore
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Subscriptions")}>
                    <Button 
                      variant="ghost" 
                      className={`font-sans ${currentPageName === "Subscriptions" ? (isDark ? 'text-[#d4af37]' : 'text-[#b8860b]') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}
                    >
                      Subscriptions
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Feedback")}>
                    <Button 
                      variant="ghost" 
                      className={`font-sans ${currentPageName === "Feedback" ? (isDark ? 'text-[#d4af37]' : 'text-[#b8860b]') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}
                    >
                      Feedback
                    </Button>
                  </Link>
                </>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg neomorphic transition-all ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e8e8]'}`}
              >
                {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full neomorphic-inset ${isDark ? 'bg-[#1a1a1a] text-gray-300' : 'bg-[#e8e8e8] text-gray-700'} text-sm font-sans flex items-center gap-2`}>
                    <User className="w-3 h-3" />
                    {user?.full_name || user?.email}
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                !isLandingPage && (
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    className={`neomorphic ${isDark ? 'bg-[#1a1a1a] text-[#d4af37]' : 'bg-[#e8e8e8] text-[#b8860b]'} font-sans`}
                  >
                    Sign In
                  </Button>
                )
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg neomorphic ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#e8e8e8]'}`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`md:hidden overflow-hidden border-t ${isDark ? 'border-[#2a2a2a] bg-[#1a1a1a]' : 'border-[#d0d0d0] bg-[#e8e8e8]'}`}
            >
              <div className="px-4 py-4 space-y-3">
                {isAuthenticated && (
                  <>
                    <Link to={createPageUrl("Dashboard")} onClick={() => setMobileMenuOpen(false)}>
                      <button className={`w-full text-left px-4 py-3 rounded-lg neomorphic ${isDark ? 'bg-[#1a1a1a] text-gray-300' : 'bg-[#e8e8e8] text-gray-700'} font-sans`}>
                        <Search className="w-4 h-4 inline mr-2" />
                        Explore
                      </button>
                    </Link>
                    <Link to={createPageUrl("Subscriptions")} onClick={() => setMobileMenuOpen(false)}>
                      <button className={`w-full text-left px-4 py-3 rounded-lg neomorphic ${isDark ? 'bg-[#1a1a1a] text-gray-300' : 'bg-[#e8e8e8] text-gray-700'} font-sans`}>
                        Subscriptions
                      </button>
                    </Link>
                    <Link to={createPageUrl("Feedback")} onClick={() => setMobileMenuOpen(false)}>
                      <button className={`w-full text-left px-4 py-3 rounded-lg neomorphic ${isDark ? 'bg-[#1a1a1a] text-gray-300' : 'bg-[#e8e8e8] text-gray-700'} font-sans`}>
                        Feedback
                      </button>
                    </Link>
                  </>
                )}
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`w-full text-left px-4 py-3 rounded-lg neomorphic ${isDark ? 'bg-[#1a1a1a] text-gray-300' : 'bg-[#e8e8e8] text-gray-700'} font-sans flex items-center justify-between`}
                >
                  <span>Theme</span>
                  {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                </button>
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-3 rounded-lg neomorphic ${isDark ? 'bg-[#1a1a1a] text-red-400' : 'bg-[#e8e8e8] text-red-600'} font-sans`}
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-[#2a2a2a] bg-[#1a1a1a]' : 'border-[#d0d0d0] bg-[#e8e8e8]'} py-8 mt-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className={`font-serif font-bold text-lg ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
                Newsception
              </p>
              <p className={`text-sm font-sans ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                © 2025 - The whole story in one place
              </p>
            </div>
            <div className={`text-sm font-sans ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              Built with care for balanced journalism
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
