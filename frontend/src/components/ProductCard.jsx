import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

export const ProductCard = ({ product, onAdminAction }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, triggerAuthModal } = useContext(CartContext);
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, localize } = useTranslation();

  const isProductInWishlist = isInWishlist(product._id);
  const discountedPrice = Math.round(product.price - (product.price * (product.discount / 100)));

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      triggerAuthModal(t('product_card.login_wishlist'), window.location.pathname);
      return;
    }
    if (isProductInWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      triggerAuthModal(t('product_card.login_cart'), window.location.pathname);
      return;
    }
    addToCart(product, 1);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      triggerAuthModal(t('product_card.login_order'), '/login');
      return;
    }
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 transition-colors"
      >
        <Heart className={`h-5 w-5 ${isProductInWishlist ? 'text-red-500 fill-current' : ''}`} />
      </button>

      {/* Discount Badge */}
      {product.discount > 0 && (
        <span className="absolute top-4 left-4 z-10 bg-red-500 text-white font-semibold text-xs px-2.5 py-1 rounded-full shadow-sm">
          {product.discount}% {t('product_card.off')}
        </span>
      )}

      {/* Image Block */}
      <Link to={`/product/${product._id}`} className="block relative aspect-video w-full overflow-hidden bg-slate-50 dark:bg-slate-955 p-3 flex items-center justify-center">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'}
          alt={localize(product, 'name')}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content Block */}
      <div className="p-3.5 sm:p-4.5 flex-grow flex flex-col">
        {/* Category */}
        <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          {(() => {
            const catKey = `common.${product.category?.toLowerCase()}`;
            const trans = t(catKey);
            return trans === catKey ? product.category : trans;
          })()}
        </span>

        {/* Product Title */}
        <Link to={`/product/${product._id}`} className="block mt-0.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 line-clamp-1">
            {localize(product, 'name')}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mt-1 mb-2">
          <div className="flex items-center text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="ml-1 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              {(product.ratings || 0).toFixed(1)}
            </span>
          </div>
          <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>
          <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-505">
            {product.stock > 0 ? `${product.stock} ${t('product_card.left')}` : t('product_card.out_of_stock')}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-grow">
          {localize(product, 'description')}
        </p>

        {/* Price Row */}
        <div className="flex items-baseline space-x-1.5 mb-3">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-55">
            ₹{discountedPrice}
          </span>
          {product.discount > 0 && (
            <span className="text-xs sm:text-sm text-slate-400 line-through">
              ₹{product.price}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {!isAdmin ? (
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex items-center justify-center space-x-1 sm:space-x-1.5 py-1.5 sm:py-2 px-1.5 sm:px-3 bg-slate-100 hover:bg-emerald-500 hover:text-white dark:bg-slate-700/50 dark:hover:bg-emerald-500 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-800 rounded-xl font-semibold text-[10px] sm:text-xs tracking-wide transition-colors"
            >
              <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{t('product_card.add_cart')}</span>
            </button>
            
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="py-1.5 sm:py-2 px-1.5 sm:px-3 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white disabled:opacity-50 rounded-xl font-semibold text-[10px] sm:text-xs tracking-wide shadow-md hover:shadow-lg transition-all text-center"
            >
              {t('product_card.buy_now')}
            </button>
          </div>
        ) : (
          <div className="mt-auto">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onAdminAction) {
                  onAdminAction(product._id);
                } else {
                  navigate('/admin');
                }
              }}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-emerald-500 hover:text-white dark:bg-slate-700/50 dark:hover:bg-emerald-500 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs tracking-wide transition-all text-center block border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              🛠️ {t('navbar.admin_panel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
