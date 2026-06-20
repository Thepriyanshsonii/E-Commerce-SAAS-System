import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Phone, MapPin, Sparkles, UserPlus, Key, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import { AuthContext, API_BASE_URL } from '../context/AuthContext';

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const searchParams = new URLSearchParams(location.search);
  const redirectDest = searchParams.get('redirect') || '/';

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate(redirectDest);
    }
  }, [user, navigate, redirectDest]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
      setError("Please fill in all the required fields: name, email, password, and mobile.");
      return;
    }

    setLoading(true);
    setError('');

    const address = {
      street: formData.street,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        address: address
      });
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to generate security OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        email: formData.email
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to resend verification OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setError("Please enter the 6-digit OTP code sent to your email address.");
      return;
    }

    setVerifyingOtp(true);
    setError('');

    try {
      // Verify OTP (which also registers/creates the user in the backend)
      await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: otpCode
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent(redirectDest)}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "OTP verification failed. Try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl shadow-lg relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl" />

        <div className="text-center relative">
          <div className="bg-emerald-500/10 p-3 rounded-full w-fit mx-auto text-emerald-500 mb-3 border border-emerald-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-1.5 text-xs text-slate-450">
            Register below to start purchasing premium products on SSJewellery.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-450 p-3.5 rounded-2xl text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-650 dark:text-emerald-450 p-3.5 rounded-2xl text-xs text-center font-bold">
            Account created successfully! Redirecting you to login...
          </div>
        )}

        {!otpSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div className="space-y-4">
              
              {/* Primary Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-850 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-850 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Address fields title */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-350 mb-3">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  <span>Address Details (Optional)</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                      placeholder="Apartment/Flat, Street name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyAndRegister}>
            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span>Confirm Registration OTP Security</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                To complete the registration, we require a verification OTP code sent to your email address <strong className="text-slate-800 dark:text-white">({formData.email})</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-pulse" />
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="py-2.5 px-4 text-xs text-emerald-500 hover:underline bg-transparent cursor-pointer font-bold"
                >
                  {loading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{verifyingOtp ? 'Verifying...' : 'Verify & Register'}</span>
                  <CheckCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="text-center text-xs mt-6 text-slate-400">
          <span>Already have an account? </span>
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectDest)}`}
            className="text-emerald-500 font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
