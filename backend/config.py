import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("JWT_SECRET", "supersecret_SSJewellery_key_123")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URI", "sqlite:///:memory:")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get("SQLALCHEMY_ECHO", "False").lower() in ("true", "1", "yes")
    
    # Configure engine options for pool management and SSL termination
    _db_uri = os.environ.get("DATABASE_URI", "sqlite:///:memory:")
    _connect_args = {}
    if "postgres" in _db_uri or "neon" in _db_uri:
        _connect_args["sslmode"] = "require"
        
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": int(os.environ.get("DB_POOL_RECYCLE", 300)),
        "connect_args": _connect_args
    }
    if not _db_uri.startswith("sqlite"):
        SQLALCHEMY_ENGINE_OPTIONS["pool_size"] = int(os.environ.get("DB_POOL_SIZE", 5))
        SQLALCHEMY_ENGINE_OPTIONS["max_overflow"] = int(os.environ.get("DB_MAX_OVERFLOW", 10))

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
