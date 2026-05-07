const crypto = require('crypto');
const https  = require('https');
const qs     = require('querystring');

// PayFast IP whitelist (sandbox + live)
const PAYFAST_IPS = [
    '197.97.145.144','197.97.145.145','197.97.145.146','197.97.145.147',
    '196.33.227.224','196.33.227.225','196.33.227.226','196.33.227.227',
    '41.74.179.192','41.74.179.193','41.74.179.194','41.74.179.195',
    '127.0.0.1' // localhost for sandbox testing
];

function buildPayFastForm({ paymentId, reportId, userId, email, fullName, amountCents }) {
    const sandbox  = process.env.PAYFAST_SANDBOX !== 'false';
    const host     = sandbox ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';
    const baseUrl  = process.env.BASE_URL || 'https://shepherdai.co.za';

    const params = {
        merchant_id:    process.env.PAYFAST_MERCHANT_ID,
        merchant_key:   process.env.PAYFAST_MERCHANT_KEY,
        return_url:     `${baseUrl}/dashboard.html?payment=success`,
        cancel_url:     `${baseUrl}/dashboard.html?payment=cancelled`,
        notify_url:     `${baseUrl}/webhook/payfast`,
        name_first:     (fullName || '').split(' ')[0] || 'Farmer',
        name_last:      (fullName || '').split(' ').slice(1).join(' ') || '-',
        email_address:  email,
        m_payment_id:   paymentId.toString(),
        amount:         (amountCents / 100).toFixed(2),
        item_name:      'ShepherdAI Farm Report',
        item_description: 'Personalised livestock profitability report',
        custom_str1:    paymentId.toString(),
        custom_str2:    reportId.toString(),
        custom_str3:    userId.toString()
    };

    if (process.env.PAYFAST_PASSPHRASE) {
        const sigStr = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim())}`)
            .join('&') + `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE)}`;
        params.signature = crypto.createHash('md5').update(sigStr).digest('hex');
    } else {
        const sigStr = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim())}`)
            .join('&');
        params.signature = crypto.createHash('md5').update(sigStr).digest('hex');
    }

    const fields = Object.entries(params)
        .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}" />`)
        .join('\n');

    return {
        action: `https://${host}/eng/process`,
        html: `<form id="pf-form" action="https://${host}/eng/process" method="POST">${fields}<button type="submit">Pay R${(amountCents/100).toFixed(2)} via PayFast</button></form><script>document.getElementById('pf-form').submit();</script>`
    };
}

async function validateITN(body, sourceIp) {
    // 1. IP check (skip in dev)
    if (process.env.NODE_ENV === 'production') {
        const realIp = sourceIp.replace('::ffff:', '');
        if (!PAYFAST_IPS.includes(realIp)) {
            console.warn('PayFast ITN from unexpected IP:', realIp);
            return false;
        }
    }

    // 2. Signature check
    const { signature, ...rest } = body;
    let sigStr = Object.entries(rest)
        .filter(([, v]) => v !== '')
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
        .join('&');
    if (process.env.PAYFAST_PASSPHRASE)
        sigStr += `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE)}`;
    const expected = crypto.createHash('md5').update(sigStr).digest('hex');
    if (expected !== signature) {
        console.warn('PayFast ITN signature mismatch');
        return false;
    }

    // 3. merchant_id check
    if (body.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
        console.warn('PayFast ITN merchant_id mismatch');
        return false;
    }

    // 4. Remote validation with PayFast
    const sandbox = process.env.PAYFAST_SANDBOX !== 'false';
    const pfHost  = sandbox ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';
    const valid   = await _remoteValidate(pfHost, body);
    return valid;
}

function _remoteValidate(host, body) {
    return new Promise((resolve) => {
        const postData = qs.stringify(body);
        const options  = {
            hostname: host, port: 443, path: '/eng/query/validate',
            method: 'POST',
            headers: {
                'Content-Type':   'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data.trim() === 'VALID'));
        });
        req.on('error', (err) => { console.error('PayFast remote validation error:', err); resolve(false); });
        req.write(postData);
        req.end();
    });
}

function buildSubscriptionForm({ paymentId, userId, email, fullName }) {
    const sandbox  = process.env.PAYFAST_SANDBOX !== 'false';
    const host     = sandbox ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';
    const baseUrl  = process.env.BASE_URL || 'https://shepherdai.co.za';
    const amount   = '99.00';

    const params = {
        merchant_id:      process.env.PAYFAST_MERCHANT_ID,
        merchant_key:     process.env.PAYFAST_MERCHANT_KEY,
        return_url:       `${baseUrl}/dashboard.html?payment=subscribed`,
        cancel_url:       `${baseUrl}/dashboard.html?payment=cancelled`,
        notify_url:       `${baseUrl}/webhook/payfast`,
        name_first:       (fullName || '').split(' ')[0] || 'Farmer',
        name_last:        (fullName || '').split(' ').slice(1).join(' ') || '-',
        email_address:    email,
        m_payment_id:     paymentId.toString(),
        amount,
        item_name:        'ShepherdAI Ecosystem Membership',
        item_description: 'Monthly R99 subscription — unlimited reports, quarterly updates',
        custom_str1:      userId.toString(),
        custom_str2:      'subscription',
        custom_str3:      paymentId.toString(),
        subscription_type: '1',
        recurring_amount:  amount,
        frequency:         '3',   // monthly
        cycles:            '0'    // indefinite
    };

    if (process.env.PAYFAST_PASSPHRASE) {
        const sigStr = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim())}`)
            .join('&') + `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE)}`;
        params.signature = crypto.createHash('md5').update(sigStr).digest('hex');
    } else {
        const sigStr = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim())}`)
            .join('&');
        params.signature = crypto.createHash('md5').update(sigStr).digest('hex');
    }

    const fields = Object.entries(params)
        .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}" />`)
        .join('\n');

    return {
        action: `https://${host}/eng/process`,
        html:   `<form id="pf-form" action="https://${host}/eng/process" method="POST">${fields}<button type="submit">Subscribe R99/month via PayFast</button></form><script>document.getElementById('pf-form').submit();</script>`
    };
}

module.exports = { buildPayFastForm, buildSubscriptionForm, validateITN };
