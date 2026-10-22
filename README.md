# Sublimation & Custom Printing Business Platform

A MERN-based business management platform for a sublimation and custom printing business.
> **Project status:** Foundation/setup stage; MongoDB Atlas backend connection confirmed by project owner
> **Primary branch:** `master`
> **Application implementation:** Existing backend connection reported; remaining implementation status pending inspection

---

## 1. Project Purpose

This project is being developed from scratch to provide a centralized platform for managing the operational and customer-facing requirements of a sublimation and custom printing business.

The platform is intended to bring product management, customization, customers, orders, artwork, production, inventory, enquiries, quotations, financial records, business content, and related administrative workflows into one system.

The **`PROJECT_MASTER_SPECIFICATION`** is the primary requirements document for this project. Development decisions must remain consistent with that specification.

---

## 2. Technology Stack

### Core Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js + Express |
| Database | MongoDB |
| Architecture | Modular monolith |
| Version Control | Git + GitHub |

Additional packages, services, and integrations will be introduced only when required by an approved development step.

---

## 3. Architecture

The project follows a **modular monolithic MERN architecture**.

The planned application consists of:

```text
React Frontend
      │
      │ HTTP/API
      ▼
Express + Node.js Backend
      │
      ▼
MongoDB
```

The application will use one frontend, one backend, and one primary database rather than introducing unnecessary microservices or distributed infrastructure.

Internal modules will remain separated by responsibility while operating within the same application.

---

## 4. Major Functional Areas

The master specification identifies the following major areas for the platform.

### Product & Customization

- Product catalog
- Product customization
- Product media
- Custom printing requirements
- Customer artwork and design workflows

### Customers & Accounts

- Customer accounts
- Staff access
- Administrative access
- Role-based authorization
- Customer-related business records

### Shopping & Orders

- Cart
- Wishlist
- Checkout
- Orders
- Backend-authoritative pricing and totals
- Stock-aware business rules

### Artwork & Production

- Artwork submission
- Artwork review
- Approval workflows
- Production tracking

### Inventory

- Inventory records
- Stock management
- Inventory-related business rules
- Import/export workflows

### Business Operations

- Enquiries
- Quotations
- Orders
- Financial records
- Business reporting

### Content & Communication

- FAQs
- Testimonials
- Social links
- Business-facing content
- Analytics-related capabilities

### Data Import & Export

- Excel/CSV imports
- Validation of imported data
- PDF exports
- Excel exports

### Optional Integrations

The master specification also identifies optional integrations that may be considered later, including:

- AI/image-generation-related functionality
- Email
- WhatsApp
- Chatbot functionality

Optional integrations will not be added until their requirements and implementation stage are reached.

---

## 5. Security Principles

Security and data integrity are primary project requirements.

The application must:

- Protect authenticated and administrative APIs.
- Enforce authorization on the server.
- Never trust client-provided permissions.
- Never trust client-provided prices, stock quantities, totals, or other critical business values.
- Keep secrets and credentials outside version control.
- Validate and sanitize user input.
- Handle file uploads securely.
- Restrict administrative and developer-level functionality appropriately.
- Maintain appropriate audit records.
- Preserve important business records rather than silently deleting them.
- Apply secure authentication and authorization practices.

Security requirements must be considered during implementation rather than added as an afterthought.

---

## 6. Development Rules

Development follows a controlled, incremental process.

### One Step at a Time

Only one development step is implemented at a time.

Each step should:

1. Define the objective.
2. Identify prerequisites.
3. Make only the required changes.
4. Explain important implementation decisions.
5. Run appropriate checks/tests.
6. Investigate failures before proceeding.
7. Review relevant security implications.
8. Update documentation when appropriate.

### Verification

The project distinguishes between:

- **Proposed** — planned but not implemented.
- **Implemented** — code/configuration has been created.
- **Tested** — a relevant test or verification command has been executed.
- **Verified** — the result has been inspected and confirmed.
- **Committed** — changes have been committed to Git.
- **Deployed** — changes have been deployed to a target environment.

No status will be represented as completed without verification.

### Git

Git changes will not be staged or committed automatically.

A commit should occur only after:

1. The current development step passes its checks.
2. The changes have been reviewed.
3. The project owner explicitly approves the commit.

The primary development branch is:

```text
master
```

---

## 7. Development Roadmap

The project will be developed incrementally according to the master specification.

### Phase 1 — Environment Verification

- Verify development environment.
- Verify required tooling.
- Confirm prerequisites.

**Status:** Completed

### Phase 2 — Git & Project Foundation

- Initialize Git repository.
- Establish `.gitignore`.
- Establish README and changelog.
- Establish the initial project foundation.

**Status:** In progress

### Phase 3 — React & Design System

- Establish frontend foundation.
- Establish shared design system.
- Establish reusable UI patterns.
- Establish responsive and accessible frontend foundations.

**Status:** Planned

### Phase 4 — Express & MongoDB Foundation

- Establish backend foundation.
- Configure Express.
- Inspect and verify the existing MongoDB Atlas connection.
- Establish backend configuration and environment handling.

**Status:** Partially complete — MongoDB Atlas backend connection confirmed by project owner; remaining backend foundation pending inspection

### Phase 5 — Shared UI & Application Layout

- Establish application layouts.
- Establish shared navigation and UI structures.
- Establish reusable frontend components.

**Status:** Planned

### Phase 6 — Authentication & Authorization

- Authentication foundation.
- Role-based access control.
- Protected routes and APIs.
- Secure authorization boundaries.

**Status:** Planned

### Later Phases

Subsequent phases will implement the business modules defined by the master specification, including products, customization, customers, cart/checkout, orders, artwork, production, inventory, enquiries, quotations, financial records, content management, imports/exports, analytics, and approved integrations.

Detailed implementation will be introduced only when each phase is reached.

---

## 8. Repository Structure

The repository structure will be established incrementally. An existing `sublimation-gallery/` directory is present; its contents and role have not yet been inspected.

The project will maintain a clear separation between:

```text
Frontend
Backend
Shared configuration/documentation
```

The final structure will be determined during the relevant implementation steps rather than creating unnecessary directories in advance.

---

## 9. Environment Variables & Secrets

Sensitive configuration must never be committed to Git.

Examples include:

- Database credentials
- Authentication secrets
- API keys
- Third-party service credentials
- Email credentials
- Integration credentials

Environment variable templates may be committed when needed, but real secret values must remain local or in an appropriate secure environment.

---

## 10. Documentation

The project documentation includes:

- `README.md` — project overview, architecture, rules, and development status.
- `CHANGELOG.md` — chronological record of project changes.
- `PROJECT_MASTER_SPECIFICATION` — primary project requirements and development guidance.

Additional architecture decisions, requirements tracking, and progress documentation will be added when required by the project workflow.

---

## 11. Current Status

### Environment

- Windows development environment — verified
- Node.js — verified
- npm — verified
- Git — verified
- VS Code — verified
- MongoDB Atlas — backend connection confirmed by project owner

### Git

- Repository initialized — verified
- Primary branch: `master`
- Initial commit — **not yet created**

### Application

- React application — status pending inspection
- Express application — status pending inspection
- MongoDB backend connection — connected to MongoDB Atlas (confirmed by project owner; not independently tested here)
- Authentication — status pending inspection
- Business modules — status pending inspection

* The project is intentionally being built incrementally rather than generating the entire application at once.
