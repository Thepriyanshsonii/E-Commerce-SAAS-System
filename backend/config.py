import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("JWT_SECRET", "supersecret_SSJewellery_key_123")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URI", "mysql+pymysql://root:irshad%40786@localhost/SSJewellery")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get("SQLALCHEMY_ECHO", "False").lower() in ("true", "1", "yes")
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 5,
        "max_overflow": 10,
        "connect_args": {
            "sslmode": "require"
        } if "neon" in os.environ.get("DATABASE_URI", "") else {}
    }

    # CORS / Frontend
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

    # Flask-Mail Configuration
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "False").lower() in ("true", "1", "yes")
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME") or os.environ.get("EMAIL_ADDRESS")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD") or os.environ.get("EMAIL_APP_PASSWORD")
    
    # Calculate MAIL_DEFAULT_SENDER
    _default_user = os.environ.get("MAIL_USERNAME") or os.environ.get("EMAIL_ADDRESS")
    MAIL_DEFAULT_SENDER = os.environ.get("SMTP_FROM") or (f"SSJewellery <{_default_user}>" if _default_user else "SSJewellery <no-reply@SSJewellery.com>")
