# Email Alert System Setup Guide 📧

This guide will help you configure email alerts for your Water Management System.

## Prerequisites

- Node.js and npm installed
- A valid email account (Gmail, Outlook, Yahoo, etc.)
- Access to your email account settings

## Quick Setup

### 1. Configure Environment Variables

Edit the `backend/.env` file with your email credentials:

```env
# Email Configuration for Alert Notifications
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ALERT_EMAIL=admin@yourdomain.com

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/watermanagement
PORT=5000
NODE_ENV=development
```

### 2. Gmail Setup (Most Common)

For Gmail accounts, you need to generate an App Password:

1. **Enable 2-Factor Authentication**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → Turn on

2. **Generate App Password**:
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update .env file**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=abcd-efgh-ijkl-mnop  # Your 16-char app password
   ALERT_EMAIL=alerts@yourdomain.com
   ```

### 3. Other Email Providers

#### Outlook/Hotmail:
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo:
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### Custom SMTP:
```env
EMAIL_SERVICE=smtp
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
# Additional config may be needed in emailService.js
```

## Testing the Email System

### Method 1: Web Browser Test

1. Start your server:
   ```bash
   cd backend
   npm start
   ```

2. Open browser and visit:
   ```
   http://localhost:5000/api/test-email
   ```

3. Check the response and your email inbox.

### Method 2: Command Line Test

Run the test script:
```bash
cd backend
node test-email.js
```

### Method 3: Manual Alert Test

Send test sensor data that triggers alerts:
```bash
curl -X POST http://localhost:5000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "esp32",
    "tds_ppm": 650,
    "turbidity": 10,
    "flow_lpm": 5,
    "temperature_c": 25
  }'
```

## Alert Triggers

The system automatically sends email alerts when:

- **TDS > 600 ppm**: High total dissolved solids (water contamination)
- **Turbidity > 50 NTU**: Cloudy water (potential contamination)
- **Flow Rate > 20 L/min**: Possible water leak
- **Temperature > 35°C or < 10°C**: Abnormal water temperature

## Email Template

Alerts are sent as professional HTML emails containing:

- Alert severity (HIGH, MEDIUM, LOW)
- Alert type (WATER_QUALITY, POTENTIAL_LEAK, TEMPERATURE)
- Detailed message and sensor readings
- Device ID and timestamp
- Formatted data for easy reading

## Troubleshooting

### Common Issues:

1. **"Email service not configured"**
   - Check that EMAIL_USER and EMAIL_PASS are set in .env
   - Ensure the .env file is in the backend folder

2. **"Authentication failed"**
   - For Gmail: Use App Password instead of regular password
   - Check if 2FA is enabled and App Password is correct

3. **"Invalid login"**
   - Verify EMAIL_USER is your full email address
   - Check EMAIL_SERVICE matches your provider

4. **Emails not received**
   - Check spam/junk folder
   - Verify ALERT_EMAIL is a valid email address
   - Test with the `/api/test-email` endpoint first

### Debug Mode

Enable detailed logging by adding to your .env:
```env
DEBUG=emailService
```

### Server Logs

Check server console for email-related messages:
- `✅ Email service configured successfully`
- `📧 Alert email sent to [recipient]`
- `❌ Error sending alert email: [error]`

## Security Notes

- Never commit the .env file to version control
- Use App Passwords for Gmail instead of main password
- Consider using dedicated alert email addresses
- Regularly rotate passwords and app passwords

## Advanced Configuration

For custom email templates, edit `backend/emailService.js`:

- Modify `getDefaultAlertTemplate()` for custom HTML
- Update `replacePlaceholders()` for custom variables
- Add new email types in `loadTemplates()`

## Support

If you encounter issues:

1. Test with the `/api/test-email` endpoint
2. Check server logs for error messages
3. Verify all environment variables are set correctly
4. Ensure your email provider allows SMTP access

The email system is now fully integrated with your water monitoring alerts! 🚨💧
