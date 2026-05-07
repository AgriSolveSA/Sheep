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

async function sendLeadFollowUp(toEmail, { livestockType, province, savingsLow, savingsHigh }) {
    const transporter = getTransporter();
    const baseUrl = process.env.BASE_URL || 'https://shepherdai.co.za';
    const low  = Number(savingsLow  || 0).toLocaleString('en-ZA');
    const high = Number(savingsHigh || 0).toLocaleString('en-ZA');
    const type = (livestockType || 'livestock').charAt(0).toUpperCase() + (livestockType || 'livestock').slice(1);

    await transporter.sendMail({
        from:    process.env.EMAIL_FROM || 'ShepherdAI <noreply@shepherdai.co.za>',
        to:      toEmail,
        subject: `Your ${type} farm could save R${low}–R${high} this year`,
        text:    [
            `Hi Farmer,`,
            ``,
            `Based on your free estimate, your ${type} operation in ${province || 'South Africa'} could save R${low}–R${high} per year.`,
            ``,
            `The 3 biggest opportunities:`,
            `1. Feed efficiency — most farms overspend by 20–35%`,
            `2. Market access — wrong channel costs R50–R200 per animal`,
            `3. Veterinary timing — reactive vs preventative costs 2–4x more`,
            ``,
            `Get your full personalised action sheet (36-month cashflow, benchmarks, and a step-by-step plan) for R199:`,
            `${baseUrl}/signup.html`,
            ``,
            `30-day money-back guarantee. Your data is private and never sold.`,
            ``,
            `ShepherdAI Team`
        ].join('\n'),
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#1a5c2a;padding:20px 24px;border-radius:8px 8px 0 0;">
            <span style="color:#fff;font-size:1.2rem;font-weight:700;">Shepherd<span style="color:#c8b400;">AI</span></span>
          </div>
          <div style="background:#f0f7f1;padding:24px;border-radius:0 0 8px 8px;">
            <h2 style="color:#1a5c2a;margin:0 0 8px;">Your free farm estimate</h2>
            <p>Based on your inputs, your <strong>${type}</strong> operation in <strong>${province || 'South Africa'}</strong> could save:</p>
            <div style="background:#1a5c2a;color:#fff;border-radius:8px;text-align:center;padding:20px;margin:16px 0;">
              <div style="font-size:.85rem;opacity:.8;">POTENTIAL ANNUAL SAVINGS</div>
              <div style="font-size:2.4rem;font-weight:800;margin:4px 0;">R${low} – R${high}</div>
            </div>
            <h3 style="color:#1a5c2a;margin:16px 0 8px;">The 3 biggest opportunities:</h3>
            <ol style="margin:0;padding-left:20px;line-height:1.8;">
              <li><strong>Feed efficiency</strong> — most farms overspend by 20–35%</li>
              <li><strong>Market access</strong> — wrong channel costs R50–R200 per animal</li>
              <li><strong>Veterinary timing</strong> — reactive vs preventative costs 2–4× more</li>
            </ol>
            <div style="margin-top:24px;text-align:center;">
              <a href="${baseUrl}/signup.html" style="background:#c8b400;color:#000;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:6px;display:inline-block;">Get full report — R199 →</a>
              <p style="font-size:.8rem;color:#666;margin-top:12px;">🛡️ 30-day money-back guarantee. Your data is private and never sold.</p>
            </div>
          </div>
        </div>`
    });
}

async function sendSubscriptionConfirm(toEmail, fullName) {
    const transporter = getTransporter();
    const firstName   = (fullName || 'Farmer').split(' ')[0];
    const baseUrl = process.env.BASE_URL || 'https://shepherdai.co.za';

    await transporter.sendMail({
        from:    process.env.EMAIL_FROM || 'ShepherdAI <noreply@shepherdai.co.za>',
        to:      toEmail,
        subject: 'Welcome to ShepherdAI Ecosystem membership',
        text:    `Hi ${firstName},\n\nWelcome to the ShepherdAI Ecosystem! Your R99/month subscription is now active.\n\nYou now have unlimited reports, quarterly price updates, and priority support.\n\nLog in to your dashboard: ${baseUrl}/dashboard.html\n\nShepherdAI Team`,
        html:    `<p>Hi <strong>${firstName}</strong>,</p><p>Welcome to the ShepherdAI Ecosystem! Your R99/month subscription is active.</p><p>You now have <strong>unlimited reports</strong>, quarterly price updates, and priority support.</p><p><a href="${baseUrl}/dashboard.html">Log in to your dashboard</a></p><p>ShepherdAI Team</p>`
    });
}

module.exports = { sendReport, sendWelcome, sendLeadFollowUp, sendSubscriptionConfirm };
