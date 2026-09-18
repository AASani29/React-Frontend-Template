# React Frontend Template

A minimal, reusable starting point for a React SPA talking to a JWT-auth
backend: routing, auth state, an axios client with token handling already
wired up, and one CRUD resource (`items`) that demonstrates the
list/create/delete + TanStack Query pattern to copy for your own features.

Pairs directly with [FastAPI-Template](https://github.com/AASani29/FastAPI-Template)
— same auth contract (`/auth/register`, `/auth/login`, `/auth/me`), same
`{"error": {"code","message","details"}}` error shape, same `items` resource
by construction. Point `VITE_API_URL` at it and the auth flow works with zero
changes on either side.

## What's included

- **Auth**: login/register forms (react-hook-form + zod), `AuthContext`
  (token + user state, `localStorage` persistence, bootstraps the session
  via `/auth/me` on every page load), and a route guard.
- **One example resource** (`items`): paginated list via TanStack Query,
  create via a mutation + cache invalidation, delete — the pattern every
  future resource in your app should copy.
- **`api/client.ts`**: one axios instance for the whole app. A request
  interceptor attaches the JWT to every call; a response interceptor clears
  it and redirects to `/login` on any 401. `getErrorMessage()` unwraps a
  backend's `{"error": {"message"}}` shape so a page can show it directly.
- **Two shared primitives**, `components/FormField.tsx` and `Button.tsx` —
  extracted once three forms (login, register, items) needed the same
  label+input+error markup; not a component library, just the one piece of
  duplication that was real.
- **Tailwind v4** (the Vite-plugin setup — no `tailwind.config.js`).

## Structure

```
src/
  main.tsx, App.tsx        # entry, route table
  api/
    client.ts               # the one axios instance + interceptors + getErrorMessage
    endpoints.ts             # typed request functions + types mirroring your backend's schemas
  auth/
    AuthContext.tsx           # token/user state, login/register/logout, useAuth()
    ProtectedLayout.tsx        # route guard + nav chrome, combined
  components/
    FormField.tsx               # label + input + react-hook-form error
    Button.tsx                   # button with a loading state
  pages/
    LoginPage.tsx, RegisterPage.tsx
    ItemsPage.tsx                 # the resource pattern to copy
```

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend
npm run dev
```

Needs a backend implementing `POST /auth/register`, `POST /auth/login`
(OAuth2 password grant — form-encoded `username`/`password`, returns
`{access_token, token_type}`), `GET /auth/me`, and `items` CRUD matching
`api/endpoints.ts`'s `Item`/`ItemPage`/`ItemCreate` shapes.
[FastAPI-Template](https://github.com/AASani29/FastAPI-Template) provides
exactly this.

## How to add your own resource

Copy the `items` pattern:

1. Add types + request functions to `api/endpoints.ts`, following `Item`/
   `listItems`/`createItem`/`deleteItem`.
2. Add a page under `pages/`, following `ItemsPage.tsx`: `useQuery` for
   reads, `useMutation` + `queryClient.invalidateQueries` for writes.
3. Add a route in `App.tsx` inside the `<ProtectedLayout>` block, and a
   `<Link>` in `ProtectedLayout.tsx`'s nav.

If a form's inputs need the same label+input+error look as `items`, reuse
`FormField`/`Button` — don't re-derive the markup a fourth time.

## Design decisions worth knowing before you extend this

- **JWT in `localStorage`**, not an `httpOnly` cookie. Trade-off: any XSS on
  the page can read it, versus a cookie JS can't read at all. The cookie
  route needs CSRF protection and same-site/cross-origin cookie config;
  `localStorage` + a short-lived access token is the pragmatic default for
  an internal tool or a demo. For anything handling real user data, prefer
  an `httpOnly` refresh cookie + an in-memory access token instead.
- **Context is used for auth state only.** Server data (the `items` list,
  and whatever you add) goes through TanStack Query, not Context or a
  global store — Context re-renders every consumer on every change, which
  is fine for "who is logged in" (changes rarely) and wrong for server data
  (changes often, needs caching/refetching/invalidation, which is exactly
  what Query already does).
- **No Redux, no Zustand, no component library.** Nothing here has more
  than one implementation yet — add a real state manager only when Context
  actually becomes a bottleneck, not before.
- **`ProtectedLayout` combines the route guard and the page chrome**
  (nav bar) in one component. A layout that only ever renders inside the
  guard is the same component wearing two names — splitting them would be
  an abstraction with nothing to abstract over.

## What's not here yet

Left out on purpose — add per-project, when the project actually needs it:

- **Tests.** No Vitest/React Testing Library setup. The pattern worth
  following when you add it: render `ItemsPage` behind a mocked
  `QueryClientProvider` and a stubbed `api/endpoints.ts`, not a real backend.
- **Error boundary.** A render-time crash anywhere currently blanks the
  page. Add a top-level `ErrorBoundary` around `<App />` in `main.tsx` once
  this matters for your project.
- **Optimistic updates.** Mutations invalidate and refetch rather than
  updating the cache immediately — simpler and correct by construction;
  add optimism only where the extra snappiness is worth the rollback logic.
- **A design system / component library.** Plain Tailwind utility classes
  throughout. Bring shadcn/ui, MUI, or your own once you have enough shared
  components that hand-rolling primitives stops being the faster path.

## Keeping this template current

Dependency versions in `package.json` were resolved from npm on 2026-09-18
via the actual Vite scaffolder (`npm create vite@latest`), not guessed.
Before reusing this months from now, re-scaffold a throwaway project the
same way and diff the versions, or just run `npm install` and let the
lockfile update — then re-run the smoke test below.

**Verifying the template still works:**

```bash
npm install
npm run build   # tsc -b && vite build — must be clean
npm run lint     # oxlint — one expected warning, see below
npm run dev
```

The one accepted lint warning: `AuthContext.tsx` exports both `AuthProvider`
and `useAuth` from the same file — the standard Context+hook pattern, which
trips oxlint's Fast-Refresh-only-exports-components rule. Splitting it into
two files to silence a stylistic warning would be exactly the kind of
one-implementation abstraction this template avoids elsewhere; left as-is
deliberately, not an oversight.
