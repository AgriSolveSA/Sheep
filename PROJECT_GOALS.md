# ShepherdAI — Goals & Roadmap

**Updated:** 2026-05-08
**Revenue target:** R50,000–100,000/month recurring
**Principle:** If it's not in this doc, don't build it yet.

---

## What Success Looks Like

- Farmer visits site on a phone
- Runs the free savings estimator — sees "You could save R8,400/year"
- Signs up, pays R199 via PayFast or EFT
- Receives a personalised AI-generated PDF report by email within 60 seconds
- Subscribes to R299/month ecosystem membership
- Buys a guide (R49), posts a classified listing (free or paid tier)
- Refers a neighbour, earns a R50 credit
- You have 200+ active users, R50k+ monthly revenue

---

## Current State (May 2026)

**All 6 planned months of feature code are complete.** The full platform is built:

- 7 calculator modules (sheep, cattle, goats, bees, pigs, poultry, dairy) — all sellable
- Full backend: Express + SQLite, auth, PayFast ITN, EFT fallback
- Ecosystem: guides store, classifieds with photo uploads, referrals, admin dashboard
- Light/dark mode across all pages and calculator

**What's deployed:** Local dev only. No live server yet.

**What's blocking live revenue:** Server hardware + domain + Nginx/SSL (owner actions).

---

## Remaining Work — Prioritised

### Priority 1: Go Live (Owner Actions — No Code Needed)

These are the only things blocking real revenue:

1. **Server hardware** — Refurbished desktop/laptop, Ubuntu 22.04, i5+, 8 GB RAM, 256 GB SSD (~R3,000–R5,000 on Takealot/Gumtree)
2. **Nginx + SSL** — `sudo apt install nginx certbot python3-certbot-nginx`, then `certbot --nginx -d shepherdai.co.za`
3. **Domain DNS** — Point shepherdai.co.za to your server IP
4. **PayFast merchant account** — Register at payfast.co.za, get live credentials, set in `server/.env`
5. **PM2** — `npm install -g pm2 && pm2 start server/server.js && pm2 startup`
6. **Write 5 guide PDFs** — Sheep health, vaccination schedule, fencing, feed management, ram selection

Once live, the platform can take real payments.

---

### Priority 2: AI Report (Biggest Product Upgrade)

**Current state:** Reports are template strings — well-structured but not AI-generated.

**Goal:** Server route calls Claude API (claude-sonnet-4-6), streams a province-specific narrative report, triggered only after PayFast ITN confirms payment.

**Why it matters:** This is the core differentiator. It justifies the R199 price and makes refunds rare.

**Estimated effort:** 1–2 days. The report structure and data are already built in `src/reportEngine.js` — just need to pass the data to Claude and stream the response.

---

### Priority 3: PDF Generation + Email Delivery

**Current state:** No server-side PDF. No auto-email on payment confirmation.

**Goal:**
- After PayFast ITN confirms payment → generate PDF (Puppeteer or React-PDF) → email to buyer within 60 seconds
- Email triggers on: EFT confirmed, KYC approved/rejected, listing approved/rejected

**Why it matters:** Currently admin has to manually confirm EFT and notify users. Should be automatic.

---

### Priority 4: Content & Marketing (Ongoing Owner Action)

- Write 5 guide PDFs (high-margin, zero marginal cost after writing)
- Post in WhatsApp farming groups weekly
- Collect 3–5 farmer testimonials for the landing page
- Update benchmark lookup tables quarterly (meat prices, wool, feed costs)

---

## What NOT to Build Yet

- ❌ Mobile app — the PWA works on phones already
- ❌ Crowdfunding — requires FSCA registration
- ❌ SME / agribusiness vertical — separate customer, separate launch
- ❌ Real-time price feeds — static tables updated quarterly are fine
- ❌ Multi-language — English only until validated
- ❌ Docker/Kubernetes — bare metal is simpler and cheaper
- ❌ Third-party auth (Google/Facebook login)
- ❌ Any new livestock module — 7 is enough to sell

---

## Revenue Model

| Product | Price | Margin |
|---------|-------|--------|
| Farm report (once-off) | R199 | ~100% |
| Ecosystem membership | R299/month | ~100% |
| Digital guide | R49 | ~100% after writing |
| Listing — Standard | R10 | 100% |
| Listing — Premium | R30 | 100% |
| Listing — Urgent | R50 | 100% |

**Path to R50k/month:**
- 100 reports/month × R199 = R19,900
- 80 subscribers × R299 = R23,920
- 50 guide sales × R49 = R2,450
- 50 paid listings × avg R25 = R1,250
- **Total: ~R47,500/month** — achievable with ~300 active users

---

## Operations Checklist (Once Live)

### Daily (10 min)
- Check PM2 logs: `pm2 logs server --lines 20`
- Check disk: `df -h`
- Check PayFast dashboard for failed payments

### Weekly (1 hour)
- Verify latest DB backup can be restored
- Review admin dashboard for pending EFT/KYC/listings
- Post in 1 WhatsApp/Facebook farming group

### Monthly (2 hours)
- Generate revenue report from admin dashboard
- Update benchmark prices in lookup tables if significantly changed
- Review audit log for any suspicious activity

---

## Emergency Procedures

| Problem | Action |
|---------|--------|
| Server down | `pm2 restart server`, check `pm2 logs` |
| PayFast ITN failing | Check PayFast dashboard → ITN history → fix + redeploy |
| DB corrupt | `pm2 stop server`, `cp backups/farm_latest.db db/farm.db`, `pm2 start server` |
| Disk full | `find server/logs -name "*.log" -mtime +30 -delete` |
| SSL expired | `sudo certbot renew --force-renewal && sudo systemctl restart nginx` |

---

## Deployment (One-Time Setup)

```bash
# On the server
git clone https://github.com/AgriSolveSA/Sheep.git /var/www/shepherdai
cd /var/www/shepherdai
npm install
cd server && cp .env.example .env  # fill in PayFast keys, SMTP, etc.
npm run build                       # build React calculator to dist/
pm2 start server/server.js --name shepherdai
pm2 startup && pm2 save
```

```nginx
# /etc/nginx/sites-available/shepherdai
server {
    listen 80;
    server_name shepherdai.co.za www.shepherdai.co.za;
    location / { proxy_pass http://localhost:3000; }
}
# Then: certbot --nginx -d shepherdai.co.za
```
