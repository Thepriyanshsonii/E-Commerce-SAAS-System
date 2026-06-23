import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, ShoppingCart, Heart, ClipboardList, Sun, Moon, LogIn, LogOut, Shield, Menu, X, User, Globe, Settings, Bell, Check, Trash2, Clock, AlertTriangle, DollarSign, MessageSquare, Home, Sparkles, Info, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext, API_BASE_URL } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useTranslation } from '../hooks/useTranslation';
import axios from 'axios';

export const Navbar = () => {
  const { user, logout, isAdmin, language, changeLanguage, updateUser } = useContext(AuthContext);
  const { cartCount, wishlistCount, triggerAuthModal } = useContext(CartContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll state to trigger premium blur/height transition
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search query & category state
  const [searchVal, setSearchVal] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);

  // Sync searchVal from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchVal(params.get('search') || '');
  }, [location.search]);

  // Dark/Light Mode Theme Management
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Notifications API Integration
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const endpoint = isAdmin ? `${API_BASE_URL}/admin/notifications` : `${API_BASE_URL}/auth/notifications`;
      const res = await axios.get(endpoint);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, isAdmin]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      if (isAdmin) {
        await axios.put(`${API_BASE_URL}/admin/notifications/${id}/read`);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
      } else {
        await axios.put(`${API_BASE_URL}/auth/notifications/${id}/read`);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        if (user) {
          const updatedNotifs = (user.notifications || []).map(n => n.id === id ? { ...n, read: true } : n);
          updateUser({ notifications: updatedNotifs });
        }
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (isAdmin) {
        await axios.put(`${API_BASE_URL}/admin/notifications/read-all`);
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      } else {
        await axios.put(`${API_BASE_URL}/auth/notifications/read-all`);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        if (user) {
          const updatedNotifs = (user.notifications || []).map(n => ({ ...n, read: true }));
          updateUser({ notifications: updatedNotifs });
        }
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleClearRead = async () => {
    try {
      if (isAdmin) {
        await axios.delete(`${API_BASE_URL}/admin/notifications/clear-read`);
        setNotifications(prev => prev.filter(n => n.status !== 'read'));
      } else {
        await axios.delete(`${API_BASE_URL}/auth/notifications/clear-read`);
        setNotifications(prev => prev.filter(n => !n.read));
        if (user) {
          const updatedNotifs = (user.notifications || []).filter(n => !n.read);
          updateUser({ notifications: updatedNotifs });
        }
      }
    } catch (err) {
      console.error("Failed to clear read notifications:", err);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch (e) {
      return '';
    }
  };

  const displayedNotifications = isAdmin
    ? notifications.filter(n => ['SUPPORT_TICKET', 'BUY_REQUEST', 'LOW_STOCK'].includes(n.type))
    : notifications;

  const unreadCount = isAdmin
    ? displayedNotifications.filter(n => n.status === 'unread').length
    : displayedNotifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?search=${encodeURIComponent(searchVal)}`);
    } else {
      navigate('/');
    }
    setMobileMenuOpen(false);
  };

  const handleCategorySelect = (cat) => {
    setShowCategoryMenu(false);
    setMobileMenuOpen(false);
    if (cat === 'All') {
      navigate('/');
    } else {
      navigate(`/?category=${cat}`);
    }
  };

  const categories = [
    { code: 'All', label: t('common.all') },
    { code: 'Necklaces', label: t('common.electronics') },
    { code: 'Rings', label: t('common.fashion') },
    { code: 'Earrings', label: t('common.grocery') },
    { code: 'Bracelets', label: t('common.books') },
    { code: 'Bangles', label: t('common.bangles') },
    { code: 'Bridal Collection', label: t('common.bridal') }
  ];

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-500 border-b ${
        isScrolled
          ? 'navbar-glass-scrolled shadow-md'
          : 'bg-white dark:bg-slate-950 border-[#F2E8D9]/60 dark:border-slate-850 shadow-sm'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between gap-4 transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'}`}>

          {/* LEFT SECTION: Logo + SSJewellery Brand Name */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 lg:flex-1 lg:justify-start">
            {/* Hamburger Menu (Mobile/Tablet Only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
              title="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
            </button>

            {/* SSJewellery Logo and Brand Name Identity */}
            <Link to="/" className="flex items-center gap-[14px] flex-shrink-0 brand-typography-wrapper select-none group no-underline">
              <img 
                src="/logo.svg" 
                alt="SSJewellery Logo" 
                className="h-[46px] md:h-[56px] lg:h-[65px] w-auto object-contain flex-shrink-0"
              />
              <div className="flex items-baseline whitespace-nowrap">
                <span className="font-cinzel text-lg sm:text-xl md:text-2xl font-bold tracking-[2px] text-[#3F1D5A] dark:text-[#EFE7DB] transition-colors duration-300">
                  SS
                </span>
                <span className="font-great-vibes text-xl sm:text-2xl md:text-3xl text-[#3F1D5A] dark:text-[#EFE7DB] ml-1.5 relative pb-1 transition-colors duration-300 select-none">
                  Jewellery
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#D4A75F]"></span>
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER SECTION: Search Bar (Desktop only) */}
          <div className="hidden lg:flex justify-center w-full max-w-[500px] lg:max-w-[700px] relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder={t('common.search_placeholder')}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-5 pr-12 py-3 text-sm bg-[#FAFAFA] dark:bg-slate-800/80 border border-[#F2E8D9] dark:border-slate-700 rounded-full focus:outline-none focus:ring-1 focus:ring-[#D4A75F] focus:border-[#D4A75F] text-[#1F1F1F] dark:text-slate-100 placeholder-slate-400 transition-all shadow-sm hover:border-[#D4A75F]/60"
              />
              <button type="submit" className="absolute right-4 top-3.5 text-[#3F1D5A] dark:text-[#D4A75F] hover:text-[#D4A75F] dark:hover:text-[#BF934B] transition-colors cursor-pointer">
                <Search className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

          {/* DESKTOP RIGHT SECTION: Visible only on lg screens and up */}
          <div className="hidden lg:flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5 lg:gap-4 flex-shrink-0 lg:flex-1 lg:justify-end">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-bold uppercase"
                title="Change Language"
              >
                <Globe className="h-4.5 w-4.5 text-[#3F1D5A] dark:text-[#D4A75F]" />
                <span className="hidden sm:inline">{language.toUpperCase()}</span>
              </button>
              <AnimatePresence>
                {langDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setLangDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-[#F2E8D9] dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 origin-top-right overflow-hidden"
                    >
                      {[
                        { code: 'en', label: 'English (EN)' },
                        { code: 'hi', label: 'Hindi (HI)' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${language === lang.code
                              ? 'text-[#3F1D5A] dark:text-[#D4A75F] bg-[#FAFAFA] dark:bg-slate-800 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={t('navbar.notifications')}
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 bg-[#D4A75F] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-[#F2E8D9] dark:border-slate-850 rounded-2xl shadow-xl z-50 overflow-hidden origin-top-right"
                      >
                      <div className="px-4 py-3 bg-[#FAFAFA] dark:bg-slate-855 border-b border-[#F2E8D9]/50 dark:border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-850 dark:text-slate-100 uppercase tracking-wide">{t('navbar.notifications')}</span>
                          {unreadCount > 0 && (
                            <span className="bg-[#D4A75F] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 text-[10px] font-extrabold">
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[#D4A75F] hover:underline cursor-pointer bg-transparent border-none"
                            title={t('navbar.mark_all_read')}
                          >
                            {t('navbar.mark_all_read')}
                          </button>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <button
                            onClick={handleClearRead}
                            className="text-slate-500 hover:text-rose-500 dark:text-slate-400 hover:underline cursor-pointer bg-transparent border-none"
                            title={t('navbar.clear_read')}
                          >
                            {t('navbar.clear_read')}
                          </button>
                        </div>
                      </div>

                      <div className="max-h-85 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                        {displayedNotifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 dark:text-slate-550">
                            <Bell className="h-8 w-8 mx-auto opacity-30 mb-2 animate-bounce" />
                            <p className="text-xs font-semibold">{t('navbar.no_notifications')}</p>
                          </div>
                        ) : (
                          displayedNotifications.map((n) => {
                            const isUnread = isAdmin ? n.status === 'unread' : !n.read;
                            const getNotificationStyles = (notif) => {
                              if (isAdmin) {
                                switch (notif.type) {
                                  case 'SUPPORT_TICKET':
                                    return {
                                      bg: 'bg-indigo-555/10 text-indigo-500 dark:bg-indigo-500/20',
                                      icon: <MessageSquare className="h-4 w-4" />
                                    };
                                  case 'BUY_REQUEST':
                                    return {
                                      bg: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20',
                                      icon: <ShoppingBag className="h-4 w-4" />
                                    };
                                  case 'LOW_STOCK':
                                    return {
                                      bg: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20',
                                      icon: <AlertTriangle className="h-4 w-4" />
                                    };
                                  default:
                                    return {
                                      bg: 'bg-slate-500/10 text-slate-500 dark:bg-slate-500/20',
                                      icon: <Bell className="h-4 w-4" />
                                    };
                                }
                              } else {
                                const title = (notif.title || '').toLowerCase();
                                const msg = (notif.message || '').toLowerCase();
                                
                                if (title.includes('support') || title.includes('ticket') || title.includes('reply') || msg.includes('support') || msg.includes('ticket')) {
                                  return {
                                    bg: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20',
                                    icon: <MessageSquare className="h-4 w-4" />
                                  };
                                }
                                if (title.includes('buy request') || title.includes('request to buy') || msg.includes('buy request') || msg.includes('request to buy') || title.includes('request status')) {
                                  return {
                                    bg: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20',
                                    icon: <ShoppingBag className="h-4 w-4" />
                                  };
                                }
                                if (title.includes('order') || msg.includes('order')) {
                                  return {
                                    bg: 'bg-[#D4A75F]/10 text-[#D4A75F] dark:bg-[#D4A75F]/20',
                                    icon: <ShoppingCart className="h-4 w-4" />
                                  };
                                }
                                return {
                                  bg: 'bg-slate-500/10 text-slate-500 dark:bg-slate-500/20',
                                  icon: <Bell className="h-4 w-4" />
                                };
                              }
                            };
                            const styles = getNotificationStyles(n);
                            const handleNotificationClick = () => {
                              setNotificationsOpen(false);
                              if (isAdmin) {
                                  if (n.type === 'SUPPORT_TICKET') {
                                    navigate('/admin?tab=support');
                                  } else if (n.type === 'BUY_REQUEST') {
                                    navigate('/admin?tab=notifications');
                                  } else if (n.type === 'LOW_STOCK') {
                                    navigate('/admin?tab=products');
                                  }
                              } else {
                                const title = (n.title || '').toLowerCase();
                                const msg = (n.message || '').toLowerCase();
                                
                                if (!n.read) {
                                  handleMarkAsRead(n.id);
                                }

                                if (title.includes('support') || title.includes('ticket') || title.includes('reply') || msg.includes('support') || msg.includes('ticket')) {
                                  navigate('/support-center');
                                } else if (title.includes('buy request') || title.includes('request to buy') || msg.includes('buy request') || msg.includes('request to buy') || title.includes('request status')) {
                                  navigate('/orders?tab=buy-requests');
                                } else {
                                  navigate('/orders?tab=orders');
                                }
                              }
                            };
                            return (
                              <div
                                key={n.id}
                                onClick={handleNotificationClick}
                                className={`p-3.5 flex gap-3 items-start transition-colors cursor-pointer text-left ${isUnread ? 'bg-[#D4A75F]/5 dark:bg-[#D4A75F]/5 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                                  }`}
                              >
                                <div className={`p-2 rounded-xl flex-shrink-0 ${styles.bg}`}>
                                  {styles.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-1.5">
                                    <p className={`text-xs font-bold truncate ${isUnread ? 'text-slate-850 dark:text-slate-105' : 'text-slate-500 dark:text-slate-450'}`}>
                                      {n.title}
                                    </p>
                                    <span className="text-[9px] font-semibold text-slate-450 dark:text-slate-550 flex-shrink-0 flex items-center gap-0.5">
                                      <Clock className="h-2.5 w-2.5" />
                                      {formatTimeAgo(n.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                    {n.description || n.message}
                                  </p>

                                  <div className="flex justify-between items-center mt-2.5">
                                    <div />
                                    <div>
                                      {isUnread ? (
                                        <button
                                          onClick={(e) => handleMarkAsRead(n.id, e)}
                                          className="text-[9px] font-extrabold text-white bg-[#D4A75F] hover:bg-[#BF934B] px-2 py-0.5 rounded-lg transition-colors cursor-pointer border-none"
                                        >
                                          Mark as read
                                        </button>
                                      ) : (
                                        <span className="text-[9px] font-extrabold text-[#D4A75F] flex items-center gap-0.5 bg-[#D4A75F]/10 dark:bg-[#D4A75F]/15 px-1.5 py-0.5 rounded-lg">
                                          <Check className="h-3 w-3" />
                                          <span>Read</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {isAdmin && (
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-200/50 dark:border-slate-800/80 text-center">
                          <button
                            onClick={() => {
                              setNotificationsOpen(false);
                              navigate('/admin?tab=notifications');
                            }}
                            className="text-xs font-bold text-[#D4A75F] hover:underline cursor-pointer block w-full py-1 border-none bg-transparent"
                          >
                            View all notifications
                          </button>
                        </div>
                      )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Light/Dark Mode"
            >
              {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist Icon */}
            {!isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    triggerAuthModal(language === 'hi' ? 'कृपया अपनी विशलिस्ट देखने के लिए लॉगिन करें।' : 'Please login to access your wishlist.', '/orders?tab=wishlist');
                  } else {
                    navigate('/orders?tab=wishlist');
                  }
                }}
                className="relative p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('common.wishlist')}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <motion.span
                    key={`wishlist-${wishlistCount}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [0.6, 1.25, 1], opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 12 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#D4A75F] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-cart-bounce"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </button>
            )}

            {/* Cart Icon */}
            {!isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    triggerAuthModal(language === 'hi' ? 'उत्पादों को कार्ट में जोड़ने के लिए कृपया लॉगिन करें।' : 'Please login to add products to your cart.', '/cart');
                  } else {
                    navigate('/cart');
                  }
                }}
                className="relative p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('common.cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={`cart-${cartCount}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [0.6, 1.25, 1], opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 12 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#D4A75F] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-cart-bounce"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            )}

            {/* My Orders Button */}
            {!isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    triggerAuthModal(language === 'hi' ? 'कृपया अपने ऑर्डर देखने के लिए लॉगिन करें।' : 'Please login to view your orders.', '/orders');
                  } else {
                    navigate('/orders');
                  }
                }}
                className="p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
                title={t('navbar.my_orders')}
              >
                <ClipboardList className="h-5 w-5" />
                <span className="text-xs font-semibold hidden lg:inline">{t('common.orders')}</span>
              </button>
            )}

            {/* User Profile / Login Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1.5 rounded-xl border border-[#F2E8D9] dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                >
                  <div className="h-6 w-6 rounded-full bg-[#D4A75F] text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-[#3F1D5A] dark:text-slate-200 hidden sm:block max-w-[80px] truncate">
                    {language === 'hi' ? `${t('common.namaste')}, ${user.name}` : user.name}
                  </span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#121826] border border-[#F2E8D9] dark:border-[rgba(212,167,95,0.25)] rounded-2xl shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-2 z-50 origin-top-right overflow-hidden"
                      >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-[rgba(212,167,95,0.15)]">
                        <p className="text-xs text-slate-400">{language === 'hi' ? 'पंजीकृत ईमेल' : 'Signed in as'}</p>
                        <p className="text-sm font-bold text-[#1F1F1F] dark:text-white truncate">{user.email}</p>
                      </div>

                      {isAdmin ? (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm text-[#3F1D5A] dark:text-white hover:bg-slate-50 dark:hover:bg-[rgba(212,167,95,0.12)] dark:hover:text-[#D4A75F] transition-all duration-200"
                        >
                          <Shield className="h-4 w-4 opacity-75 text-[#3F1D5A] dark:text-[#D4A75F]" />
                          <span>Admin Panel</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2.5 text-sm text-[#1F1F1F] dark:text-white hover:bg-slate-50 dark:hover:bg-[rgba(212,167,95,0.12)] dark:hover:text-[#D4A75F] transition-all duration-200"
                          >
                            <User className="h-4 w-4 opacity-75 text-[#3F1D5A] dark:text-[#D4A75F]" />
                            <span>{language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}</span>
                          </Link>

                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2.5 text-sm text-[#1F1F1F] dark:text-white hover:bg-slate-50 dark:hover:bg-[rgba(212,167,95,0.12)] dark:hover:text-[#D4A75F] transition-all duration-200"
                          >
                            <Settings className="h-4 w-4 opacity-75 text-[#3F1D5A] dark:text-[#D4A75F]" />
                            <span>{language === 'hi' ? 'खाता सेटिंग्स' : 'Account Settings'}</span>
                          </Link>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-500 hover:bg-[#FAFAFA] dark:text-white dark:hover:bg-[rgba(212,167,95,0.12)] dark:hover:text-[#D4A75F] transition-all duration-200 text-left cursor-pointer bg-transparent border-none"
                      >
                        <LogOut className="h-4 w-4 text-red-500 dark:text-[#D4A75F]" />
                        <span>{t('navbar.sign_out')}</span>
                      </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 py-2 px-4 bg-[#D4A75F] hover:bg-[#BF934B] text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('common.sign_in')}</span>
              </Link>
            )}
          </div>

          {/* MOBILE/TABLET RIGHT SECTION: Icons (Wishlist, Cart, Orders, Profile/Login) */}
          <div className="flex lg:hidden items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Wishlist Icon - Hidden under 420px, priority 3 */}
            {!isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    triggerAuthModal(language === 'hi' ? 'कृपया अपनी विशलिस्ट देखने के लिए लॉगिन करें।' : 'Please login to access your wishlist.', '/orders?tab=wishlist');
                  } else {
                    navigate('/orders?tab=wishlist');
                  }
                }}
                className="hidden min-[420px]:flex relative p-1.5 sm:p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('common.wishlist')}
              >
                <Heart className="h-5.5 w-5.5 text-[#3F1D5A] dark:text-[#D4A75F]" />
                {wishlistCount > 0 && (
                  <motion.span
                    key={`wishlist-mob-${wishlistCount}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [0.6, 1.25, 1], opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 12 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#D4A75F] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-950 shadow-sm animate-cart-bounce"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </button>
            )}

            {/* Cart Icon - Always visible, priority 1 */}
            {!isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    triggerAuthModal(language === 'hi' ? 'उत्पादों को कार्ट में जोड़ने के लिए कृपया लॉगिन करें।' : 'Please login to add products to your cart.', '/cart');
                  } else {
                    navigate('/cart');
                  }
                }}
                className="relative p-1.5 sm:p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('common.cart')}
              >
                <ShoppingCart className="h-5.5 w-5.5 text-[#3F1D5A] dark:text-[#D4A75F]" />
                {cartCount > 0 && (
                  <motion.span
                    key={`cart-mob-${cartCount}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [0.6, 1.25, 1], opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 12 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#D4A75F] text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-950 shadow-sm animate-cart-bounce"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            )}

            {/* My Orders Icon - Hidden under 500px, priority 4 */}
            {!isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!user) {
                    triggerAuthModal(language === 'hi' ? 'कृपया अपने ऑर्डर देखने के लिए लॉगिन करें।' : 'Please login to view your orders.', '/orders');
                  } else {
                    navigate('/orders');
                  }
                }}
                className="hidden min-[500px]:flex p-1.5 sm:p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('navbar.my_orders')}
              >
                <ClipboardList className="h-5.5 w-5.5 text-[#3F1D5A] dark:text-[#D4A75F]" />
              </button>
            )}

            {/* Profile / Login Icon - Hidden under 350px, priority 2 */}
            <div className="hidden min-[350px]:flex relative">
              {user ? (
                <div className="relative flex">
                  <button
                    onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                    className="flex items-center p-1 rounded-full border border-[#F2E8D9]/80 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-full bg-[#D4A75F] text-white flex items-center justify-center text-[10px] font-bold uppercase shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                  </button>
                  <AnimatePresence>
                    {mobileProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMobileProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 mt-8 w-48 bg-white dark:bg-[#121826] border border-[#F2E8D9] dark:border-[rgba(212,167,95,0.25)] rounded-2xl shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-2 z-50 origin-top-right overflow-hidden"
                        >
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-[rgba(212,167,95,0.15)]">
                          <p className="text-xs font-bold text-slate-700 dark:text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setMobileProfileOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2.5 text-sm text-[#3F1D5A] hover:bg-slate-50 dark:text-white dark:hover:bg-[rgba(212,167,95,0.12)] dark:hover:text-[#D4A75F] transition-all duration-200"
                          >
                            <Shield className="h-4 w-4 text-[#3F1D5A] dark:text-[#D4A75F]" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        {!isAdmin && (
                          <Link
                            to="/profile"
                            onClick={() => setMobileProfileOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2.5 text-sm text-[#1F1F1F] hover:bg-slate-50 dark:text-white dark:hover:bg-[rgba(212,167,95,0.12)] dark:hover:text-[#D4A75F] transition-all duration-200"
                          >
                            <User className="h-4 w-4 text-[#3F1D5A] dark:text-[#D4A75F]" />
                            <span>{language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setMobileProfileOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-500 hover:bg-[#FAFAFA] dark:text-white dark:hover:bg-[rgba(212,167,95,0.12)] dark:hover:text-[#D4A75F] transition-all duration-200 text-left cursor-pointer bg-transparent border-none"
                        >
                          <LogOut className="h-4 w-4 text-red-500 dark:text-[#D4A75F]" />
                          <span>{t('navbar.sign_out')}</span>
                        </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-1.5 sm:p-2 rounded-xl text-[#3F1D5A] dark:text-[#EFE7DB] hover:bg-[#FAFAFA] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={t('common.sign_in')}
                >
                  <User className="h-5.5 w-5.5 text-[#3F1D5A] dark:text-[#D4A75F]" />
                </Link>
              )}
            </div>
          </div>

        </div>

        {/* MOBILE SEARCH BAR: Full width responsive (visible only on mobile/tablet) */}
        <div className="pb-3 px-1 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t('common.search_placeholder')}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-5 pr-12 py-2.5 text-sm bg-[#FAFAFA] dark:bg-slate-800/80 border border-[#F2E8D9] dark:border-slate-700 rounded-full focus:outline-none focus:ring-1 focus:ring-[#D4A75F] focus:border-[#D4A75F] text-[#1F1F1F] dark:text-slate-100 placeholder-slate-400 transition-all shadow-sm"
            />
            <button type="submit" className="absolute right-4 top-3 text-[#3F1D5A] dark:text-[#D4A75F] hover:text-[#D4A75F] transition-colors bg-transparent border-none">
              <Search className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      </div>
    </nav>

    {/* Mobile/Tablet Nav Drawer Overlay & Sidebar Drawer */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.6, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -80 || info.velocity.x < -300) {
                setMobileMenuOpen(false);
              }
            }}
            className="fixed inset-y-0 left-0 w-[300px] sm:w-[350px] bg-white dark:bg-slate-950 z-50 shadow-2xl flex flex-col p-6 overflow-y-auto border-r border-[#F2E8D9]/60 dark:border-slate-800 lg:hidden touch-pan-y"
          >
            {/* Header */}
            <div className="flex items-center pb-5 border-b border-slate-100 dark:border-slate-900">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-[14px] select-none group no-underline">
                <img 
                  src="/logo.svg" 
                  alt="SSJewellery Logo" 
                  className="h-[46px] w-auto object-contain flex-shrink-0"
                />
                <div className="flex items-baseline brand-typography-wrapper whitespace-nowrap">
                  <span className="font-cinzel text-base font-bold tracking-[1.5px] text-[#3F1D5A] dark:text-[#EFE7DB]">
                    SS
                  </span>
                  <span className="font-great-vibes text-lg text-[#3F1D5A] dark:text-[#EFE7DB] ml-1 relative pb-0.5">
                    Jewellery
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#D4A75F] opacity-80"></span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Profile Section */}
            <div className="py-6 border-b border-slate-100 dark:border-slate-900">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#3F1D5A] dark:bg-[#D4A75F] text-white flex items-center justify-center text-sm font-bold uppercase shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 truncate">
                        {language === 'hi' ? `${t('common.namaste')}, ${user.name}` : user.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full py-2 bg-[#3F1D5A]/10 text-[#3F1D5A] hover:bg-[#3F1D5A]/15 dark:bg-[#D4A75F]/10 dark:text-[#D4A75F] dark:hover:bg-[#D4A75F]/15 font-bold rounded-xl text-xs transition-colors mt-1"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <p className="text-xs text-slate-400 mb-1">
                    {language === 'hi' ? 'विशेष ऑफ़र और ऑर्डर देखने के लिए लॉगिन करें' : 'Log in to view special offers & orders'}
                  </p>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#3F1D5A] hover:bg-[#2f1543] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t('common.sign_in')}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Premium Language & Theme Cards (Mobile Only) */}
            <div className="py-5 border-b border-slate-100 dark:border-slate-900 space-y-4">
              {/* Language Selection Card */}
              <div className="bg-white dark:bg-slate-900 border border-[#F2E8D9]/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                {/* Gold accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#D4A75F]" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-[#D4A75F]/10 text-[#D4A75F]">
                      <Globe className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">
                        {language === 'hi' ? 'भाषा' : 'Language'}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {language === 'hi' ? 'भाषा चुनें' : 'Select language'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex rounded-xl bg-slate-50 dark:bg-slate-850 p-1 border border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                        language === 'en'
                          ? 'bg-[#3F1D5A] text-white shadow-md scale-105'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => changeLanguage('hi')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                        language === 'hi'
                          ? 'bg-[#3F1D5A] text-white shadow-md scale-105'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      HI
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme Selection Card */}
              <div className="bg-white dark:bg-slate-900 border border-[#F2E8D9]/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                {/* Gold accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#D4A75F]" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-[#D4A75F]/10 text-[#D4A75F]">
                      {isDark ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">
                        {language === 'hi' ? 'थीम मोड' : 'Theme Mode'}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {isDark
                          ? (language === 'hi' ? 'डार्क थीम सक्रिय' : 'Dark Theme Active')
                          : (language === 'hi' ? 'लाइट थीम सक्रिय' : 'Light Theme Active')}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 focus:outline-none flex items-center relative cursor-pointer ${
                      isDark ? 'bg-[#3F1D5A]' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`h-4.5 w-4.5 rounded-full shadow-md transform duration-300 flex items-center justify-center ${
                        isDark ? 'translate-x-5.5 bg-white' : 'translate-x-0 bg-white'
                      }`}
                    >
                      {isDark ? (
                        <Moon className="h-2.5 w-2.5 text-[#3F1D5A]" />
                      ) : (
                        <Sun className="h-2.5 w-2.5 text-[#D4A75F]" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-grow py-6 space-y-5">
              {/* Secondary Navigation */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider mb-2">
                  {language === 'hi' ? 'नेविगेशन' : 'Navigation'}
                </div>
                
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 py-2 px-3 hover:bg-[#FAFAFA] dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
                >
                  <Home className="h-4.5 w-4.5 text-[#3F1D5A] dark:text-[#D4A75F]" />
                  <span className="font-semibold text-sm">{language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
                </Link>

                <Link
                  to="/support-center"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 py-2 px-3 hover:bg-[#FAFAFA] dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
                >
                  <MessageSquare className="h-4.5 w-4.5 text-[#3F1D5A] dark:text-[#D4A75F]" />
                  <span className="font-semibold text-sm">{t('common.support')}</span>
                </Link>
              </div>

              {/* Collections & Categories */}
              <div className="space-y-4">
                {/* Collections */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider mb-1.5">
                    {language === 'hi' ? 'संग्रह' : 'Collections'}
                  </div>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/?category=Bridal Collection');
                      }}
                      className="w-full flex items-center space-x-3 py-2 px-3 hover:bg-[#FAFAFA] dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl text-left bg-transparent border-none cursor-pointer transition-all animate-none"
                    >
                      <Sparkles className="h-4 w-4 text-[#D4A75F]" />
                      <span className="font-semibold text-sm">{language === 'hi' ? 'ब्राइडल कलेक्शन' : 'Bridal Collection'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/?category=Rings');
                      }}
                      className="w-full flex items-center space-x-3 py-2 px-3 hover:bg-[#FAFAFA] dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl text-left bg-transparent border-none cursor-pointer transition-all animate-none"
                    >
                      <Sparkles className="h-4 w-4 text-[#D4A75F]" />
                      <span className="font-semibold text-sm">{language === 'hi' ? 'सॉलिटेयर रिंग्स' : 'Solitaire Rings'}</span>
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider mb-1.5">
                    {language === 'hi' ? 'श्रेणियाँ' : 'Categories'}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.filter(cat => cat.code !== 'All').map((cat) => (
                      <button
                        key={cat.code}
                        onClick={() => handleCategorySelect(cat.code)}
                        className="py-2 px-3 text-xs text-left bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer border border-[#F2E8D9]/40 dark:border-slate-800 transition-all truncate"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brand Information / Secondary Pages */}
              <div className="space-y-3 pt-2 border-t border-slate-105 dark:border-slate-850">
                {/* About Us (Collapsible) */}
                <div className="border-b border-slate-100/50 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                    className="w-full flex items-center justify-between py-2 px-3 text-slate-700 dark:text-slate-200 hover:bg-[#FAFAFA] dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer bg-transparent border-none text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Info className="h-4.5 w-4.5 text-[#3F1D5A] dark:text-[#D4A75F]" />
                      <span className="font-semibold text-sm">{language === 'hi' ? 'हमारे बारे में' : 'About Us'}</span>
                    </div>
                    <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${mobileAboutOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {mobileAboutOpen && (
                    <div className="pl-10 pr-3 py-2 text-xs text-slate-550 dark:text-slate-400 space-y-1.5 leading-relaxed">
                      <p>{language === 'hi' ? 'SSJewellery सदाबहार सुंदरता और उत्कृष्ट शिल्प कौशल का प्रतीक है।' : 'SSJewellery represents timeless elegance and exquisite craftsmanship.'}</p>
                      <p>{language === 'hi' ? 'हम प्रत्येक अवसर के लिए प्रीमियम और लक्जरी आभूषण डिजाइन करते हैं।' : 'We design premium and luxury jewellery curated for your special moments.'}</p>
                    </div>
                  )}
                </div>

                {/* Contact Us (Collapsible) */}
                <div className="border-b border-slate-100/50 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setMobileContactOpen(!mobileContactOpen)}
                    className="w-full flex items-center justify-between py-2 px-3 text-slate-700 dark:text-slate-200 hover:bg-[#FAFAFA] dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer bg-transparent border-none text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4.5 w-4.5 text-[#3F1D5A] dark:text-[#D4A75F]" />
                      <span className="font-semibold text-sm">{language === 'hi' ? 'हमसे संपर्क करें' : 'Contact Us'}</span>
                    </div>
                    <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${mobileContactOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {mobileContactOpen && (
                    <div className="pl-10 pr-3 py-2 text-xs text-slate-550 dark:text-slate-400 space-y-1.5 leading-relaxed">
                      <p>📧 support@ssjewellery.com</p>
                      <p>📞 +91 98765 43210</p>
                      <p>📍 {language === 'hi' ? 'मुंबई, भारत' : 'Mumbai, India'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {user && (
              <div className="py-5 border-t border-slate-100 dark:border-slate-900">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 text-xs font-bold text-red-500 hover:bg-red-55 dark:hover:bg-red-950/20 rounded-xl transition-colors text-left cursor-pointer border border-red-200/50 dark:border-red-900/30 bg-transparent"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('navbar.sign_out')}</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};


