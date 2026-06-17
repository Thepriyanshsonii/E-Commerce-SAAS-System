import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load configuration first
load_dotenv()

# Global safe print patch to prevent OSError [Errno 5] Input/output error
# when running in background with closed standard streams
import builtins
import sys
_original_print = builtins.print
def safe_print(*args, **kwargs):
    try:
        _original_print(*args, **kwargs)
    except Exception:
        try:
            sys.stderr.write(" ".join(map(str, args)) + "\n")
            sys.stderr.flush()
        except Exception:
            pass
builtins.print = safe_print

from backend.extensions import db, migrate, mail
from backend.config import Config
from backend.routes.auth import auth_bp
from backend.routes.products import products_bp
from backend.routes.orders import orders_bp
from backend.routes.admin import admin_bp
from backend.routes.support import support_bp
from backend.routes.coupons import coupons_bp
from backend.routes.banners import banners_bp

app = Flask(__name__)
# Load configuration
app.config.from_object(Config)

# Enable CORS for frontend requests
CORS(
    app,
    origins=[
        "https://hexmap.in",
        "https://www.hexmap.in"
    ],
    supports_credentials=True
)

# Initialize extensions
db.init_app(app)
migrate.init_app(app, db)
mail.init_app(app)

# Register API blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(support_bp, url_prefix='/api/support')
app.register_blueprint(coupons_bp, url_prefix='/api/coupons')
app.register_blueprint(banners_bp, url_prefix='/api/banners')

from flask import request
from backend.utils.helpers import generate_otp, verify_otp, is_valid_email
from backend.models.user import UserModel

@app.route('/api/send-otp', methods=['POST'])
def root_send_otp():
    data = request.get_json() or {}
    identifier = data.get("identifier") or data.get("mobile") or data.get("email")
    if not identifier:
        return jsonify({"message": "Please provide identifier, mobile, or email.", "success": False}), 400
        
    otp = generate_otp(identifier)
    
    # Placeholder for MSG91 / real SMS service integration
    # When switching to production later, replace this print/email flow with actual MSG91 SDK call
    print(f"\n[PRODUCTION PLACEMENT] Future MSG91 would send OTP {otp} to {identifier}\n")
    
    # If it is email, we can also email it (as in auth/send-otp)
    if is_valid_email(identifier):
        try:
            from backend.utils.email_service import send_email
            subject = "Your BharatBasket Verification Code"
            body_html = f"""
            <html>
                <body>
                    <h2>Verification Code</h2>
                    <p>Hello,</p>
                    <p>Your OTP verification code for BharatBasket is: <strong>{otp}</strong></p>
                    <p>This code will expire in 5 minutes.</p>
                    <p>Thank you for shopping with us!</p>
                </body>
            </html>
            """
            send_email(identifier, subject, body_html)
        except Exception as e:
            print("Failed to send email OTP:", e)
            
    response_data = {
        "message": "OTP sent successfully! Please check your console or email.",
        "success": True
    }
    if os.getenv("OTP_MODE", "development").lower() == "development":
        response_data["otp_debug"] = otp
    return jsonify(response_data), 200

@app.route('/api/verify-otp', methods=['POST'])
def root_verify_otp():
    data = request.get_json() or {}
    identifier = data.get("identifier") or data.get("mobile") or data.get("email")
    otp = data.get("otp")
    
    if not identifier or not otp:
        return jsonify({"message": "Please provide both identifier/mobile/email and OTP.", "success": False}), 400
        
    success = verify_otp(identifier, otp)
    if not success:
        return jsonify({"message": "Invalid or expired OTP. Please try again.", "success": False}), 400
        
    # Mark user as verified if they exist
    user = UserModel.query.filter((UserModel.mobile == identifier) | (UserModel.email == identifier)).first()
    if user:
        try:
            user.is_verified = True
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print("Failed to update user is_verified status:", e)
            
    return jsonify({
        "message": "OTP verified successfully!",
        "success": True
    }), 200

# ------- Temporary Diagnostic Endpoint -------
# REMOVE THIS ENDPOINT after confirming email works on Render
@app.route('/api/debug/email-test', methods=['POST'])
def debug_email_test():
    """
    Temporary diagnostic endpoint to test SMTP connectivity on Render.
    Send POST with {"email": "test@example.com"} to verify email sending.
    REMOVE THIS ENDPOINT IN PRODUCTION after confirming it works.
    """
    data = request.get_json() or {}
    test_email = data.get("email")
    
    if not test_email:
        return jsonify({"message": "Please provide 'email' in the request body.", "success": False}), 400
    
    # Gather config info for diagnostics
    config_info = {
        "MAIL_SERVER": app.config.get("MAIL_SERVER"),
        "MAIL_PORT": app.config.get("MAIL_PORT"),
        "MAIL_USE_TLS": app.config.get("MAIL_USE_TLS"),
        "MAIL_USE_SSL": app.config.get("MAIL_USE_SSL"),
        "MAIL_USERNAME": app.config.get("MAIL_USERNAME"),
        "MAIL_PASSWORD_SET": bool(app.config.get("MAIL_PASSWORD")),
        "MAIL_DEFAULT_SENDER": app.config.get("MAIL_DEFAULT_SENDER"),
        "OTP_MODE": os.getenv("OTP_MODE", "not set"),
        "FRONTEND_URL": os.getenv("FRONTEND_URL", "not set"),
    }
    
    print(f"[EMAIL DEBUG] Testing email to {test_email} with config: {config_info}")
    
    try:
        from backend.utils.email_service import send_email
        result = send_email(
            test_email,
            "BharatBasket Email Test",
            "<html><body><h2>Email Test Successful!</h2><p>If you see this, SMTP is working correctly on Render.</p></body></html>",
            is_html=True
        )
        print(f"[EMAIL DEBUG] Result: {dict(result)}")
        return jsonify({
            "message": "Email test completed.",
            "success": bool(result),
            "smtp_result": dict(result),
            "config_loaded": config_info
        }), 200 if result else 500
    except Exception as e:
        print(f"[EMAIL DEBUG] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "message": f"Email test failed with exception: {str(e)}",
            "success": False,
            "config_loaded": config_info
        }), 500
# ------- End Diagnostic Endpoint -------

# Ensure static upload directory is served
@app.route('/static/uploads/<path:filename>')
def serve_uploads(filename):
    upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    from flask import send_from_directory
    return send_from_directory(upload_dir, filename)

@app.errorhandler(404)
def not_found(error):
    return jsonify({"message": "API endpoint not found!"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"message": f"Internal server error: {str(error)}"}), 500

def seed_database():
    """
    Seeds initial products and coupons if they are empty in the database.
    """
    from backend.models.product import ProductModel
    from backend.models.coupon import CouponModel
    
    try:
        if ProductModel.query.count() == 0:
            print("[SEED] Seeding default products into MySQL...")
            default_products = [
                {
                    "name": "Noise-Cancelling Wireless Headphones",
                    "price": 2999.00,
                    "discount": 15.0,
                    "description": "Experience premium sound with active noise-cancellation and a 30-hour playback battery life. Perfect for focus and long travel.",
                    "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60"],
                    "stock": 25,
                    "category": "Electronics",
                    "ratings": 4.5
                },
                {
                    "name": "Classic Leather Men's Wallet",
                    "price": 899.00,
                    "discount": 10.0,
                    "description": "Handcrafted genuine leather bifold wallet with RFID protection. Includes 6 card slots, 2 cash compartments, and a secure coin pocket.",
                    "images": ["https://images.unsplash.com/photo-1627124424074-7e2382e9bad4?w=800&auto=format&fit=crop&q=60"],
                    "stock": 50,
                    "category": "Fashion",
                    "ratings": 4.2
                },
                {
                    "name": "Premium Organic Matcha Green Tea",
                    "price": 499.00,
                    "discount": 5.0,
                    "description": "100% stone-ground Japanese matcha tea. Rich in antioxidants, enhances energy levels, and boosts mental concentration.",
                    "images": ["https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=60"],
                    "stock": 100,
                    "category": "Grocery",
                    "ratings": 4.8
                },
                {
                    "name": "RGB Mechanical Gaming Keyboard",
                    "price": 4499.00,
                    "discount": 20.0,
                    "description": "Tactile click blue switches mechanical keyboard with customized RGB backlighting patterns, multimedia hotkeys, and anti-ghosting technology.",
                    "images": ["https://images.unsplash.com/photo-1618384887929-16ec33faf9c1?w=800&auto=format&fit=crop&q=60"],
                    "stock": 15,
                    "category": "Electronics",
                    "ratings": 4.6
                },
                {
                    "name": "Breathable Lightweight Sports Shoes",
                    "price": 2499.00,
                    "discount": 25.0,
                    "description": "Ergonomically designed mesh sports sneakers. Extra-grip sole for running, walking, and high-intensity workout routines.",
                    "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60"],
                    "stock": 30,
                    "category": "Fashion",
                    "ratings": 4.4
                },
                {
                    "name": "Python Coding & Algorithms Bible",
                    "price": 699.00,
                    "discount": 12.0,
                    "description": "A beginner to advanced guide to Python programming, clean code guidelines, and core data structure implementations.",
                    "images": ["https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60"],
                    "stock": 40,
                    "category": "Books",
                    "ratings": 4.9
                }
            ]
            for p in default_products:
                ProductModel.create_product(p)
            print("[SEED] Successfully seeded products.")
        else:
            print("[SEED] Products already exist. Skipping seed.")
            
        if CouponModel.query.count() == 0:
            print("[SEED] Seeding default coupons into MySQL...")
            default_coupons = [
                {
                    "code": "WELCOME10",
                    "discount_type": "percent",
                    "discount_value": 10.0,
                    "min_order_amount": 500.0,
                    "is_active": True
                },
                {
                    "code": "FLAT200",
                    "discount_type": "flat",
                    "discount_value": 200.0,
                    "min_order_amount": 1500.0,
                    "is_active": True
                },
                {
                    "code": "BASKET50",
                    "discount_type": "percent",
                    "discount_value": 50.0,
                    "min_order_amount": 5000.0,
                    "is_active": True
                }
            ]
            for c in default_coupons:
                CouponModel.create_coupon(
                    code=c["code"],
                    discount_type=c["discount_type"],
                    discount_value=c["discount_value"],
                    min_order_amount=c["min_order_amount"],
                    is_active=c["is_active"]
                )
            print("[SEED] Successfully seeded coupons.")
        else:
            print("[SEED] Coupons already exist. Skipping seed.")
            
        # Seed default banners if empty
        from backend.models.banner import BannerModel
        if BannerModel.query.count() == 0:
            print("[SEED] Seeding default banners into MySQL...")
            default_banners = [
                {
                    "title": "BharatBasket Big Savings Day",
                    "subtitle": "Experience Premium Audio Gear",
                    "description": "Get flat 15% off on Active Noise-Cancelling Wireless Headphones. Limited stock, buy yours now!",
                    "button_text": "Shop Electronics",
                    "button_link": "/?category=Electronics",
                    "image_url": "",
                    "background_style": "from-slate-900 via-indigo-950 to-slate-900",
                    "category": "Electronics",
                    "display_order": 1,
                    "is_active": True
                },
                {
                    "title": "Organic Fresh Groceries",
                    "subtitle": "Eat Healthy, Feel Awesome",
                    "description": "Pure stone-ground Matchas, herbal teas, and healthy supplements. Straight from nature to your basket.",
                    "button_text": "Shop Groceries",
                    "button_link": "/?category=Grocery",
                    "image_url": "",
                    "background_style": "from-slate-900 via-emerald-950 to-slate-900",
                    "category": "Grocery",
                    "display_order": 2,
                    "is_active": True
                },
                {
                    "title": "Style Meets Comfort",
                    "subtitle": "Monsoon Fashion Wardrobe",
                    "description": "Premium sports sneakers, athletic wear, and handcrafted leather accessories at best prices.",
                    "button_text": "Explore Wardrobe",
                    "button_link": "/?category=Fashion",
                    "image_url": "",
                    "background_style": "from-slate-900 via-rose-950 to-slate-900",
                    "category": "Fashion",
                    "display_order": 3,
                    "is_active": True
                }
            ]
            for b_data in default_banners:
                b = BannerModel(
                    title=b_data["title"],
                    subtitle=b_data["subtitle"],
                    description=b_data["description"],
                    button_text=b_data["button_text"],
                    button_link=b_data["button_link"],
                    image_url=b_data["image_url"],
                    background_style=b_data["background_style"],
                    category=b_data["category"],
                    display_order=b_data["display_order"],
                    is_active=b_data["is_active"]
                )
                db.session.add(b)
            db.session.commit()
            print("[SEED] Successfully seeded banners.")
        else:
            print("[SEED] Banners already exist. Skipping seed.")
    except Exception as e:
        print("[SEED] Error seeding database:", e)

# Run initialization inside app context if db tables are initialized
# Run initialization inside app context if db tables are initialized
with app.app_context():
    db.create_all()
    seed_database()

    try:
        from backend.utils.report_automation import start_report_scheduler
        start_report_scheduler(app)
    except Exception as err:
        print("[APP] Scheduler will start after DB is ready:", err)

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
