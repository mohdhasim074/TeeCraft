
# TeeCraft — Sublimation & Custom Printing Business Platform

**Tagline:** Wear Your Ideas

A MERN-based business management platform for a sublimation and custom printing business. TeeCraft is being developed incrementally, with a focus on maintainability, security, usability, and reliable business workflows.


> **Project status:** Foundation implementation in progress
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
| --- | --- |
| Brand name | TeeCraft |
| Tagline | Wear Your Ideas |
| Brand personality | Creative, simple, dependable |
| Logo concept | Minimal T-shirt combined with the letter T |
| Logo style | Flat, scalable, recognisable |
| Primary colour | Charcoal `#191919` |

The website frontend should apply this identity consistently across its header, homepage, buttons, navigation, and responsive layouts.

## 3. Technology Stack

| Layer | Technology |
| --- | --- |
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
MongoDB Atlas
```

The frontend and backend are maintained as separate applications within the same repository. The backend is responsible for API validation, business rules, authentication, authorization, and data access. The frontend must not be treated as a trusted authority for permissions, pricing, stock, or other critical business values.

Microservices and unnecessary infrastructure should not be introduced without a clear requirement.

## 5. Planned Functional Areas

The following areas describe the intended platform scope. They are not claims that these features have already been implemented.

### 5.1 Products and Customization

- Product catalogue and product details
- Custom printing options
- Product media and artwork
- Product-specific customization requirements
- Customer design submission workflows

### 5.2 Customers and Accounts

- Customer accounts
- Staff and administrative accounts
- Authentication
- Role-based authorization
- Customer-related business records

### 5.3 Shopping and Orders

- Cart and wishlist
- Checkout workflows
- Order creation and tracking
- Backend-authoritative pricing and totals
- Stock-aware business rules

### 5.4 Artwork and Production

- Artwork submission
- Artwork review
- Customer approval workflows
- Production status tracking

### 5.5 Inventory

- Inventory records
- Stock management
- Inventory validation and business rules
- Data import and export

### 5.6 Business Operations

- Enquiries
- Quotations
- Order management
- Financial records
- Business reporting

### 5.7 Content and Communication

- FAQs and testimonials
- Social links
- Business-facing content
- Analytics-related capabilities

### 5.8 Data Import and Export

- CSV and Excel imports
- Import validation
- PDF exports
- Excel exports

### 5.9 Optional Integrations

Potential later integrations include email, WhatsApp, chatbot functionality, and AI/image-generation-related features. They must remain out of scope until their requirements and development stage are reached.

## 6. Security Principles

Security and data integrity are core requirements, not optional finishing tasks.

The application must:

- Enforce authorization on the server for protected operations.
- Never trust client-provided roles, permissions, prices, totals, or stock quantities.
- Validate and sanitize untrusted input.
- Keep credentials and secrets out of version control.
- Use environment variables for local configuration where appropriate.
- Handle file uploads securely.
- Protect administrative functionality.
- Apply appropriate authentication and session/token security.
- Preserve important business records and use deliberate deletion policies.
- Use suitable error handling without leaking secrets or sensitive internal details.
- Consider auditability for important business operations.
- Review security implications during each implementation step.

## 7. Development Rules

Development must proceed one step at a time.

Each step should:

1. Define its objective and prerequisites.
2. Inspect relevant existing files before modifying them.
3. Make only the changes required for that step.
4. Explain implementation decisions in beginner-friendly language.
5. Run appropriate syntax checks, linting, builds, or tests.
6. Investigate failures rather than assuming success.
7. Review relevant security and configuration implications.
8. Update documentation when appropriate.
9. Wait for explicit approval before staging or committing changes.

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

## 8. Development Roadmap

The roadmap below reflects the progress reported so far. Verify local files and command output before changing a status to complete.

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

**Status:** Frontend implementation, lint, and production build have been reported as verified in prior project work. Review current files before making further claims.

### Phase 4 — Express and MongoDB Foundation

- Establish the Express backend.
- Configure environment handling.
- Configure CORS and security headers.
- Connect to MongoDB Atlas using Mongoose.
- Provide a health endpoint.
- Handle HTTP server and database shutdown.

**Status:** Core implementation is present. The health endpoint, MongoDB connection, and direct-run shutdown have been reported as verified. Nodemon shutdown output has previously stopped before its final database-disconnection messages; investigate if the behavior recurs.

### Phase 5 — Shared UI and Application Layout

- Establish application layouts.
- Establish shared navigation.
- Establish reusable page structures.
- Verify responsive behaviour and accessibility.

**Status:** Planned; inspect the specification and current application before starting.

### Phase 6 — Authentication and Authorization

- Establish authentication foundations.
- Implement role-based access control.
- Protect frontend routes where applicable.
- Protect backend APIs.
- Verify authorization boundaries and failure cases.

**Status:** Planned; do not begin until the preceding foundations and requirements are reviewed.

### Later Development

Implement the remaining business modules in the order defined by `PROJECT_MASTER_SPECIFICATION`. Introduce optional integrations only when their requirements are approved and the appropriate development stage is reached.

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
│   │   └── config/
│   │       ├── database.js
│   │       └── dns.js
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

- MongoDB connection strings and passwords
- Authentication secrets
- API keys
- Email credentials
- Third-party integration credentials

Commit safe environment templates such as `.env.example` when appropriate, using placeholders rather than real values. Confirm `.gitignore` protects local `.env` files.

### Backend configuration

The backend currently uses environment variables including:

- `PORT`
- `CLIENT_ORIGIN`
- `NODE_ENV`
- `MONGO_URI`

The exact values belong in the local environment configuration, not this README.

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

### Backend

- Express application and server entry point — implemented.
- CORS and Helmet configuration — previously verified.
- `GET /api/health` — previously returned HTTP 200 with the expected JSON response.
- MongoDB Atlas connection — successful connection reported in terminal output.
- Direct `node src/server.js` startup — verified in reported output.
- Direct-run graceful shutdown — verified, including HTTP server closure and MongoDB disconnection.
- `npm run dev` shutdown — follow-up diagnostic may be needed if final database-disconnection messages remain absent.

### Git and documentation

- Git repository and branch — verify against the current local repository.
- README and changelog — update and review as development progresses.
- Initial commit — not confirmed; do not assume one exists.
- Staging or committing changes — requires explicit project-owner approval.

### Not yet implemented or not verified here

- Authentication and authorization
- Business modules
- Production deployment
- End-to-end test coverage for the complete application

## 12. Documentation

- `README.md` — project overview, architecture, security principles, roadmap, and current status.
- `CHANGELOG.md` — chronological record of implemented changes and verified milestones.
- `PROJECT_MASTER_SPECIFICATION` — primary requirements and development guidance.

Keep these documents consistent with the actual repository and observed test results. If a status is uncertain, state that it needs verification instead of assuming completion.

---

**Development principle:** Build TeeCraft incrementally, verify each step, preserve existing work, and obtain explicit approval before staging or committing changes.
