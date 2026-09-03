# Bot Development Rules

## 1. Tech Stack & Architecture

- Runtime: Node.js service with a Discord bot entrypoint in `src/index.js`.
- Discord integration: `discord.js` v14, using slash commands, event listeners, and interaction handlers.
- Command/event structure:
  - Slash commands live under `src/commands`.
  - Bot events live under `src/events` by event name.
  - Startup registration is handled centrally in `src/utils/registerCommands.js`.
- Data layer: MongoDB via Mongoose models in `src/models`.
- Background automation: scheduled jobs in `src/jobs` using `node-cron`, started during bot startup.
- Web dashboard: Express + EJS in `src/web` and `views/`, with session-based auth and protected routes.
- Frontend assets: static files under `public/`, with styling centralized in `public/css/style.css`.
- Configuration: environment variables are loaded from a `.env`-style setup such as `bsp.env` via `dotenv`.
- Reusable logic: helper functions and Discord-specific utilities live in `src/utils`.

## 2. Coding Standards & Formatting

- Use CommonJS modules (`require` / `module.exports`) consistently; this codebase does not use ES modules.
- Follow the existing folder layout exactly:
  - `src/commands`
  - `src/events`
  - `src/jobs`
  - `src/models`
  - `src/utils`
  - `src/web`
  - `views/`
  - `public/`
- Keep each file single-purpose and focused. Avoid mixing unrelated responsibilities in one module.
- Command modules should export `data` and `run`.
- Event modules should export `name`, `once` (optional), and `run`.
- Use `async/await` instead of callback-heavy patterns; prefer early returns for guard clauses.
- Use camelCase for JavaScript identifiers and lower-case file names in the project style.
- Keep formatting aligned with the codebase: 2-space indentation, single quotes for strings, semicolons, and trailing commas in multi-line objects.
- User-facing text should normally be in German, matching the server/community language and current bot messaging patterns.
- Avoid hardcoded secrets, IDs, or role/channel values. Use `process.env.*` or config objects.
- Logging is expected for operational events, error states, and debug flows; do not silently swallow exceptions.
- EJS templates should stay thin and declarative. Pass data explicitly from route handlers and keep business logic out of the template layer.
- Reuse existing CSS classes and dashboard structure rather than inventing ad hoc styling patterns.

## 3. Best Practices

- Add new Discord features in the correct subsystem instead of creating isolated one-off scripts.
- Register new slash commands via the existing command registry flow; do not bypass `src/utils/registerCommands.js`.
- Prefer extending existing utilities under `src/utils` before creating parallel helper implementations.
- Treat database writes as centralized Mongoose operations and keep query logic close to the relevant model or service helper.
- Before adding business logic in routes, check whether an existing helper, job, or utility already covers the task.
- Keep scheduled jobs idempotent and safe to restart; avoid duplicate state changes or repeated side effects.
- Guard all sensitive actions behind permission checks, role checks, and channel validation before writing to the database or sending Discord messages.
- Prefer graceful, user-friendly Discord responses over raw stack traces or unhandled errors.
- For dashboard routes, rely on session checks and route-level protections instead of trusting user input.
- If the feature introduces configuration requirements, update the sample env file (`bsp.env`) and relevant startup or route logic in the same change.
- Keep code readable and maintainable: small functions, explicit parameter names, and clear separation between Discord logic, database logic, and UI rendering.

## 4. Practical Rules for Future Changes

- Match the project’s existing patterns before introducing new abstractions.
- Keep feature work aligned with the bot’s architecture: command/event/job/model/web route.
- Prefer compatibility with the current Mongo + Discord + Express stack over introducing unrelated frameworks.
- When in doubt, follow the existing implementation style in the closest matching module rather than inventing a new convention.
- The goal is a maintainable community bot: predictable file placement, consistent naming, safe database handling, and clear Discord UX.
