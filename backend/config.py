import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("JWT_SECRET", "supersecret_bharatbasket_key_123")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URI", "mysql+pymysql://root:irshad%40786@localhost/bharatbasket")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get("SQLALCHEMY_ECHO", "False").lower() in ("true", "1", "yes")
    SQLALCHEMY_ENGINE_OPTIONS = {
        # "connect_args": {
        #     "init_command": "SET time_zone='Asia/Kolkata'"
        # }
    }

    # Flask-Mail Configuration
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "False").lower() in ("true", "1", "yes")
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME") or os.environ.get("EMAIL_ADDRESS")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD") or os.environ.get("EMAIL_APP_PASSWORD")
    
    # Calculate MAIL_DEFAULT_SENDER
    _default_user = os.environ.get("MAIL_USERNAME") or os.environ.get("EMAIL_ADDRESS")
    MAIL_DEFAULT_SENDER = os.environ.get("SMTP_FROM") or (f"BharatBasket <{_default_user}>" if _default_user else "BharatBasket <no-reply@bharatbasket.com>")

    # Log mail config at startup for debugging (password is masked)
    print(f"[MAIL CONFIG] Server={MAIL_SERVER}, Port={MAIL_PORT}, TLS={MAIL_USE_TLS}, SSL={MAIL_USE_SSL}")
    print(f"[MAIL CONFIG] Username={MAIL_USERNAME}, Sender={MAIL_DEFAULT_SENDER}")
    print(f"[MAIL CONFIG] Password={'****' + MAIL_PASSWORD[-4:] if MAIL_PASSWORD and len(MAIL_PASSWORD) >= 4 else ('SET' if MAIL_PASSWORD else 'NOT SET')}")

