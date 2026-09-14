# Contributing to HaloPay API

Thank you for your interest in contributing to the **HaloPay API**! This repository serves as the core settlement and anchor backend for HaloPay — orchestrating SEP-10 authentication, SEP-12 KYC ingestion, SEP-24 fiat off-ramping, and on-chain Horizon payment streaming.

To ensure production reliability, regulatory compliance, and smooth collaboration, please follow our contribution guidelines below.

---

## 🚀 How to Contribute

### 1. Select an Open Issue
* Check the repository's open issues labeled `status: ready-for-dev`, `good first issue`, or `help wanted`.
* Read through the issue's **Context**, **Technical Requirements**, and **Acceptance Criteria**.

### 2. Request Assignment Before Starting Work
* **Please do not start coding or submit unsolicited PRs without being assigned.** This ensures multiple developers don't work on the same task simultaneously.
* Comment on the issue outlining your proposed design or requesting assignment. A maintainer will assign the issue to you.

### 3. Branching Strategy
* Create your feature branch off `main`:
  ```bash
  git checkout -b feat/issue-<issue_number>-<short-description>
  ```
  *Examples:*
  * `feat/issue-22-sep38-quote-stream`
  * `fix/issue-31-rate-limit-redis`
  * `docs/issue-45-openapi-annotations`

### 4. Pull Request Standards
* **Title Format:** PR titles MUST follow the format:
  ```text
  [#<issue_number>] <Imperative description of change>
  ```
  *Example:* `[#22] Implement SEP-38 real-time quote streaming via WebSockets`
* **Issue Linking:** Explicitly link the issue in your PR description:
  ```text
  Closes #<issue_number>
  ```
* **Atomicity:** Keep each PR focused strictly on the assigned task. Separate data model changes from controller logic where applicable.

---

## 🛠️ Local Development & Quality Gates

All pull requests trigger our continuous integration (CI) workflow. Before submitting a PR, ensure all checks pass locally:

### 1. Linting & Formatting
```bash
npm run lint
```

### 2. TypeScript Compilation Check
```bash
npm run build
```

### 3. Running Unit & Integration Tests
```bash
npm test
```

---

## 🏛️ Repository Architecture

When adding new routes, middleware, or services, maintain the established modular structure:

* `src/controllers/`: HTTP request handlers, parameter validation, and status code mapping.
* `src/services/`: Core domain logic (Stellar SDK interactions, SEP protocol flows, Horizon listeners).
* `src/routes/`: Route definitions and middleware binding.
* `src/middleware/`: Authentication (SEP-10 JWT verification), rate limiting, and request audit logging.
* `src/websocket/`: Real-time WebSocket connection managers and event broadcasters.
* `tests/`: Jest test suites mirroring the `src/` directory layout.

---

## 📜 Code of Conduct & Licensing

* **Respect & Professionalism:** Maintain a welcoming and professional environment across all issue discussions and PR reviews.
* **Licensing:** All contributions to this repository are licensed under the **Apache License, Version 2.0**. By submitting a pull request, you agree that your work will be covered under this license.

