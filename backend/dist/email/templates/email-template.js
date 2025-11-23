"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTemplate = void 0;
class EmailTemplate {
    static generateHTML(options) {
        const { title, content, footerText = 'This is an automatic notification from the JCoder system. Please do not reply to this email directly.', logoUrl, frontendBaseUrl, } = options;
        const logoImg = logoUrl
            ? `<img src="${logoUrl}" alt="JCoder" style="width: 48px; height: 48px; border-radius: 50%; object-fit: contain;" />`
            : `<img src="cid:logo" alt="JCoder" style="width: 48px; height: 48px; border-radius: 50%; object-fit: contain;" />`;
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #ffffff;">
    <!-- Background wrapper with gradient -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #000000 50%, #050505 75%, #000000 100%); background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #0a0a0a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 200, 255, 0.1);">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #00c8ff 0%, #0050a0 100%); padding: 30px 40px; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        ${logoImg}
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">JCoder</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content area -->
                    <tr>
                        <td style="padding: 40px; background-color: #0a0a0a;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <!-- Title -->
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3;">${title}</h2>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding-bottom: 30px; color: #ffffff; font-size: 16px; line-height: 1.6;">
                                        ${content}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #111111; border-top: 1px solid #333333; text-align: center;">
                            <p style="margin: 0; color: #a0a0a0; font-size: 12px; line-height: 1.5;">
                                ${footerText}
                            </p>
                            ${frontendBaseUrl ? `
                            <p style="margin: 15px 0 0 0;">
                                <a href="${frontendBaseUrl}" style="color: #00c8ff; text-decoration: none; font-size: 12px;">Visit JCoder</a>
                            </p>
                            ` : ''}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
    }
    static generateText(title, content, footerText) {
        const footer = footerText || 'This is an automatic notification from the JCoder system. Please do not reply to this email directly.';
        return `
${title}

${content}

---
${footer}
    `.trim();
    }
    static createCodeBox(code) {
        return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
    <tr>
        <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color: #111111; border: 2px solid #00c8ff; border-radius: 8px; padding: 20px;">
                <tr>
                    <td align="center" style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00c8ff; font-family: 'JetBrains Mono', monospace;">
                        ${code}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
    `.trim();
    }
    static createMessageBox(senderName, senderEmail, message) {
        return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
    <tr>
        <td style="background-color: #111111; border-left: 4px solid #00c8ff; padding: 20px; border-radius: 4px;">
            <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                From: ${senderName} (${senderEmail})
            </p>
            <p style="margin: 0; color: #a0a0a0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
${message.replace(/\n/g, '<br>')}
            </p>
        </td>
    </tr>
</table>
    `.trim();
    }
    static createButton(text, url) {
        return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
    <tr>
        <td align="center">
            <a href="${url}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #00c8ff 0%, #0050a0 100%); color: #000000; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ${text}
            </a>
        </td>
    </tr>
</table>
    `.trim();
    }
}
exports.EmailTemplate = EmailTemplate;
EmailTemplate.BRAND_COLORS = {
    cyan: '#00c8ff',
    blue: '#0050a0',
    black: '#000000',
    white: '#ffffff',
    card: '#0a0a0a',
    muted: '#a0a0a0',
    border: '#333333',
};
//# sourceMappingURL=email-template.js.map