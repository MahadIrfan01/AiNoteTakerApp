# Email Confirmation Fix Guide

## Problem
After registering, you see "Please check your email to verify your account" but no email arrives.

## Why This Happens
Supabase has email confirmation enabled by default, but in development:
- Supabase's default email service has strict rate limits
- Emails may go to spam
- No custom SMTP is configured

## Quick Fix (Recommended for Development)

### Disable Email Confirmation

1. Open your Supabase Dashboard
2. Go to **Authentication** → **Providers**
3. Click on **Email** provider
4. Find the **"Confirm email"** toggle
5. **Turn it OFF**
6. Click **Save**

Now users can register and login immediately without email verification!

## Alternative: Configure Email Delivery (For Production)

If you want email confirmation to work properly:

### Option 1: Use Supabase's Email Service (Limited)
- Free tier has rate limits
- Emails may go to spam
- Good for testing only

### Option 2: Configure Custom SMTP (Recommended)

1. Go to **Project Settings** → **Auth** in Supabase Dashboard
2. Scroll to **SMTP Settings**
3. Enable custom SMTP
4. Configure with your email provider:

#### Using Gmail:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: your-app-password (not regular password!)
Sender Email: your-email@gmail.com
Sender Name: NoteAI
```

**Note**: For Gmail, you need to create an "App Password":
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new password
4. Use that password in SMTP settings

#### Using SendGrid (Recommended for Production):
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: your-sendgrid-api-key
Sender Email: verified-email@yourdomain.com
Sender Name: NoteAI
```

#### Using Mailgun:
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: your-mailgun-smtp-username
SMTP Password: your-mailgun-smtp-password
Sender Email: verified-email@yourdomain.com
Sender Name: NoteAI
```

## Testing Email Delivery

After configuring SMTP:

1. Go to **Authentication** → **Email Templates** in Supabase
2. Click **"Send test email"** on the Confirm signup template
3. Enter your email and send
4. Check if you receive it (check spam folder too)

## Email Templates

You can customize the email templates:

1. Go to **Authentication** → **Email Templates**
2. Edit these templates:
   - **Confirm signup**: Sent when user registers
   - **Magic Link**: For passwordless login
   - **Change Email Address**: When user changes email
   - **Reset Password**: For password reset

## Troubleshooting

### Still not receiving emails?

1. **Check Supabase Logs**:
   - Go to **Logs** → **Auth Logs** in Supabase Dashboard
   - Look for email sending errors

2. **Check Spam Folder**:
   - Emails often go to spam initially
   - Mark as "Not Spam" to whitelist

3. **Verify Email Address**:
   - Make sure you're using a valid, accessible email
   - Try a different email provider (Gmail, Outlook, etc.)

4. **Rate Limits**:
   - Supabase free tier has email rate limits
   - Wait a few minutes between attempts
   - Consider upgrading or using custom SMTP

5. **SMTP Configuration**:
   - Double-check all SMTP settings
   - Ensure sender email is verified with your provider
   - Test with the "Send test email" feature

## Current App Behavior

The app now handles both scenarios:

- **Email confirmation disabled**: Users can login immediately after registration
- **Email confirmation enabled**: Users see a message to check their email

## Recommended Setup

**For Development**:
- Disable email confirmation for faster testing
- Enable it later when ready for production

**For Production**:
- Enable email confirmation for security
- Configure custom SMTP with a reliable provider
- Use a verified domain email address
- Monitor email delivery in Supabase logs

## Additional Security

Once emails are working, consider:

1. **Email verification required**: Prevents fake accounts
2. **Password reset**: Requires email access
3. **Email change confirmation**: Requires both old and new email
4. **Rate limiting**: Prevents spam registrations

## Support

If issues persist:
1. Check Supabase status page
2. Review Supabase Auth documentation
3. Contact Supabase support
4. Check community forums

---

**Quick Start**: Just disable email confirmation in Supabase Dashboard for immediate testing!
