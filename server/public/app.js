/* ShepherdAI — client-side API utilities */
'use strict';

const API = {
    base: '',  // same origin

    _session() { return localStorage.getItem('sai_session'); },

    _headers(extra = {}) {
        const h = { 'Content-Type': 'application/json' };
        const s = this._session();
        if (s) h['X-Session-Id'] = s;
        return { ...h, ...extra };
    },

    async _fetch(method, path, body) {
        const opts = { method, headers: this._headers() };
        if (body) opts.body = JSON.stringify(body);
        const res  = await fetch(this.base + path, opts);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw Object.assign(new Error(json.message || 'Request failed'), { code: json.code, status: res.status });
        return json;
    },

    // Auth
    signup(email, password, fullName, mobile)  { return this._fetch('POST', '/api/signup',  { email, password, full_name: fullName, mobile }); },
    login(email, password)                     { return this._fetch('POST', '/api/login',   { email, password }); },
    logout()                                   { return this._fetch('POST', '/api/logout'); },
    getUser()                                  { return this._fetch('GET',  '/api/user'); },

    // Calculate
    calculate(inputs)                          { return this._fetch('POST', '/api/calculate', inputs); },

    // Reports
    getReports()                               { return this._fetch('GET',  '/api/reports'); },
    downloadReport(id)                         { return `${this.base}/api/report/${id}/download?session=${this._session()}`; },

    // Payments
    createOrder(inputs, results)               { return this._fetch('POST', '/api/create-order',      { inputs, results }); },
    redeemVoucher(code, inputs, results)       { return this._fetch('POST', '/api/voucher/redeem',    { code, inputs, results }); },
    upgradeMembership()                        { return this._fetch('POST', '/api/upgrade-membership'); },

    // Health
    health()                                   { return this._fetch('GET',  '/api/health'); }
};

/* ─── Auth state helpers ─────────────────────────────────────────────────── */
const Auth = {
    isLoggedIn()  { return !!localStorage.getItem('sai_session'); },

    save(sessionId, userId) {
        localStorage.setItem('sai_session', sessionId);
        localStorage.setItem('sai_user_id', userId);
    },

    clear() {
        localStorage.removeItem('sai_session');
        localStorage.removeItem('sai_user_id');
        localStorage.removeItem('sai_user');
    },

    redirect(path) { window.location.href = path; },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login.html?next=' + encodeURIComponent(window.location.pathname);
        }
    },

    redirectIfAuthed() {
        if (this.isLoggedIn()) {
            const next = new URLSearchParams(window.location.search).get('next') || '/dashboard.html';
            window.location.href = next;
        }
    }
};

/* ─── UI helpers ─────────────────────────────────────────────────────────── */
function showAlert(containerId, message, type = 'error') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${type}">${escHtml(message)}</div>`;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '';
}

function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
        btn.dataset.orig = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span> Please wait…';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.orig || btn.innerHTML;
        btn.disabled = false;
    }
}

function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' });
}

function fmtRand(n) {
    return 'R ' + Number(n || 0).toLocaleString('en-ZA');
}
