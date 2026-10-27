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
  `{"success":true,"message":"TeeCraft API is running"}`.
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
- Documented server-side authorization and validation requirements for future application modules.

### Documentation

- Established `README.md` as the project overview and development-status document.
- Established `CHANGELOG.md` as the chronological record of project changes.
- Documented the development roadmap and verification requirements.
- Documented that unverified functionality must not be represented as complete.

## Planned

- Complete the Git and project foundation review.
- Review the current working tree and verify the documentation changes.
- Investigate Nodemon shutdown behaviour if the incomplete output remains reproducible.
- Review the frontend and backend against the applicable master specification.
- Continue the approved development roadmap one step at a time.
- Implement authentication and authorization when the required foundations are reviewed.
- Implement business modules incrementally according to `PROJECT_MASTER_SPECIFICATION`.
- Add suitable automated tests as each development step requires.
- Update this changelog as new functionality is implemented and verified.

---

## Verification Notes

- Verification entries are based on reported terminal output and prior project progress.
- A previously successful check does not guarantee that the current working tree still passes it.
- Nodemon shutdown remains a follow-up item unless its complete shutdown behaviour is verified.
- No Git commit is claimed by this changelog.
- Planned functionality is not represented as implemented functionality.
