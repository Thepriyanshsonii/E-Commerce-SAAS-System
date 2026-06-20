import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import app
from backend.extensions import db

def run_updates():
    with app.app_context():
        # Execute ALTER TABLE queries to add columns if not exist
        try:
            db.session.execute(db.text("ALTER TABLE delivery_addresses ADD COLUMN alternate_mobile_number VARCHAR(15) DEFAULT NULL"))
            db.session.commit()
            print("Successfully added alternate_mobile_number column to delivery_addresses.")
        except Exception as e:
            db.session.rollback()
            print("alternate_mobile_number column might already exist or failed:", e)

        try:
            db.session.execute(db.text("ALTER TABLE products ADD COLUMN created_by VARCHAR(255) DEFAULT 'admin'"))
            db.session.commit()
            print("Successfully added created_by column to products.")
        except Exception as e:
            db.session.rollback()
            print("created_by column might already exist or failed:", e)

        try:
            db.session.execute(db.text("ALTER TABLE products ADD COLUMN modified_by VARCHAR(255) DEFAULT 'admin'"))
            db.session.commit()
            print("Successfully added modified_by column to products.")
        except Exception as e:
            db.session.rollback()
            print("modified_by column might already exist or failed:", e)

        try:
            db.session.execute(db.text("ALTER TABLE products ADD COLUMN show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE"))
            db.session.commit()
            print("Successfully added show_on_homepage column to products.")
        except Exception as e:
            db.session.rollback()
            print("show_on_homepage column might already exist or failed:", e)

        try:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN last_login DATETIME DEFAULT NULL"))
            db.session.commit()
            print("Successfully added last_login column to users.")
        except Exception as e:
            db.session.rollback()
            print("last_login column might already exist or failed:", e)

        try:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'"))
            db.session.commit()
            print("Successfully added preferred_language column to users.")
        except Exception as e:
            db.session.rollback()
            print("preferred_language column might already exist or failed:", e)

        try:
            db.session.execute(db.text("ALTER TABLE users ADD COLUMN first_login BOOLEAN DEFAULT TRUE"))
            db.session.commit()
            print("Successfully added first_login column to users.")
        except Exception as e:
            db.session.rollback()
            print("first_login column might already exist or failed:", e)

        # Import all models to ensure they are registered with SQLAlchemy metadata
        from backend.models.product import ProductModel, ProductImageModel, StockHistoryModel, ProductAuditLogModel, ProductVariantModel, BuyRequestModel
        from backend.models.user import UserModel, DeliveryAddress, UserStatusAuditLog
        from backend.models.category import Category
        from backend.models.order import OrderModel, OrderItem, Transaction
        from backend.models.review import ReviewModel
        from backend.models.support import SupportModel, FAQModel, SupportLinkModel
        from backend.models.admin import AdminModel, AdminAuditLog, AdminNotification
        from backend.models.coupon import CouponModel
        from backend.models.otp_verification import OTPVerification
        from backend.models.banner import BannerModel
        from backend.models.notification import NotificationModel

        # Create all tables (will create product_audit_logs, user_status_audit_logs)
        db.create_all()
        print("db.create_all() executed successfully.")

if __name__ == '__main__':
    run_updates()

