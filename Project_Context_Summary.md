# Product Development Context — Misc Apps (Next.js + MongoDB)

## 1) Executive Summary
This project is a full-stack Next.js App Router application that combines multiple business modules into one authenticated product shell:
- Authentication + session management
- User profile management
- Bookmarks manager
- Recipes manager
- Chat assistant UI with persisted history
- Auth users admin-style listing and CRUD
- API documentation via Swagger UI

It uses cookie-based JWT auth, MongoDB (Mongoose), Redux Toolkit for client state, and React Bootstrap for UI.

---

## 2) Product Modules (Current Scope)

### Authentication
- Unified auth page with Login/Signup tabs (`/auth`)
- APIs:
  - `POST /api/auth/login`
  - `POST /api/auth/signup`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `POST /api/auth/change-password`
- Session token stored in `token` HttpOnly cookie (7 days)

### Profile
- My Profile page (`/profile`)
- Profile image update (URL-based, uploaded via Firebase on client)
- Password change workflow (current/new/confirm)
- API:
  - `PUT /api/profile/update-profile-pic`

### Bookmarks
- Bookmark list + CRUD UIs with pagination/search in app layer
- APIs:
  - `GET /api/bookmarks`
  - `POST /api/bookmarks`
  - `PUT /api/bookmarks/[id]`
  - `DELETE /api/bookmarks/[id]`
- Auto thumbnail enrichment through Microlink utility

### Recipes
- Recipe list/add/edit/delete for authenticated user
- APIs:
  - `GET /api/recipes` (user-scoped)
  - `POST /api/recipes` (user-scoped)
  - `PUT /api/recipes/[id]` (ownership-validated)
  - `DELETE /api/recipes/[id]` (ownership-validated)
- Seed utility added for product/demo data generation:
  - `npm run seed:recipes -- <userId>`

### Chat Assistant
- Page: `/chatapp`
- Features:
  - Persisted chat history
  - Quick options (now submit immediately on click)
  - Bookmark responses rendered as clickable links
  - Show-more/show-less for large bookmark result sets
- APIs:
  - `GET /api/chat/history`
  - `POST /api/chat/save`

### Auth Users
- Page: `/authusers`
- APIs:
  - `GET /api/authusers` (paginated + search)
  - `POST /api/authusers`
  - `PUT /api/authusers/[id]`
  - `DELETE /api/authusers/[id]`

### API Docs
- Page: `/docs`
- API spec endpoint: `GET /api/docs`
- Swagger generated from route annotations and `lib/swagger.ts`

---

## 3) Frontend Architecture

### Framework and Rendering
- Next.js App Router (`app/`)
- Client-heavy pages (`"use client"` on interactive screens)
- Root route (`/`) performs auth restore and redirects to `/recipes` or `/auth`

### State Management
- Redux Toolkit store slices:
  - `auth`
  - `recipes`
  - `authUsers`
  - `bookmarks`
- Session restoration triggered in `store/providers.tsx`

### UI System
- React Bootstrap + custom CSS modules
- Shared header nav with auth-aware links
- Toast notification context via `ToastProvider`
- Form validation with `react-hook-form` + `yup`

### Frontend Functional Notes
- Protected pages currently enforce auth primarily via client-side checks (`router.push("/auth")`)
- Chat UI now supports structured bookmark rendering with external links opened in new tab

---

## 4) Backend Architecture

### API Layer
- Next.js Route Handlers under `app/api/**/route.ts`
- JSON request/response contract
- Cookie-based auth for protected endpoints

### Data Layer
- MongoDB via Mongoose
- Shared connection helper: `lib/mongodb.ts`

### Security
- JWT signing/verification using `jose`
- Password hashing with `bcryptjs`
- Cookie flags:
  - `httpOnly: true`
  - `sameSite: "strict"`
  - `secure` in production

### Access Control Pattern
- `getSessionUser()` resolves current authenticated user from cookie token
- Recipes APIs enforce ownership on update/delete
- Several modules require auth but not all are consistently user-scoped yet (see gaps)

---

## 5) Data Model Inventory (Actual)

### `AuthUser` (`models/User.ts`)
- `name` (required)
- `email` (required, unique)
- `password` (required, excluded by default)
- `profilepic` (optional)
- `createdAt`, `updatedAt` (timestamps)

### `Bookmark` (`models/Bookmark.ts`)
- `title` (required)
- `link` (required)
- `description` (optional)
- `category` (optional)
- `thumbnail` (optional)
- `favorite` (default: `false`)
- `createdAt`, `updatedAt` (timestamps)

### `Recipe` (`models/Recipe.ts`)
- `name`
- `description`
- `imagePath`
- `ingredients[]` (`name`, `amount`)
- `createdBy` (required ObjectId ref: `AuthUser`)
- `createdAt`, `updatedAt` (timestamps)

### `ChatHistory` (`models/ChatHistory.ts`)
- `userId` (ObjectId)
- `messages[]` (`sender`, `text`, `time`)

### `Item` (`models/Item.ts`)
- Generic item model (`name`, `description`) for extensibility/testing

---

## 6) API Contract Snapshot (Product Use)

### Auth
- `POST /api/auth/signup` → register + set token cookie
- `POST /api/auth/login` → authenticate + set token cookie
- `POST /api/auth/logout` → clear token cookie
- `GET /api/auth/me` → get current user session
- `POST /api/auth/change-password` → update password for authenticated user

### Profile
- `PUT /api/profile/update-profile-pic` → update current user profile image URL

### Bookmarks
- `GET /api/bookmarks` → list bookmarks (currently global collection read)
- `POST /api/bookmarks` → create bookmark
- `PUT /api/bookmarks/[id]` → update bookmark by ID
- `DELETE /api/bookmarks/[id]` → delete bookmark by ID

### Recipes
- `GET /api/recipes` → list current user recipes
- `POST /api/recipes` → create recipe for current user
- `PUT /api/recipes/[id]` → update recipe (ownership validated)
- `DELETE /api/recipes/[id]` → delete recipe (ownership validated)

### Chat
- `GET /api/chat/history` → user chat history
- `POST /api/chat/save` → append message to user chat history

### Auth Users
- `GET /api/authusers?page=&limit=&q=` → paginated searchable users
- `POST /api/authusers` → create user
- `PUT /api/authusers/[id]` → update user
- `DELETE /api/authusers/[id]` → delete user

### Docs
- `GET /api/docs` → OpenAPI JSON

---

## 7) Current Productization Gaps (Important)

1. **Server-side route protection is partial**
   - `middleware.ts` matcher only includes `/dashboard/*` and `/profile/*`.
   - Other protected pages rely mostly on client-side redirects.

2. **Missing/partial feature endpoints**
   - `forgot-password` UI exists and calls `/api/auth/forgot-password`, but this API route is not present.
   - Chat expects recipe random suggestion path in UX flows; no `GET /api/recipes/random` route exists currently.

3. **Multi-tenant/user scoping inconsistency**
   - `recipes` and `chat` are user scoped.
   - `bookmarks` endpoints currently are not user scoped (no `createdBy/userId` filter in model/routes).

4. **Authorization model**
   - `authusers` endpoints require auth but do not enforce role/permission checks (admin vs standard user).

5. **Validation standardization**
   - Validation is present in several flows, but not uniformly centralized across all APIs.

6. **Observability and test coverage**
   - No clear automated test suite structure documented for API/business flows.

---

## 8) Recommended Product Development Roadmap

### Phase 1 — Security and Consistency (High Priority)
- Expand middleware matcher to protect all authenticated routes.
- Add role-based authorization for `authusers` management.
- Add/standardize request validation schemas for all API routes.
- Implement missing `forgot-password` API flow or remove placeholder UI.

### Phase 2 — Data Isolation and Domain Hardening
- Add `createdBy/userId` to bookmarks model and filter CRUD by current user.
- Add `GET /api/recipes/random` (user-scoped) to complete chat recipe intent.
- Standardize API response shape (`{ data, meta, error }`) for frontend simplicity.

### Phase 3 — Reliability and Delivery
- Introduce API integration tests and core UI flow tests.
- Add structured logging and error correlation IDs.
- Add seed/migration tooling for environments (dev/stage/prod parity).

### Phase 4 — Product Experience Enhancements
- Improve chat intent handling (weather integration, recipe details link, bookmark categories).
- Add feature flags for incremental rollouts.
- Add analytics instrumentation for user actions and funnel tracking.

---

## 9) Developer Operations Notes
- Package manager: `npm`
- Main scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`
  - `npm run seed:recipes -- <userId>`
- Environment requirements:
  - `MONGODB_CONNECTION_STRING`
  - `JWT_SECRET`
  - optional `APP_BASE_URL`

---

## 10) Conclusion
The codebase is a strong modular monolith foundation for a multi-feature productivity product. Core full-stack patterns are in place (auth, CRUD, session restore, API docs, Redux-driven UI). For product-grade readiness, the immediate focus should be consistent server-side protection, complete auth recovery flows, and strict per-user data isolation across every domain.
