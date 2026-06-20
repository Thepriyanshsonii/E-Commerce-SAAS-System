import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/product/${product._id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-[#D4A75F]/30 transition-all duration-500 overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Wishlist Button */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWishlistToggle}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
      >
        <Heart className={`h-5 w-5 ${isProductInWishlist ? 'text-red-500 fill-current animate-heart-beat' : 'transition-transform'}`} />
      </motion.button>

      {/* Discount Badge */}
      {product.discount > 0 && (
        <span className="absolute top-4 left-4 z-10 bg-red-500 text-white font-semibold text-xs px-2.5 py-1 rounded-full shadow-sm">
          {product.discount}% {t('product_card.off')}
        </span>
      )}

      {/* Image Block */}
      <Link to={`/product/${product._id}`} className="block relative aspect-video w-full overflow-hidden bg-slate-50 dark:bg-slate-950 p-3 flex items-center justify-center">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'}
          alt={localize(product, 'name')}
          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
      </Link>

      {/* Content Block */}
      <div className="p-3.5 sm:p-4.5 flex-grow flex flex-col">
        {/* Category */}
        <span className="text-[10px] sm:text-xs font-semibold text-[#D4A75F] uppercase tracking-wider">
          {(() => {
            const catKey = `common.${product.category?.toLowerCase()}`;
            const trans = t(catKey);
            return trans === catKey ? product.category : trans;
          })()}
        </span>

        {/* Product Title */}
        <Link to={`/product/${product._id}`} className="block mt-0.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#3F1D5A] dark:group-hover:text-[#D4A75F] transition-colors line-clamp-1">
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
          <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
            {product.review_count !== undefined ? product.review_count : (product.reviews ? product.reviews.length : 0)} {t('product_details.reviews') || 'reviews'}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-grow">
          {localize(product, 'description')}
        </p>

        {/* Price Row */}
        <div className="flex items-baseline space-x-1.5 mb-1">
          <span className="text-lg sm:text-xl font-extrabold text-[#3F1D5A] dark:text-[#EFE7DB]">
            ₹{discountedPrice}
          </span>
          {product.discount > 0 && (
            <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
              ₹{product.price}
            </span>
          )}
        </div>

        {/* Admin Action Button */}
        {isAdmin && (
          <div className="mt-auto pt-3">
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
              className="w-full py-2 px-3 bg-slate-100 hover:bg-[#D4A75F] hover:text-white dark:bg-slate-700/50 dark:hover:bg-[#D4A75F] text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs tracking-wide transition-all text-center block border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
            >
              🛠️ {t('navbar.admin_panel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Premium Shimmer Skeleton Loader for Product Cards
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex flex-col h-full space-y-4">
      {/* Image skeleton */}
      <div className="skeleton-premium aspect-video w-full rounded-xl" />
      
      {/* Category skeleton */}
      <div className="skeleton-premium h-3 w-1/4 rounded" />
      
      {/* Title skeleton */}
      <div className="skeleton-premium h-5 w-3/4 rounded" />
      
      {/* Rating & Stock skeleton */}
      <div className="flex space-x-2">
        <div className="skeleton-premium h-4 w-10 rounded" />
        <div className="skeleton-premium h-4 w-14 rounded" />
      </div>
      
      {/* Description skeleton */}
      <div className="space-y-2 flex-grow">
        <div className="skeleton-premium h-3 w-full rounded" />
        <div className="skeleton-premium h-3 w-5/6 rounded" />
      </div>
      
      {/* Price skeleton */}
      <div className="skeleton-premium h-6 w-1/3 rounded" />
    </div>
  );
};
