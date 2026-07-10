import logging
import uuid
from typing import Optional

logger = logging.getLogger(__name__)

class EmailService:
    """
    Service for sending emails.
    Currently uses a mock implementation that logs to console.
    Can be swapped out with a real SMTP/SendGrid implementation in Phase 4.
    """
    
    @staticmethod
    async def send_email(to_email: str, subject: str, body: str, html_body: Optional[str] = None):
        """
        Send an email to the specified address.
        """
        # Mock implementation: log email details
        logger.info(f"========== MOCK EMAIL SENT ==========")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body:\n{body}")
        if html_body:
            logger.info(f"HTML Body:\n{html_body}")
        logger.info(f"=====================================")
        return True

    @staticmethod
    async def send_otp_email(to_email: str, otp_code: str):
        subject = "Your Verification Code"
        body = f"Your one-time verification code is: {otp_code}\nThis code will expire in 10 minutes."
        return await EmailService.send_email(to_email, subject, body)

    @staticmethod
    async def send_password_reset_email(to_email: str, reset_token: str):
        subject = "Password Reset Request"
        # Assuming frontend runs on localhost:5173 for development
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        body = f"You requested a password reset. Click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email."
        return await EmailService.send_email(to_email, subject, body)
        
    @staticmethod
    async def send_invite_email(to_email: str, role: str):
        subject = "You've been invited to Enterprise Knowledge Assistant"
        body = f"You have been invited to join the platform as a {role}.\nPlease contact your administrator to set up your account."
        return await EmailService.send_email(to_email, subject, body)

email_service = EmailService()
