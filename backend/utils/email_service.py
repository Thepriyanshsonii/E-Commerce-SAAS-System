import os
from dotenv import load_dotenv
from flask import current_app
from flask_mail import Message
from backend.extensions import mail

load_dotenv()

class EmailDeliveryStatus(dict):
    def __bool__(self):
        return bool(self.get("success", False))

def send_email(to_email, subject, body, is_html=False):
    """
    Sends an email using standard smtplib with connection timeout and logging.
    Returns an EmailDeliveryStatus instance containing success status, configuration details, and errors.
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    server = None
    port = None
    username = None
    password = None
    config_info = {}
    
    try:
        # Check if configuration exists
        server = current_app.config.get("MAIL_SERVER")
        port = current_app.config.get("MAIL_PORT")
        username = current_app.config.get("MAIL_USERNAME")
        password = current_app.config.get("MAIL_PASSWORD")
        use_tls = current_app.config.get("MAIL_USE_TLS")
        use_ssl = current_app.config.get("MAIL_USE_SSL")
        default_sender = current_app.config.get("MAIL_DEFAULT_SENDER")
        
        config_info = {
            "smtp_host": server,
            "smtp_port": port,
            "smtp_user": username,
            "gmail_mode": bool(server and "gmail" in server.lower())
        }

        if not (server and port and username and password):
            err_msg = "SMTP configuration is incomplete. Please specify EMAIL_ADDRESS and EMAIL_APP_PASSWORD in .env."
            print(f"[SMTP ERROR] {err_msg}")
            return EmailDeliveryStatus({
                "success": False,
                "status": "failed",
                "configuration": config_info,
                "error": err_msg
            })
            
        # Formulate Message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = default_sender
        msg["To"] = to_email
        
        if is_html or "<html>" in body:
            part = MIMEText(body, "html", "utf-8")
        else:
            part = MIMEText(body, "plain", "utf-8")
        msg.attach(part)
        
        # Connect to SMTP server with a strict timeout of 8 seconds
        import socket
        print(f"[SMTP RESOLVE] Resolving {server} to IPv4 address...")
        try:
            addr_info = socket.getaddrinfo(server, port, family=socket.AF_INET, type=socket.SOCK_STREAM)
            resolved_ip = addr_info[0][4][0]
            print(f"[SMTP RESOLVE] Resolved {server} to IPv4: {resolved_ip}")
        except Exception as resolve_err:
            print(f"[SMTP RESOLVE ERROR] Failed to resolve to IPv4: {resolve_err}. Falling back to default hostname.")
            resolved_ip = server

        print(f"[SMTP CONNECT] Connecting to {resolved_ip}:{port} (Host={server}, SSL={use_ssl}, TLS={use_tls}, Timeout=8s)...")
        if use_ssl:
            smtp_conn = smtplib.SMTP_SSL(resolved_ip, port, timeout=8, server_hostname=server)
        else:
            smtp_conn = smtplib.SMTP(resolved_ip, port, timeout=8)
            
        try:
            if not use_ssl and use_tls:
                print("[SMTP STARTTLS] Sending EHLO and STARTTLS...")
                smtp_conn.ehlo()
                smtp_conn.starttls(server_hostname=server)
                smtp_conn.ehlo()
                
            print(f"[SMTP AUTH] Logging in as {username}...")
            smtp_conn.login(username, password)
            
            print(f"[SMTP SEND] Sending email to {to_email}...")
            smtp_conn.sendmail(default_sender, [to_email], msg.as_string())
            smtp_conn.quit()
            
            print(f"Email successfully sent via smtplib to {to_email}")
            return EmailDeliveryStatus({
                "success": True,
                "status": "delivered",
                "configuration": config_info,
                "error": None
            })
        except Exception as conn_err:
            try:
                smtp_conn.close()
            except Exception:
                pass
            raise conn_err
            
    except Exception as e:
        import traceback
        error_msg = f"SMTP Transmission Failure: {str(e)}"
        print(f"[SMTP SEND ERROR] Failed to send email to {to_email}")
        print(f"[SMTP SEND ERROR] Exception type: {type(e).__name__}")
        print(f"[SMTP SEND ERROR] Exception message: {str(e)}")
        print(f"[SMTP SEND ERROR] Config: {config_info}")
        traceback.print_exc()
        
        return EmailDeliveryStatus({
            "success": False,
            "status": "failed",
            "configuration": config_info,
            "error": error_msg
        })

def send_order_confirmation(email, order):
    """
    Formulate order confirmation email template.
    """
    items_html = ""
    for item in order.get("items", []):
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">{item.get('name')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">{item.get('quantity')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹{item.get('price')}</td>
        </tr>
        """
        
    body_html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">BharatBasket Order Confirmed!</h2>
                <p>Hello,</p>
                <p>Thank you for shopping with BharatBasket! Your order has been placed successfully.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0;"><strong>Order ID:</strong> {order.get('order_id')}</p>
                    <p style="margin: 0;"><strong>Estimated Delivery:</strong> {order.get('delivery_date')}</p>
                    <p style="margin: 0;"><strong>Total Amount Paid:</strong> ₹{order.get('total_amount')}</p>
                </div>
                <h3>Order Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>
                <h3 style="margin-top: 20px;">Shipping Address</h3>
                <p style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 0;">
                    <strong>{order.get('shipping_address', {}).get('name')}</strong><br>
                    Phone: {order.get('shipping_address', {}).get('phone') or order.get('shipping_address', {}).get('mobile', '')}<br>
                    {order.get('shipping_address', {}).get('address') or order.get('shipping_address', {}).get('street', '')}<br>
                    {order.get('shipping_address', {}).get('city')}, {order.get('shipping_address', {}).get('state')} - {order.get('shipping_address', {}).get('pincode')}
                </p>
                <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                    If you have any questions, contact our support team. This is an automated email, please do not reply.
                </p>
            </div>
        </body>
    </html>
    """
    subject = f"Your BharatBasket Order {order.get('order_id')} is confirmed!"
    return send_email(email, subject, body_html, is_html=True)
