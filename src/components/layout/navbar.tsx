'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  User,
  LogOut,
  Sun,
  Moon,
  Globe,
  Home,
  MessageSquare,
  TrendingUp,
  Plus,
  Shield,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Flag
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { getInitials } from '@/lib/utils';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        logout();
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  // Prevent hydration mismatch - return null during SSR
  if (!mounted) {
    return null;
  }

  const navItems = [
    { href: '/', label: t('nav.home'), icon: Home, roles: ['s', 't', 'a'], public: true },
    { href: '/popular', label: t('nav.popular'), icon: TrendingUp, roles: ['s', 't', 'a'], public: true },
    { href: '/create', label: t('nav.create'), icon: Plus, roles: ['s', 't', 'a'], public: false },
    { href: '/admin/reports', label: t('nav.reports'), icon: Flag, roles: ['t', 'a'], public: false },
    { href: '/admin', label: t('nav.admin'), icon: Shield, roles: ['a'], public: false },
  ];

  const filteredNavItems = navItems.filter(item => {
    // ถ้าไม่มี user ให้แสดงแค่ public items
    if (!user) {
      return item.public;
    }
    // ถ้ามี user ให้เช็ค role
    return item.roles.includes(user.role);
  });

  return (
    // @ts-ignore - framer-motion type issue
    <motion.nav
      className="navbar-glass sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container-glass">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {/* @ts-ignore - framer-motion type issue */}
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src="/logo.png" 
                alt="PCRU CS Logo" 
                className="w-10 h-10 object-contain drop-shadow-md"
              />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-glass bg-linear-to-b from-orange-400 to-orange-500 bg-clip-text text-transparent">
                PCRU CS CONNECT
              </h1>
              <p className="text-xs text-muted-foreground hidden lg:block">
                {language === 'th' ? 'เชื่อมต่อและแบ่งปันความรู้ทางวิทยาการคอมพิวเตอร์' : 'Connect and Share Computer Science Knowledge'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-glass nav-hover"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-glass nav-hover"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-glass nav-hover"
              title={language === 'th' ? 'EN' : 'TH'}
            >
              <span className="text-xs font-bold">{language === 'th' ? 'EN' : 'TH'}</span>
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="relative user-menu-container">
                <Button
                  variant="ghost"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-glass nav-hover"
                >
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white">
                    {user.role === 'a' ? (
                      <Shield className="w-4 h-4" />
                    ) : user.role === 't' ? (
                      <BookOpen className="w-4 h-4" />
                    ) : (
                      <GraduationCap className="w-4 h-4" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm">{user.full_name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    // @ts-ignore - framer-motion type issue
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-44 card-glass rounded-xl shadow-glass-xl overflow-hidden"
                    >
                      <div className="py-1">
                        <Link href="/profile" onClick={() => setIsUserMenuOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full justify-start text-glass nav-hover">
                            <User className="w-4 h-4 mr-2" />
                            <span className="text-sm">{t('nav.profile')}</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full justify-start text-glass hover:bg-red-500/10 hover:text-red-500"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          <span className="text-sm">{t('nav.logout')}</span>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="primary-glass" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-glass nav-hover"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            // @ts-ignore - framer-motion type issue
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-white/20 dark:border-gray-700/50"
            >
              <div className="py-4 space-y-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-glass nav-hover"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}