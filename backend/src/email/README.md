# Email Sending Configuration

This document explains how to configure the JCoder email sending system.

## Required Environment Variables

The system uses the following environment variables to configure the SMTP server:

### Required Variables

#### `SMTP_USER`
- **Description**: Sender email address (account that will send emails)
- **Example**: `your-email@gmail.com`
- **Usage**: Used for SMTP server authentication

#### `SMTP_PASS`
- **Description**: Password or authentication token for the email
- **Example**: `your-app-password` (for Gmail) or `your-normal-password` (for other providers)
- **Usage**: Used together with `SMTP_USER` for SMTP server authentication
- **⚠️ Important**: For Gmail, you need to use an **App Password**, not the normal account password

### Optional Variables (with default values)

#### `SMTP_HOST`
- **Description**: SMTP server address
- **Default**: `smtp.gmail.com` (if not specified)
- **Examples by provider**:
  - Gmail: `smtp.gmail.com`
  - Outlook/Hotmail: `smtp-mail.outlook.com`
  - Yahoo: `smtp.mail.yahoo.com`
  - SendGrid: `smtp.sendgrid.net`
  - Amazon SES: `email-smtp.us-east-1.amazonaws.com`

#### `SMTP_PORT`
- **Description**: SMTP server port
- **Default**: `587` (if not specified)
- **Common values**:
  - `587`: Default port for TLS/STARTTLS (recommended)
  - `465`: Port for SSL (requires `SMTP_SECURE=true`)
  - `25`: Unencrypted port (not recommended)

#### `SMTP_SECURE`
- **Description**: Defines whether the connection should use SSL/TLS
- **Default**: `false` (if not specified)
- **Values**:
  - `false`: Uses STARTTLS on port 587 (recommended)
  - `true`: Uses direct SSL on port 465
- **⚠️ Note**: If using port 465, set to `true`

#### `SMTP_FROM`
- **Description**: Email address that will appear as sender
- **Default**: Uses the value of `SMTP_USER` if not specified
- **Example**: `noreply@yourdomain.com`
- **Usage**: Appears in the "From:" field of sent emails

### Additional Variable (for email links)

#### `FRONTEND_BASE_URL`
- **Description**: Frontend base URL to generate links in emails
- **Example**: `http://localhost:3000` or `https://yourdomain.com`
- **Usage**: Used to create the "View Portfolio" link in notification emails

## Example .env File

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=your-email@gmail.com

# Frontend URL (for links in emails)
FRONTEND_BASE_URL=http://localhost:3000
```

## Required External Configurations

### For Gmail

Gmail requires special configurations for security reasons:

#### 1. Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"

#### 2. Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (custom name)"
3. Enter a name (e.g., "JCoder Backend")
4. Click "Generate"
5. **Copy the generated password** (16 characters without spaces)
6. Use this password in `SMTP_PASS`

**⚠️ Important**: 
- Do not use your normal Gmail password
- The app password is different from the account password
- Keep the app password secure

#### 3. Allow Less Secure Apps (NOT RECOMMENDED)
- This option has been discontinued by Google
- Always use App Passwords

### For Outlook/Hotmail

1. Use your normal Microsoft account password
2. You may need to enable "Less secure apps" in settings
3. Recommended configuration:
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

### For SendGrid

1. Create an account at [SendGrid](https://sendgrid.com/)
2. Generate an API Key in settings
3. Use the API Key as `SMTP_PASS`
4. Configuration:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your-api-key-here
   ```

### For Amazon SES

1. Configure Amazon SES on AWS
2. Verify your domain or email
3. Create SMTP credentials
4. Configuration:
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-access-key-id
   SMTP_PASS=your-secret-access-key
   ```

## How It Works in the Code

### Transporter Initialization

```typescript
// backend/src/email/email.service.ts (lines 10-19)
this.transporter = nodemailer.createTransport({
    host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
    port: this.configService.get<number>('SMTP_PORT') || 587,
    secure: this.configService.get<boolean>('SMTP_SECURE') || false,
    auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
    },
});
```

### Sending Email

```typescript
// backend/src/email/email.service.ts (lines 127-136)
const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER');

await this.transporter.sendMail({
    to,
    subject,
    html: htmlContent,
    text: textContent,
    from: `"JCoder" <${from}>`,
});
```

## Testing the Configuration

### 1. Verify Environment Variables

Make sure all variables are defined in the `.env` file at the project root.

### 2. Test Sending

When a message is created through the endpoint:
```
POST /api/v1/:username/messages
```

The system automatically:
1. Saves the message to the database
2. Sends a notification email to the administrator

### 3. Check Logs

If there is an error sending, check the backend logs. Common errors:

- **"Invalid login"**: Incorrect credentials
- **"Connection timeout"**: Network issue or incorrect host/port
- **"Authentication failed"**: For Gmail, make sure to use App Password

## Security

### Best Practices

1. **Never commit the `.env` file** to Git
2. **Use App Passwords** for Gmail (not the normal password)
3. **Rotate credentials** periodically
4. **Use environment variables** in production (not .env file)
5. **Limit permissions** of the email account used

### In Production

- Use transactional email services (SendGrid, Amazon SES, Mailgun)
- Configure SPF, DKIM and DMARC on your domain
- Monitor delivery rates and spam
- Implement rate limiting (already implemented: 5 messages/minute)

## Troubleshooting

### Emails are not being sent

1. Verify that all variables are defined
2. Test credentials manually
3. Check error logs in the console
4. Confirm that the SMTP server is accessible
5. For Gmail, verify that the App Password is correct

### Emails going to spam

1. Configure SPF on your domain
2. Configure DKIM
3. Use a transactional email service
4. Avoid words that trigger spam in subject/body

### Authentication error

- Gmail: Use App Password, not normal password
- Outlook: May need to enable "Less secure apps"
- Verify that `SMTP_USER` and `SMTP_PASS` are correct
- Confirm that the port and `SMTP_SECURE` are correct
