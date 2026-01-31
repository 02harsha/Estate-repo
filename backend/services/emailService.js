import nodemailer from 'nodemailer';

// Configure transporter - defaulting to console logging if potential env vars are missing
// In a real app, you'd use process.env.SMTP_HOST, etc.
const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to, subject, text) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('==================================================');
        console.log(`[MOCK EMAIL] To: ${to}`);
        console.log(`[MOCK EMAIL] Subject: ${subject}`);
        console.log(`[MOCK EMAIL] Body: ${text}`);
        console.log('==================================================');
        return Promise.resolve();
    }

    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
    };

    try {
        await transport.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
