/**
 * MTN MoMo Pay — Collections API integration
 *
 * Owner setup required before going live:
 *  1. Register at https://momodeveloper.mtn.com
 *  2. Subscribe to "Collection" product → get MOMO_SUBSCRIPTION_KEY
 *  3. In sandbox: POST /v1_0/apiuser to create API user → get MOMO_API_USER
 *  4. POST /v1_0/apiuser/{referenceId}/apikey → get MOMO_API_KEY
 *  5. Set MOMO_SANDBOX=false and MOMO_TARGET_ENV=mtnza for production
 *
 * Required .env variables:
 *  MOMO_SUBSCRIPTION_KEY, MOMO_API_USER, MOMO_API_KEY,
 *  MOMO_TARGET_ENV (sandbox | mtnza), MOMO_SANDBOX (true | false)
 */
const https  = require('https');
const crypto = require('crypto');

const SANDBOX_HOST = 'sandbox.momodeveloper.mtn.com';
const LIVE_HOST    = 'proxy.momoapi.mtn.com';

function isSandbox() { return process.env.MOMO_SANDBOX !== 'false'; }
function host()      { return isSandbox() ? SANDBOX_HOST : LIVE_HOST; }
function targetEnv() { return process.env.MOMO_TARGET_ENV || 'sandbox'; }

function _request(method, urlPath, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const postData = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: host(), port: 443, path: urlPath, method,
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY || '',
                'X-Target-Environment':      targetEnv(),
                'Content-Type':              'application/json',
                ...headers,
                ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
            }
        };
        const req = https.request(opts, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch (_) { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

async function _getAccessToken() {
    const credentials = Buffer.from(
        `${process.env.MOMO_API_USER}:${process.env.MOMO_API_KEY}`
    ).toString('base64');

    const result = await _request('POST', '/collection/token/', {
        'Authorization': `Basic ${credentials}`
    });
    return result.body.access_token;
}

/**
 * Request payment from a South African mobile number.
 * @param {string} msisdn  — mobile number (27XXXXXXXXX format)
 * @param {number} amountCents
 * @param {string} paymentId  — our internal payment record ID (used as externalId)
 * @param {string} note       — description shown to payer
 * @returns {string}          — MoMo reference UUID
 */
async function requestPayment(msisdn, amountCents, paymentId, note = 'ShepherdAI Report') {
    if (!process.env.MOMO_SUBSCRIPTION_KEY) {
        throw new Error('MoMo Pay not configured. Set MOMO_SUBSCRIPTION_KEY in .env');
    }

    const token     = await _getAccessToken();
    const reference = crypto.randomUUID();
    const amount    = (amountCents / 100).toFixed(2);

    await _request('POST', '/collection/v1_0/requesttopay', {
        'Authorization':  `Bearer ${token}`,
        'X-Reference-Id': reference,
        'X-Callback-Url': `${process.env.BASE_URL || 'https://shepherdai.co.za'}/webhook/momo`
    }, {
        amount:         amount,
        currency:       'ZAR',
        externalId:     paymentId.toString(),
        payer:          { partyIdType: 'MSISDN', partyId: msisdn.replace(/\s/g, '') },
        payerMessage:   note,
        payeeNote:      `Payment ref: ${paymentId}`
    });

    return reference;
}

/**
 * Check the status of a payment request.
 * @param {string} reference  — MoMo reference UUID returned from requestPayment
 * @returns {'PENDING' | 'SUCCESSFUL' | 'FAILED'}
 */
async function checkStatus(reference) {
    const token  = await _getAccessToken();
    const result = await _request('GET', `/collection/v1_0/requesttopay/${reference}`, {
        'Authorization': `Bearer ${token}`
    });
    return result.body.status || 'FAILED';
}

module.exports = { requestPayment, checkStatus };
