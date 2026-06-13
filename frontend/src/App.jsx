import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation bar */}
      <Navbar />

      {/* Language Preference Selection Modal */}
      <LanguageSelectionModal />

      {/* Main page content area */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/support" element={<Support />} />
          <Route path="/support-center" element={
            <ProtectedRoute>
              <SupportCenter />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-control" element={
            <ProtectedRoute adminOnly={true}>
              <AdminControl />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Interactive chatbot bubble widget */}
      <LiveChat />

      {/* Grid footer links panel */}
      <Footer />
    </div>
  );
}

export default App;
