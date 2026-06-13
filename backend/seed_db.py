import os
import sys
import bcrypt
from datetime import datetime

# Set up project path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import app
from backend.extensions import db
from backend.models.user import UserModel, DeliveryAddress
from backend.models.product import ProductModel, CategoryAttributeModel
from backend.models.coupon import CouponModel
from backend.models.category import Category
from backend.models.order import OrderModel, OrderItem, Transaction
from backend.models.review import ReviewModel
from backend.models.support import SupportModel
from backend.models.otp_verification import OTPVerification
from backend.models.admin import AdminModel

def seed_database():
    print("Initiating BharatBasket Database Seeding (SQLAlchemy)...")
    
    with app.app_context():
        # Clear existing data in correct dependency order to avoid foreign key violations
        print("Clearing old records from tables...")
        try:
            db.session.query(CategoryAttributeModel).delete()
            db.session.query(OrderItem).delete()
            db.session.query(Transaction).delete()
            db.session.query(OrderModel).delete()
            db.session.query(ReviewModel).delete()
            db.session.query(SupportModel).delete()
            db.session.query(OTPVerification).delete()
            db.session.query(CouponModel).delete()
            db.session.query(ProductModel).delete()
            db.session.query(Category).delete()
            db.session.query(DeliveryAddress).delete()
            db.session.query(UserModel).delete()
            db.session.query(AdminModel).delete()
            db.session.commit()
            print("Successfully cleared all tables.")
        except Exception as e:
            print("Warning while clearing tables:", e)
            db.session.rollback()

        # 1. Seed Users and Admins
        print("Seeding Users and Admin accounts...")
        admin_email = "admin@bharatbasket.com"
        admin_pw_hash = bcrypt.hashpw("Admin@123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin_user = UserModel(
            name="Admin Dev",
            email=admin_email,
            password=admin_pw_hash,
            mobile="9876543210",
            is_admin=True,
            is_blocked=False,
            email_verified=True
        )
        db.session.add(admin_user)
        db.session.commit()
        
        # Seed DeliveryAddress for Admin
        admin_addr = DeliveryAddress(
            user_id=admin_user.id,
            street="100 Administrative Block",
            city="Bengaluru",
            state="Karnataka",
            pincode="560001"
        )
        db.session.add(admin_addr)
        db.session.commit()
        
        # Seed AdminModel table credentials
        admin_cred = AdminModel(
            username="admin",
            password="admin123"
        )
        db.session.add(admin_cred)
        db.session.commit()
        print(f"Created default Admin user: {admin_email} / Admin@123")

        cust_email = "customer@bharatbasket.com"
        cust_pw_hash = bcrypt.hashpw("Customer@123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cust_user = UserModel(
            name="Rahul Sharma",
            email=cust_email,
            password=cust_pw_hash,
            mobile="9123456789",
            is_admin=False,
            is_blocked=False,
            email_verified=True
        )
        db.session.add(cust_user)
        db.session.commit()
        
        cust_addr = DeliveryAddress(
            user_id=cust_user.id,
            street="45 Green Meadows Apartment",
            city="New Delhi",
            state="Delhi",
            pincode="110001"
        )
        db.session.add(cust_addr)
        db.session.commit()
        print(f"Created default Customer user: {cust_email} / Customer@123")

        # 2. Seed Products
        print("Seeding catalog products...")
        mock_products = [
            # Electronics Category
            {
                "name": "BharatPhone Pro X5",
                "category": "Electronics",
                "price": 54999.00,
                "discount": 10,
                "stock": 25,
                "description": "The ultimate Indian-engineered smartphone with a super AMOLED 120Hz display, triple 108MP camera array, and local language support options. Runs on a powerful octa-core chipset with massive battery backup.",
                "images": ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.5
            },
            {
                "name": "BharatAcoustics Wireless Buds",
                "category": "Electronics",
                "price": 2499.00,
                "discount": 20,
                "stock": 100,
                "description": "True wireless earbuds with hybrid Active Noise Cancellation (ANC), 30-hour combined playback battery life, and IPX7 sweat resistance. Super deep bass customized for classical and modern beats.",
                "images": ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.2
            },
            {
                "name": "VedicSmart LED 4K TV 55\"",
                "category": "Electronics",
                "price": 38999.00,
                "discount": 15,
                "stock": 12,
                "description": "Ultra high definition 4K Smart TV with Dolby Vision, integrated subwoofers, built-in Alexa/Google Assistant support, and access to all standard streaming apps pre-installed. Sleek frameless design.",
                "images": ["https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.3
            },
            # Grocery Category
            {
                "name": "Premium Organic Basmati Rice",
                "category": "Grocery",
                "price": 299.00,
                "discount": 5,
                "stock": 150,
                "description": "Traditionally harvested long-grain aromatic Basmati rice. Perfectly aged for premium flavor, ideal for biryanis, pulaos, and daily royal meals. 100% natural, pesticide-free packaging (5kg).",
                "images": ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.6
            },
            {
                "name": "Pure Cold Pressed Mustard Oil",
                "category": "Grocery",
                "price": 220.00,
                "discount": 0,
                "stock": 80,
                "description": "Traditional wood-pressed Kachi Ghani mustard oil containing natural pungency, rich taste, and essential nutrients. Ideal for deep frying, sautéing, and traditional pickle preservation.",
                "images": ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.1
            },
            {
                "name": "Assam CTC Masala Tea Blend",
                "category": "Grocery",
                "price": 350.00,
                "discount": 12,
                "stock": 200,
                "description": "Robust and strong Assam black CTC tea granules mixed with real crushed ginger, cardamom, cinnamon, cloves, and black pepper. The perfect morning cup of Indian Masala Chai.",
                "images": ["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.4
            },
            # Fashion Category
            {
                "name": "Handloom Banarasi Silk Saree",
                "category": "Fashion",
                "price": 8999.00,
                "discount": 25,
                "stock": 10,
                "description": "Exquisite hand-woven Banarasi silk saree adorned with intricate gold zari brocade work. Perfect for weddings, festivals, and grand occasions. Comes with unstitched blouse material.",
                "images": ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.8
            },
            {
                "name": "Classic Indigo Cotton Kurta Set",
                "category": "Fashion",
                "price": 1899.00,
                "discount": 15,
                "stock": 45,
                "description": "Comfortable regular-fit pure cotton Kurta for men in authentic handblock indigo print. Comes paired with premium white cotton pajamas. Breathable, durable, and stylish for semi-formal events.",
                "images": ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.2
            },
            {
                "name": "Embroidered Festive Juttis",
                "category": "Fashion",
                "price": 999.00,
                "discount": 10,
                "stock": 30,
                "description": "Authentic leather handcrafted Mojaris/Juttis with detailed colorful thread embroidery and beadwork. Features double cushioning for comfortable all-day festival wearing.",
                "images": ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.0
            },
            # Home Decor Category
            {
                "name": "Handcrafted Terracotta Diya Set",
                "category": "Home Decor",
                "price": 499.00,
                "discount": 5,
                "stock": 60,
                "description": "Pack of 12 beautifully hand-painted and decorated clay diyas by local potters. Perfect for festive celebrations like Diwali, poojas, or general terrace lighting.",
                "images": ["https://images.unsplash.com/photo-1605847429054-7a4f40f0970a?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.5
            },
            {
                "name": "Jaipur Cotton Block-Print Bedhseet",
                "category": "Home Decor",
                "price": 1499.00,
                "discount": 10,
                "stock": 40,
                "description": "Premium double king-size bedsheet woven from long-staple cotton fibers. Features traditional Sanganeri handblock motifs and includes 2 matching printed pillow covers.",
                "images": ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.3
            },
            {
                "name": "Handwoven Jute Floor Rug",
                "category": "Home Decor",
                "price": 2799.00,
                "discount": 18,
                "stock": 20,
                "description": "Natural biodegradable braided jute rug crafted by rural artisans. Adds a classic rustic, organic, and bohemian aesthetic to any living room, study, or bedroom floor.",
                "images": ["https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80"],
                "ratings": 4.4
            }
        ]
        
        for p in mock_products:
            ProductModel.create_product(p)
        print(f"Successfully seeded {len(mock_products)} premium catalog products!")

        # 3. Seed Coupons
        print("Seeding default coupons...")
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
        print("Successfully seeded coupons.")

        # 4. Seed Category Attributes
        print("Seeding category attributes...")
        category_attributes = [
            # Electronics
            {"category": "Electronics", "attribute": "Storage", "value": "64GB"},
            {"category": "Electronics", "attribute": "Storage", "value": "128GB"},
            {"category": "Electronics", "attribute": "Storage", "value": "256GB"},
            {"category": "Electronics", "attribute": "Storage", "value": "512GB"},
            {"category": "Electronics", "attribute": "RAM", "value": "4GB"},
            {"category": "Electronics", "attribute": "RAM", "value": "6GB"},
            {"category": "Electronics", "attribute": "RAM", "value": "8GB"},
            {"category": "Electronics", "attribute": "RAM", "value": "12GB"},
            {"category": "Electronics", "attribute": "Color", "value": "Black"},
            {"category": "Electronics", "attribute": "Color", "value": "Blue"},
            {"category": "Electronics", "attribute": "Color", "value": "Green"},
            {"category": "Electronics", "attribute": "Color", "value": "Silver"},

            # Fashion
            {"category": "Fashion", "attribute": "Size", "value": "XS"},
            {"category": "Fashion", "attribute": "Size", "value": "S"},
            {"category": "Fashion", "attribute": "Size", "value": "M"},
            {"category": "Fashion", "attribute": "Size", "value": "L"},
            {"category": "Fashion", "attribute": "Size", "value": "XL"},
            {"category": "Fashion", "attribute": "Size", "value": "XXL"},
            {"category": "Fashion", "attribute": "Color", "value": "Black"},
            {"category": "Fashion", "attribute": "Color", "value": "White"},
            {"category": "Fashion", "attribute": "Color", "value": "Blue"},
            {"category": "Fashion", "attribute": "Color", "value": "Red"},
            {"category": "Fashion", "attribute": "Material", "value": "Cotton"},
            {"category": "Fashion", "attribute": "Material", "value": "Denim"},
            {"category": "Fashion", "attribute": "Material", "value": "Polyester"},

            # Grocery
            {"category": "Grocery", "attribute": "Weight", "value": "250g"},
            {"category": "Grocery", "attribute": "Weight", "value": "500g"},
            {"category": "Grocery", "attribute": "Weight", "value": "1kg"},
            {"category": "Grocery", "attribute": "Weight", "value": "5kg"},
            {"category": "Grocery", "attribute": "Pack Size", "value": "Single Pack"},
            {"category": "Grocery", "attribute": "Pack Size", "value": "Pack of 2"},
            {"category": "Grocery", "attribute": "Pack Size", "value": "Pack of 5"},

            # Books
            {"category": "Books", "attribute": "Format", "value": "Paperback"},
            {"category": "Books", "attribute": "Format", "value": "Hardcover"},
            {"category": "Books", "attribute": "Format", "value": "Ebook"},
            {"category": "Books", "attribute": "Language", "value": "English"},
            {"category": "Books", "attribute": "Language", "value": "Hindi"},
            {"category": "Books", "attribute": "Edition", "value": "1st Edition"},
            {"category": "Books", "attribute": "Edition", "value": "2nd Edition"},
            {"category": "Books", "attribute": "Edition", "value": "3rd Edition"},
        ]
        for attr in category_attributes:
            cat = Category.query.filter_by(name=attr["category"]).first()
            new_attr = CategoryAttributeModel(
                category_id=cat.id if cat else None,
                category_name=attr["category"],
                attribute_name=attr["attribute"],
                attribute_value=attr["value"]
            )
            db.session.add(new_attr)
        db.session.commit()
        print("Successfully seeded category attributes.")
        print("Database seeding completed successfully.")

if __name__ == '__main__':
    seed_database()
