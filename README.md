# TeeCraft — Sublimation & Custom Printing Business Platform

**Tagline:** Wear Your Ideas

A MERN-based business management platform for a sublimation and custom printing business. TeeCraft is being developed incrementally, with a focus on maintainability, security, usability, and reliable business workflows.

> **Project status:** Phase 6 — Authentication and Authorization in progress; final review and documentation reconciliation remain.
>
> **Brand:** TeeCraft
> **Primary branch:** `master` (confirm against the local repository before relying on this value)
> **Architecture:** Modular monolith
> **Primary requirements:** `PROJECT_MASTER_SPECIFICATION`

---

## 1. Project Purpose

TeeCraft aims to provide a centralized platform for managing the operational and customer-facing needs of a sublimation and custom printing business.

The planned platform covers product management, customization, customer accounts, orders, artwork, production, inventory, enquiries, quotations, financial records, business content, reporting, and related workflows.

The `PROJECT_MASTER_SPECIFICATION` is the primary project requirements document. Architecture, security decisions, development order, design conventions, and implementation scope must remain consistent with it.

## 2. Brand Identity

| Property | Specification |
|---|---|
| Brand name | TeeCraft |
| Tagline | Wear Your Ideas |
| Brand personality | Creative, simple, dependable |
| Logo concept | Minimal T-shirt combined with the letter T |
| Logo style | Flat, scalable, recognisable |
| Primary colour | Charcoal `#191919` |

The website frontend should apply this identity consistently across its header, homepage, buttons, navigation, and responsive layouts.

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Frontend tooling | Vite |
| Backend runtime | Node.js |
| Backend framework | Express |
| Database | MongoDB |
| Database integration | Mongoose |
| API communication | HTTP using the Fetch API |
| Version control | Git |
| Development tools | VS Code and npm |

Additional libraries, services, and integrations should be introduced only when required by the applicable specification and the current development step.

## 4. Architecture

The application follows a modular monolithic MERN architecture.

```text
React + Vite Frontend
         |
         | HTTP / JSON API
         v
Node.js + Express Backend
         |
         v
MongoDB
```

The frontend and backend are maintained as separate applications within the same repository.

The backend is responsible for:

- API validation.
- Business rules and calculations.
- Authentication and authorization.
- Data access and persistence.
- Security controls.
- Consistent error handling.

The frontend must not be treated as a trusted authority for permissions, pricing, discounts, taxes, stock quantities, payment status, or other critical business values.

The backend should use clear separation of responsibilities, including routes, controllers, services, middleware, models, validation, configuration, and utilities as appropriate.

Microservices and unnecessary infrastructure should not be introduced without a clear requirement.

## 5. Planned Functional Areas

The following areas describe the intended platform scope. They are not claims that these features have already been implemented.

### 5.1 Products and Customization

- Product catalogue and product details.
- Dynamic product categories.
- Product variants and SKU management.
- Custom printing options.
- Product media and artwork.
- Product-specific customization requirements.
- Print dimensions and print-position configuration.
- Customer design submission workflows.
- Product pricing and availability management.

### 5.2 Customers and Accounts

- Customer accounts.
- Staff and administrative accounts.
- Customer authentication.
- Password recovery.
- Role-based authorization.
- Account activation, deactivation, and suspension.
- Customer profiles and related business records.
- Controlled administrative account management.

Public registration must not allow users to assign themselves privileged roles.

### 5.3 Shopping and Orders

- Cart and wishlist.
- Checkout workflows when enabled.
- Order creation and tracking.
- Backend-authoritative pricing and totals.
- Stock-aware business rules.
- Order snapshots that preserve the purchased product and pricing details.
- Separate payment and order statuses.

The backend must calculate and validate critical financial and stock values. A frontend response alone must never establish that a payment succeeded.

### 5.4 Artwork and Production

- Artwork submission.
- Secure artwork storage and validation.
- Artwork review.
- Customer approval workflows.
- Preservation of original artwork and relevant versions.
- Production status tracking.
- Quality-control and dispatch workflows.

Production-critical artwork should receive appropriate human review.

### 5.5 Inventory

- Inventory records.
- Stock management.
- Inventory validation and business rules.
- Inventory movement history.
- Supplier-related records.
- Data import and export.

Inventory operations must prevent negative stock and handle concurrent updates safely.

### 5.6 Business Operations

- Enquiries.
- Quotations.
- Order management.
- Financial records.
- Supplier records.
- Invoice and payment records.
- Business reporting.

Business policies such as tax, shipping, payment, and refund rules must be established explicitly rather than invented during implementation.

### 5.7 Content and Communication

- FAQs and testimonials.
- Social links.
- Business-facing content.
- Customer feedback.
- Analytics-related capabilities.

Testimonials require appropriate consent and moderation.

### 5.8 Data Import and Export

- CSV and Excel imports.
- Import preview and validation.
- Duplicate detection.
- Explicit confirmation before applying imports.
- PDF exports.
- Excel exports.
- Permission-controlled data access and export.

Imports must not silently overwrite existing records.

### 5.9 Optional Integrations

Potential later integrations include:

- Email.
- WhatsApp.
- Chatbot functionality.
- AI-assisted features.
- Image-generation-related functionality.

These integrations must remain out of scope until their requirements and development stage are reached. External services, APIs, and pricing must be checked when an integration is actually planned.

## 6. Security Principles

Security and data integrity are core requirements, not optional finishing tasks.

The application must:

- Enforce authorization on the server for protected operations.
- Never trust client-provided roles, permissions, prices, totals, payment status, or stock quantities.
- Validate and sanitize untrusted input.
- Keep credentials and secrets out of version control.
- Use environment variables for local configuration where appropriate.
- Hash passwords using an appropriate password-hashing algorithm.
- Protect authentication cookies and sessions/tokens.
- Apply CSRF and trusted-origin protections where required.
- Apply rate limiting to sensitive authentication and recovery endpoints.
- Use secure, expiring password-reset tokens.
- Avoid revealing whether an account exists during password-recovery requests.
- Enforce account status during authentication and protected requests.
- Handle file uploads securely.
- Protect administrative functionality.
- Preserve important business records and use deliberate deletion policies.
- Use suitable error handling without leaking secrets or sensitive internal details.
- Consider auditability for important business operations.
- Prevent removal or deactivation of the last active administrator.
- Review security implications during each implementation step.

The Developer role must remain separate from the Admin role and must have narrowly restricted diagnostic capabilities.

## 7. Development Rules

Development must proceed one step at a time.

Each step should:

1. Define its objective and prerequisites.
2. Inspect relevant existing files before modifying them.
3. Make only the changes required for that step.
4. Explain implementation decisions in beginner-friendly language.
5. Provide exact commands for the relevant development environment.
6. Run appropriate syntax checks, linting, builds, or tests.
7. Investigate failures rather than assuming success.
8. Review relevant security and configuration implications.
9. Update documentation when appropriate.
10. Wait for explicit approval before staging or committing changes.

Do not generate the entire application at once or continue to another development step while the current step has unresolved failures.

### Verification terminology

- **Planned:** Work has not yet been implemented.
- **Implemented:** Code or configuration has been created.
- **Tested:** A relevant check has been run.
- **Verified:** The result has been inspected and confirmed.
- **Committed:** Changes have been committed to Git.
- **Deployed:** Changes have been deployed to a target environment.

These statuses must not be treated as interchangeable. Do not claim a test passed unless its result has been observed.

### Git policy

- Do not stage changes automatically.
- Do not commit changes without explicit approval.
- Review the working tree and diff before proposing a commit.
- Do not assume that an initial commit exists.
- Do not overwrite unrelated user changes.
- Preserve uncommitted work.
- Resolve and verify the current development step before creating a Git checkpoint.

## 8. Development Roadmap

The roadmap below reflects the progress reported so far. Statuses must be checked against the actual repository and acceptance criteria before being changed to complete.

### Phase 1 — Environment Verification

- Verify the development environment.
- Check required tooling and prerequisites.

**Status:** Previously completed according to project progress.

### Phase 2 — Git and Project Foundation

- Review repository structure and Git configuration.
- Maintain `.gitignore`.
- Maintain `README.md` and `CHANGELOG.md`.
- Review the initial project foundation.
- Verify the current working tree and relevant documentation.

**Status:** In progress; final foundation review and documentation verification remain.

### Phase 3 — React and Design System

- Establish the React/Vite frontend.
- Establish shared styling and reusable UI components.
- Build responsive frontend foundations.
- Apply TeeCraft branding.
- Centralize frontend API communication.

**Status:** Frontend implementation, lint, and production build were reported as verified in prior project work. Review current files before making further claims.

### Phase 4 — Express and MongoDB Foundation

- Establish the Express backend.
- Configure environment handling.
- Configure CORS and security headers.
- Connect to MongoDB using Mongoose.
- Provide a health endpoint.
- Handle HTTP server and database shutdown.

**Status:** Core implementation is present. The health endpoint, MongoDB connection, and direct-run shutdown have been reported as verified. Nodemon shutdown output has previously stopped before its final database-disconnection messages; investigate if the behaviour recurs.

### Phase 5 — Shared UI and Application Layout

- Establish application layouts.
- Establish shared navigation.
- Establish reusable page structures.
- Establish reusable forms and UI components.
- Verify responsive behaviour and accessibility.

**Status:** Partially implemented according to prior project work. Full completion of the Phase 5 acceptance criteria has not been confirmed in the current review.

### Phase 6 — Authentication and Authorization

- Establish the MongoDB User model.
- Define customer, staff, admin, and developer roles.
- Implement customer-only public registration.
- Implement login and logout.
- Implement secure authentication cookies and token handling.
- Implement CSRF and trusted-origin protections.
- Implement password recovery.
- Implement account-status enforcement.
- Implement reusable server-side role-authorization middleware.
- Verify authentication, authorization, and failure cases.

**Status:** In progress. The authentication foundation, password recovery, rate limiting, account-status enforcement, and associated automated tests have been implemented. The latest reported full backend test suite passed 79 tests with no failures. Final review against the master specification and documentation reconciliation remain.

Business-endpoint authorization must also be verified as the relevant business modules are implemented. Those business endpoints are not yet covered by the current Phase 6 verification.


### Phase 7 — Profiles and Dashboards

- Implement customer profiles.
- Implement appropriate staff and administrative dashboards.
- Enforce role and permission boundaries.
- Protect customer information.

**Status:** In progress. The customer dashboard layout, protected dashboard access, and self-service profile name update have been implemented. The profile update is authenticated, CSRF-protected, validated on the server, restricted to the permitted name field, and verified to persist in MongoDB. Remaining work includes assessing and implementing appropriate staff and administrative dashboards and completing the phase's role and permission-boundary review.

### Phase 8 — Central Administration and User Management

- Implement administrative user management.
- Implement staff and customer management.
- Enforce account-status and permission rules.
- Protect sensitive administrative operations.
- Maintain suitable audit records.

**Status:** Planned.

### Phase 9 — Products, Categories, and Media

- Implement product and category management.
- Implement product variants and SKU handling.
- Implement secure media management.
- Implement product customization settings.
- Preserve relevant product information in business records.

**Status:** Planned.

### Phase 10 — Cart, Wishlist, Enquiries, and Quotations

- Implement cart and wishlist functionality.
- Implement customer enquiries.
- Implement quotation workflows.
- Validate all important calculations on the backend.

**Status:** Planned.

### Phase 11 — Artwork, Orders, and Production

- Implement artwork submission and review.
- Implement customer approval workflows.
- Implement order management.
- Implement production stages, quality control, dispatch, and delivery tracking.

**Status:** Planned.

### Phase 12 — Inventory, Suppliers, Invoices, and Payment Records

- Implement inventory and stock movement records.
- Implement supplier management.
- Implement invoice records.
- Implement payment records.
- Enforce data integrity and authorization.

**Status:** Planned.

### Phase 13 — Excel/CSV Imports and PDF/Excel Exports

- Implement validated data imports.
- Provide preview and confirmation.
- Detect duplicates and handle errors safely.
- Implement authorized PDF and Excel exports.

**Status:** Planned.

### Phase 14 — FAQs, Testimonials, Feedback, Social Links, and Analytics

- Implement business content management.
- Implement moderated testimonials and customer feedback.
- Implement social links.
- Add appropriate reporting and analytics.

**Status:** Planned.

### Phase 15 — Differentiating Features

Implement additional business features only after their requirements, value, security implications, and maintenance costs have been reviewed.

**Status:** Planned.

### Phase 16 — Restricted Developer Tools

- Implement narrowly restricted developer diagnostics.
- Keep Developer permissions separate from Admin permissions.
- Prevent public registration or ordinary administrative actions from granting Developer privileges.

**Status:** Planned.

### Phase 17 — Optional Integrations

Evaluate and implement approved integrations such as email, WhatsApp, chatbot, or AI-assisted capabilities.

**Status:** Planned.

### Phase 18 — Integration Testing, Security, Deployment, and Documentation

- Complete integration and end-to-end testing.
- Review security and authorization boundaries.
- Verify production configuration.
- Prepare deployment.
- Complete technical and user-facing documentation.

**Status:** Planned.

## 9. Repository Structure

The following is a simplified view of the reported project layout, not a complete file listing. Verify it against the actual repository before using it as a definitive inventory.

```text
sublimation-custom-printing/
├── sublimation-client/
│   └── React + Vite frontend
├── sublimation-server/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── dns.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── README.md
├── CHANGELOG.md
└── .gitignore
```

Keep frontend and backend responsibilities separate. Add folders and modules incrementally when required by the current development step; do not create unnecessary structure in advance.

## 10. Environment Variables and Secrets

Real credentials must remain in local environment configuration or an appropriate secret-management system. Never commit them or include them in documentation, logs, screenshots, or support messages.

Examples of sensitive values include:

- MongoDB connection strings and passwords.
- Authentication secrets.
- API keys.
- Email credentials.
- Third-party integration credentials.

Commit safe environment templates such as `.env.example` when appropriate, using placeholders or non-sensitive local-development examples rather than real credentials. Confirm `.gitignore` protects local `.env` files.

### Backend configuration

The backend source references these environment variables:

- `PORT`
- `CLIENT_ORIGIN`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

The backend database configuration requires `MONGO_URI`. It passes the configured URI to Mongoose and throws an error if the variable is missing.

The root `.env.example` includes this local-development example:

```env
# MongoDB connection string (local development)
MONGO_URI=mongodb://127.0.0.1:27017/teecraft
```

This example does not establish that MongoDB is installed, running, or connected. If MongoDB Atlas is used, configure the actual connection string locally and never commit credentials.

The password-reset email service also requires suitable SMTP configuration when email delivery is enabled. SMTP credentials must remain private and must not be added as real values to the repository.

The development DNS resolver workaround should only remain enabled where required. Review its security and deployment implications before production use.

## 11. Current Verification Status

This section records reported progress, not a substitute for rerunning checks against the current working tree.

### Environment

- Windows development environment — previously verified.
- Node.js and npm — previously verified.
- Git and VS Code — previously verified.

### Frontend

- React/Vite frontend — implemented.
- Reusable UI components — implemented in prior work.
- Centralized API service — implemented in prior work.
- Lint and production build — reported passed in prior work.
- Frontend-to-backend health integration — previously reported successful.

### Backend foundation

- Express application and server entry point — implemented.
- CORS and Helmet configuration — previously verified.
- `GET /api/health` — previously returned HTTP 200 with the expected JSON response.
- MongoDB connection — successful connection reported in terminal output.
- Direct `node src/server.js` startup — verified in reported output.
- Direct-run graceful shutdown — verified, including HTTP server closure and MongoDB disconnection.
- `npm run dev` shutdown — follow-up diagnostic may be needed if final database-disconnection messages remain absent.

### Authentication and authorization

- MongoDB User model — implemented.
- Customer-only public registration — implemented.
- JWT authentication using HTTP-only cookies — implemented.
- CSRF protection and trusted-origin validation — implemented.
- Token-version-based session revocation on logout — implemented.
- Reusable server-side role-authorization middleware — implemented.
- Forgot-password and reset-password endpoints — implemented.
- Cryptographically random password-reset tokens stored as SHA-256 hashes — implemented.
- Password-reset token expiry — 15 minutes.
- Generic password-reset request response for known and unknown email addresses — implemented.
- Separate password-reset request and submission rate limiters — implemented.
- Password reset invalidates existing sessions through token-version increment — implemented.
- Inactive and suspended account rejection during login — tested.
- Inactive and suspended account rejection by authentication middleware — tested.
- Latest reported full backend test suite — 79 passed, 0 failed.
- Authenticated customer profile endpoint — implemented and integration-tested.
- Profile updates require authentication and a valid CSRF token.
- Profile updates accept only the permitted name field; role and other unsupported fields are rejected.
- Profile name update — verified through the frontend, backend, and MongoDB persistence.
- Backend dependency audit — 0 vulnerabilities reported after the Nodemon dependency update.

The test result above reflects the latest reported test run. Rerun the suite before treating it as verification of any subsequently modified working tree.

### Git and documentation

- Git repository and branch — verify against the current local repository.
- README and changelog — update and review as development progresses.
- Initial commit — not confirmed; do not assume one exists.
- Staging or committing changes — requires explicit project-owner approval.

### Not yet implemented or not verified here

- Full business-module implementation.
- Authorization tests for future business endpoints.
- Complete administrative user-management workflows.
- Production deployment.
- End-to-end test coverage for the complete application.
- Complete Nodemon shutdown behaviour, unless subsequently verified.

## 12. Documentation

- `README.md` — project overview, architecture, security principles, roadmap, setup information, and current status.
- `CHANGELOG.md` — record of implemented changes and reported verification results.
- `PROJECT_MASTER_SPECIFICATION` — primary requirements and development guidance.

Keep these documents consistent with the actual repository and observed test results. If a status is uncertain, state that it needs verification instead of assuming completion.

---

**Development principle:** Build TeeCraft incrementally, verify each step, preserve existing work, and obtain explicit approval before staging or committing changes.