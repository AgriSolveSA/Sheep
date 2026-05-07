const nodemailer = require('nodemailer');
const path       = require('path');

let _transporter;

function getTransporter() {
    if (_transporter) return _transporter;
    _transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST || 'smtp.gmail.com',
        port:   parseInt(process.env.SMTP_PORT || '587', 10),
        secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    return _transporter;
}

async function sendReport(toEmail, fullName, pdfPath) {
    const transporter = getTransporter();
    const firstName   = (fullName || 'Farmer').split(' ')[0];

    await transporter.sendMail({
        from:        process.env.EMAIL_FROM || 'ShepherdAI <noreply@shepherdai.co.za>',
        to:          toEmail,
        subject:     'Your ShepherdAI Farm Report is ready',
        text:        `Hi ${firstName},\n\nThank you for your purchase. Please find your personalised farm profitability report attached.\n\nLogin to your dashboard at ${process.env.BASE_URL || 'https://shepherdai.co.za'} to view all past reports.\n\nShepherdAI Team`,
        html:        `<p>Hi <strong>${firstName}</strong>,</p><p>Thank you for your purchase. Your personalised farm profitability report is attached.</p><p>Login to your <a href="${process.env.BASE_URL || 'https://shepherdai.co.za'}/dashboard">dashboard</a> to view all past reports.</p><p>ShepherdAI Team</p>`,
        attachments: [{ filename: `shepherdai-report.pdf`, path: pdfPath }]
    });
}

async function sendWelcome(toEmail, fullName) {
    const transporter = getTransporter();
    const firstName   = (fullName || 'Farmer').split(' ')[0];

    await transporter.sendMail({
        from:    process.env.EMAIL_FROM || 'ShepherdAI <noreply@shepherdai.co.za>',
        to:      toEmail,
        subject: 'Welcome to ShepherdAI',
        text:    `Hi ${firstName},\n\nWelcome to ShepherdAI — South Africa's farm profitability platform.\n\nGet started by running your free savings estimate at ${process.env.BASE_URL || 'https://shepherdai.co.za'}.\n\nShepherdAI Team`,
        html:    `<p>Hi <strong>${firstName}</strong>,</p><p>Welcome to ShepherdAI — South Africa's farm profitability platform.</p><p><a href="${process.env.BASE_URL || 'https://shepherdai.co.za'}">Run your free savings estimate</a> to see where your farm is leaking money.</p><p>ShepherdAI Team</p>`
    });
}

module.exports = { sendReport, sendWelcome };
