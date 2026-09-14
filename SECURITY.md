# Security Policy

HaloPay API enforces defense-in-depth security to protect merchant accounts, cryptographic payment authorizations, and anchor off-ramp operations.

---

## Supported Versions

Only the latest commit on the `main` branch is actively supported and maintained with security updates.

| Component | Target Runtime | Supported |
| :-------- | :------------- | :-------- |
| `halopay-api` | Node.js 20+ LTS | :white_check_mark: |

---

## Responsible Disclosure

If you discover a potential vulnerability, authorization bypass, or payment race condition within HaloPay API, **please DO NOT create a public GitHub issue or PR.**

Please report all vulnerabilities via responsible disclosure:

* **Email:** [security@halopay.io](mailto:security@halopay.io)
* **Telegram:** Direct liaison available via [@HaloPayDev](https://t.me/HaloPayDev)
* **Response SLA:** We acknowledge all security disclosures within **24 hours**.
* **Remediation Target:** Vulnerabilities will be patched and deployed within **48–72 hours**.

### What to Include
1. Summary of the vulnerability and its potential impact on merchant balances or anchor communications.
2. Step-by-step reproduction instructions, HTTP request payloads, or curl commands.
3. Relevant log snippets or stack traces (sanitizing any sensitive test keys).

---

## Architecture Safeguards & Key Management

1. **Non-Custodial Architecture:** HaloPay API **NEVER** generates, accepts, or stores merchant secret keys (`S...`). All signatures must be produced client-side by merchant POS devices or customer wallets.
2. **SEP-10 Cryptographic Authentication:** Authentication tokens are strictly bounded by SEP-10 challenge transaction signatures with short-lived JWT validity windows (1 hour).
3. **Idempotency & Rate Limiting:** All settlement endpoints enforce unique idempotency keys and Redis-backed sliding window rate limits to prevent double-submission and replay attacks.
4. **Header Hardening & Sanitization:** The API enforces strict CORS origin checks, Content-Security-Policy (CSP), and `helmet` HTTP security headers.

