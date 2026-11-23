# Changelog

All notable changes to the TeeCraft Sublimation & Custom Printing Business Platform will be documented in this file.

This project follows an incremental development process. Entries record implemented work and reported verification results. Planned work is listed separately and must not be treated as completed.

## [Unreleased]

### Project Foundation

- Established the project repository and initial documentation structure.
- Recorded the project requirements source as `PROJECT_MASTER_SPECIFICATION`.
- Documented the incremental development workflow and verification terminology.
- Documented the rule requiring explicit approval before Git staging or commits.
- Recorded the React, Node.js, Express, and MongoDB technology stack.
- Maintained the project as a modular monolithic application.

### Brand Identity

- Recorded the brand name: TeeCraft.
- Recorded the primary tagline: Wear Your Ideas.
- Documented the brand personality: creative, simple, and dependable.
- Recorded the minimal T-shirt and letter T logo concept.
- Recorded the primary charcoal colour: `#191919`.
- Documented the requirement to apply consistent branding across the website frontend.

### Frontend

- Established the React/Vite frontend foundation.
- Implemented reusable UI components in prior development work.
- Added centralized frontend API communication using the Fetch API.
- Configured the frontend API base URL through `VITE_API_BASE_URL`.
- Recorded successful frontend lint and production build checks reported in prior work.
- Recorded a previously successful frontend-to-backend health integration check.

### Backend

- Established the Express backend application and server entry point.
- Added environment configuration using dotenv.
- Configured CORS for the expected frontend origin.
- Added Helmet security headers.
- Implemented the `GET /api/health` endpoint.
- Added Mongoose-based MongoDB connection and disconnection helpers.
- Added startup validation for required backend configuration.
- Added HTTP server and database shutdown handling.
- Added a development DNS resolver workaround to address the reported Atlas SRV DNS lookup problem.

### Database and API Verification

- Recorded successful MongoDB Atlas connection output during backend startup.
- Recorded a successful health endpoint response with HTTP `200 OK`.
- Recorded the expected health response:

  ```json
  {
    "success": true,
    "message": "TeeCraft API is running"
  }
  ```

- Recorded successful direct-run shutdown, including HTTP server closure and MongoDB disconnection.

### Shutdown Follow-up

- Direct execution using `node src/server.js` completed graceful shutdown successfully in the reported terminal output.
- The `npm run dev` shutdown output previously stopped at `Closing MongoDB connection...`.
- The exact cause of the difference between direct execution and Nodemon execution has not been established.
- Do not mark Nodemon graceful shutdown as fully verified until its complete shutdown output or equivalent process-exit behaviour is confirmed.

### Security and Configuration

- Documented the requirement to keep environment secrets out of version control.
- Documented the use of safe environment templates with placeholder values.
- Recorded the need to review the development DNS workaround before production use.
- Documented server-side authorization and validation requirements for application modules.
- Added a local-development MongoDB connection example to the root `.env.example`:

  `MONGO_URI=mongodb://127.0.0.1:27017/teecraft`

- Confirmed that the backend database configuration reads `MONGO_URI` and throws an error when it is not configured.
- Confirmed that the backend source references `CLIENT_ORIGIN`, `JWT_EXPIRES_IN`, `JWT_SECRET`, `MONGO_URI`, `NODE_ENV`, and `PORT`.

### Phase 6 — Authentication and Authorization

#### User model and account roles

- Added the foundational MongoDB User model.
- Defined four account roles: customer, staff, admin, and developer.
- Added account-status fields for active, inactive, and suspended accounts.
- Added a unique email index.
- Excluded password hashes from ordinary user queries and JSON serialization.
- Added token-version support for account-wide session invalidation.

#### Registration and authentication

- Implemented customer-only public registration.
- Prevented public registration from assigning privileged roles.
- Added password hashing using Argon2id.
- Added JWT authentication with HTTP-only cookies.
- Added CSRF protection and trusted-origin validation.
- Added access-token lifetime validation and token-generation safeguards.
- Implemented account-wide JWT revocation through token versioning on logout.
- Added reusable server-side role-authorization middleware.
- Kept authorization decisions dependent on the current database user role rather than trusting a role supplied by the client or JWT.

#### Password recovery

- Implemented the forgot-password endpoint.
- Implemented the reset-password endpoint.
- Added cryptographically random password-reset tokens.
- Stored password-reset token hashes using SHA-256 rather than storing the raw reset token.
- Configured password-reset tokens to expire after 15 minutes.
- Added a generic password-reset request response to avoid revealing whether an email address belongs to an account.
- Restricted password-reset processing to eligible active accounts.
- Added an email service for password-reset delivery.
- Added cleanup of reset-token fields when email delivery fails.
- Implemented atomic validation and consumption of reset tokens.
- Incremented the account token version after a successful password reset to invalidate existing authenticated sessions.

#### Rate limiting and account status

- Added separate rate limiters for password-reset requests and password-reset submissions.
- Added integration tests for password-reset rate limiting.
- Enforced account status during login.
- Rejected login attempts for inactive accounts.
- Rejected login attempts for suspended accounts.
- Enforced account status in authentication middleware.
- Rejected existing authenticated sessions when an account becomes inactive or suspended.

#### Automated tests and reported verification

- Added automated tests for permitted roles, forbidden access, missing authentication, and invalid role configuration.
- Added an integration test confirming that public registration cannot assign the developer role.
- Added integration tests for the combined authentication and role-authorization middleware.
- Added password-reset integration tests.
- Added password-reset rate-limiter tests.
- Added login integration tests for inactive and suspended accounts.
- Added authorization integration tests for inactive and suspended accounts with existing access tokens.
- Verified the focused authentication integration test suite: 12 passed.
- Verified the focused authorization integration test suite: 9 passed.
- Verified the complete backend test suite in the latest reported run: **66 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo**.
- The password-reset email delivery failure message observed during tests was expected because SMTP was not configured for the test environment; the relevant failure-cleanup behaviour was tested.
- Resolved the reported Mongoose deprecation warning by using `returnDocument: "after"` instead of the deprecated `new: true` option.

#### Remaining Phase 6 work

- Complete the final Phase 6 security and configuration review.
- Review authentication and authorization against the applicable master specification.
- Verify frontend/backend authentication integration against the current working tree.
- Review account-management security requirements before implementing administrative account-management workflows.
- Verify authorization on actual business endpoints as those endpoints are introduced.
- Implement controlled Developer account provisioning and restricted Developer-only routes at the appropriate roadmap stage.

The current test coverage verifies authentication, password recovery, account-status enforcement, and reusable authorization middleware. It does not establish that future business endpoints have already been implemented or protected.

### Phase 7 — Profiles and Dashboards

- Implemented the protected customer dashboard layout and navigation.
- Implemented customer self-service profile name editing.
- Added the authenticated `PATCH /api/auth/me` endpoint.
- Protected profile updates with authentication and CSRF validation.
- Restricted profile updates to the permitted `name` field.
- Added server-side profile-name validation.
- Verified that profile updates persist in MongoDB.
- Added five profile-update integration tests covering authentication, CSRF, persistence, unsupported fields, and invalid names.
- Latest reported backend test result: 79 passed, 0 failed.
- Staff and administrative dashboards and the remaining role/permission review are still outstanding.

### Dependency maintenance

- Updated backend Nodemon to version 3.1.11.
- Verified the installed Nodemon dependency tree uses minimatch 3.1.5.
- Backend `npm audit` reported 0 vulnerabilities after the update.

### Phase 8 — Central Administration

- Implemented the first read-only Admin user-management API endpoint: `GET /api/admin/users`.
- Protected the endpoint with authentication and Admin-role authorization.
- Added user search by name and email.
- Added role and account-status filters.
- Added pagination with a maximum page size of 100.
- Excluded Developer accounts from the Admin user list.
- Restricted returned account fields to safe user information.
- Added integration tests for authentication, authorization, search, filtering, pagination, validation, and private-field exclusion.
- Verification: 79 backend tests passed; 0 failed.
- Admin user-list frontend implemented and browser-verified.
- Role editing, account-status management, and related administrative security controls remain outstanding for Phase 8.4.

### Documentation

- Established `README.md` as the project overview and development-status document.
- Established `CHANGELOG.md` as the chronological record of project changes.
- Documented the development roadmap and verification requirements.
- Documented that unverified functionality must not be represented as complete.
- Updated the README roadmap to reflect reported progress through Phase 6.
- Updated README progress documentation to reflect verified customer dashboard and profile work in Phase 7.
- Updated the README environment documentation to include the required `MONGO_URI` configuration.
- Updated the Phase 6 changelog to include password recovery, rate limiting, account-status enforcement, and the latest reported test result.

## Planned

- Complete the Git and project foundation review.
- Review the current working tree and verify documentation changes.
- Reconcile Phase 5 acceptance criteria with the actual frontend implementation.
- Complete the Phase 6 final review against `PROJECT_MASTER_SPECIFICATION`.
- Recheck the backend test suite against the current working tree before declaring Phase 6 complete.
- Verify frontend/backend authentication integration.
- Investigate Nodemon shutdown behaviour if the incomplete output remains reproducible.
- Review the frontend and backend against the applicable master specification.
- Continue the approved development roadmap one step at a time.
- Implement account-management security and administrative workflows at the appropriate roadmap stage.
- Verify authorization on actual business endpoints as those endpoints are implemented.
- Implement business modules incrementally according to `PROJECT_MASTER_SPECIFICATION`.
- Add suitable automated tests as each development step requires.
- Update this changelog as new functionality is implemented and verified.

---

## Verification Notes

- Verification entries are based on reported terminal output and prior project progress.
- The latest reported complete backend test run passed 79 tests with 0 failures.
- That historical result does not guarantee that the current working tree still passes.
- Rerun relevant checks before treating earlier results as current verification.
- Nodemon shutdown remains a follow-up item unless its complete shutdown behaviour is verified.
- The local-development MongoDB URI in `.env.example` is an example, not confirmation that a local MongoDB server is installed or running.
- Real database credentials, JWT secrets, SMTP credentials, and other sensitive values must not be committed.
- No Git commit is claimed by this changelog.
- No staging or commit is authorized by this documentation update.
- Planned functionality is not represented as implemented functionality.
