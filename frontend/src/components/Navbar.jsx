import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, ShoppingCart, Heart, ClipboardList, Sun, Moon, LogIn, LogOut, Shield, Menu, X, User, Globe, Settings, Bell, Check, Trash2, Clock, AlertTriangle, DollarSign, MessageSquare } from 'lucide-react';
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

  // Search query & category state
  const [searchVal, setSearchVal] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

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
    { code: 'Electronics', label: t('common.electronics') },
    { code: 'Fashion', label: t('common.fashion') },
    { code: 'Grocery', label: t('common.grocery') },
    { code: 'Books', label: t('common.books') }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* LEFT SECTION: Logo + Categories Button */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 md:flex-1 md:justify-start">
            {/* Hamburger Menu (Mobile Only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden cursor-pointer"
              title="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
            </button>

            {/* BharatBasket Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <ShoppingBag className="h-7 w-7 text-emerald-500" />
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                BharatBasket
              </span>
            </Link>

            {/* Category Dropdown (Desktop / Tablet) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('common.categories')}
              </button>
              {showCategoryMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryMenu(false)} />
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {categories.map((cat) => (
                      <button
                        key={cat.code}
                        onClick={() => handleCategorySelect(cat.code)}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium cursor-pointer"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CENTER SECTION: Search Bar (Desktop / Tablet) */}
          <div className="hidden md:flex justify-center w-full max-w-[500px] lg:max-w-[700px] relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder={t('common.search_placeholder')}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all shadow-sm"
              />
              <button type="submit" className="absolute right-3 top-3 text-slate-400 hover:text-emerald-500 transition-colors">
                <Search className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

          {/* RIGHT SECTION: Dark/Light Mode + Wishlist + Cart + My Orders + Profile/Login */}
          <div className="flex items-center gap-1 sm:gap-2.5 md:gap-3.5 lg:gap-4 flex-shrink-0 md:flex-1 md:justify-end">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-bold uppercase border border-transparent hover:border-slate-205 dark:hover:border-slate-705"
                title="Change Language"
              >
                <Globe className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">{language.toUpperCase()}</span>
              </button>
              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  title={t('navbar.notifications')}
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-855 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-850 dark:text-slate-100 uppercase tracking-wide">{t('navbar.notifications')}</span>
                          {unreadCount > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 text-[10px] font-extrabold">
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                            title={t('navbar.mark_all_read')}
                          >
                            {t('navbar.mark_all_read')}
                          </button>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <button
                            onClick={handleClearRead}
                            className="text-slate-500 hover:text-rose-500 dark:text-slate-400 hover:underline cursor-pointer"
                            title={t('navbar.clear_read')}
                          >
                            {t('navbar.clear_read')}
                          </button>
                        </div>
                      </div>

                      <div className="max-h-85 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                        {displayedNotifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 dark:text-slate-500">
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
                                      bg: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20',
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
                                    bg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20',
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
                                className={`p-3.5 flex gap-3 items-start transition-colors cursor-pointer text-left ${isUnread ? 'bg-emerald-50/20 dark:bg-emerald-950/5 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
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
                                    <span className="text-[9px] font-semibold text-slate-450 dark:text-slate-500 flex-shrink-0 flex items-center gap-0.5">
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
                                          className="text-[9px] font-extrabold text-white bg-emerald-500 hover:bg-emerald-650 px-2 py-0.5 rounded-lg transition-colors cursor-pointer border-none"
                                        >
                                          Mark as read
                                        </button>
                                      ) : (
                                        <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-450 flex items-center gap-0.5 bg-emerald-100/50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-lg">
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
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer block w-full py-1 border-none bg-transparent"
                          >
                            View all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('common.wishlist')}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
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
                className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={t('common.cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
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
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
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
                  className="flex items-center space-x-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                >
                  <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:block max-w-[80px] truncate">
                    {language === 'hi' ? `${t('common.namaste')}, ${user.name}` : user.name}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400">{language === 'hi' ? 'पंजीकृत ईमेल' : 'Signed in as'}</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.email}</p>
                      </div>

                      {isAdmin ? (
                        null
                      ) : (
                        <>
                          <Link
                            to="/orders?tab=profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-705 transition-colors"
                          >
                            <User className="h-4 w-4 opacity-75" />
                            <span>{language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}</span>
                          </Link>

                          <Link
                            to="/orders?tab=profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-705 transition-colors"
                          >
                            <Settings className="h-4 w-4 opacity-75" />
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
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-705 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('navbar.sign_out')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('common.sign_in')}</span>
              </Link>
            )}
          </div>

        </div>

        {/* MOBILE SEARCH BAR: Full width responsive (visible only on mobile) */}
        <div className="pb-3 px-1 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t('common.search_placeholder')}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all shadow-sm"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-500 transition-colors">
              <Search className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in fade-in duration-200">

          {/* Categories Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('common.categories')}</h4>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.code}
                  onClick={() => handleCategorySelect(cat.code)}
                  className="py-1 px-2.5 text-center text-xs font-semibold rounded-lg bg-slate-55 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-55 dark:hover:bg-emerald-950/20 hover:text-emerald-500 transition-colors border border-slate-100 dark:border-slate-700/50 cursor-pointer"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Links */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
            {!isAdmin ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (!user) {
                      triggerAuthModal(language === 'hi' ? 'कृपया अपनी विशलिस्ट देखने के लिए लॉगिन करें।' : 'Please login to access your wishlist.', '/orders?tab=wishlist');
                    } else {
                      navigate('/orders?tab=wishlist');
                    }
                  }}
                  className="w-full flex items-center space-x-2 py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-left cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-slate-400" />
                  <span>{t('common.wishlist')} ({wishlistCount})</span>
                </button>
                <Link
                  to="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>{t('common.support')}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (!user) {
                      triggerAuthModal(language === 'hi' ? 'कृपया अपने ऑर्डर देखने के लिए लॉगिन करें।' : 'Please login to view your orders.', '/orders');
                    } else {
                      navigate('/orders');
                    }
                  }}
                  className="w-full flex items-center space-x-2 py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-left cursor-pointer"
                >
                  <ClipboardList className="h-4 w-4 text-slate-400" />
                  <span>{t('navbar.my_orders')}</span>
                </button>
              </>
            ) : (
              <>
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Administrator
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center space-x-2 py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-red-500 rounded-xl text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('navbar.sign_out')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

