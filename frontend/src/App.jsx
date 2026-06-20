import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LiveChat } from './components/LiveChat';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LanguageSelectionModal } from './components/LanguageSelectionModal';

// Pages
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { MyOrders } from './pages/MyOrders';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Support } from './pages/Support';
import { SupportCenter } from './pages/SupportCenter';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminControl } from './pages/AdminControl';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Profile } from './pages/Profile';

// Luxurious page transition wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const location = useLocation();

  // Scroll to top on every route change or search parameter change
  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname, location.search]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation bar */}
      <Navbar />

      {/* Language Preference Selection Modal */}
      <LanguageSelectionModal />

      {/* Main page content area */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
            <Route path="/cart" element={
              <ProtectedRoute>
                <PageWrapper><Cart /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <PageWrapper><Checkout /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <PageWrapper><MyOrders /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <PageWrapper><Profile /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
            <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
            <Route path="/support" element={<PageWrapper><Support /></PageWrapper>} />
            <Route path="/support-center" element={
              <ProtectedRoute>
                <PageWrapper><SupportCenter /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <PageWrapper><AdminDashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/admin-control" element={
              <ProtectedRoute adminOnly={true}>
                <PageWrapper><AdminControl /></PageWrapper>
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Interactive chatbot bubble widget */}
      <LiveChat />

      {/* Grid footer links panel - ONLY visible on Profile page */}
      {location.pathname === '/profile' && <Footer />}
    </div>
  );
}

export default App;

