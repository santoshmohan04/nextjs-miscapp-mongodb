## SVG Avatar Implementation Plan (Firebase-free)

### Goal
Replace Firebase Storage profile image uploads with:
- A predefined set of local **SVG avatars** in `public/avatars/*`
- A reusable `<Avatar />` component that renders `avatarKey` → legacy `profilepic` URL → initials fallback
- An avatar picker modal for selection
- A backend API route to persist `avatarKey`
- Redux action to update `avatarKey` and sync `localStorage.loginUser`

---

### 1) Add SVG avatar assets
**Add directory + files**
- `public/avatars/`
- `public/avatars/avatar-01.svg`
- `public/avatars/avatar-02.svg`
- …
- `public/avatars/avatar-24.svg` (start with 12–24)

**Conventions**
- Use IDs only: `avatar-01`, `avatar-02`, …
- Keep a consistent `viewBox` and similar stroke/fill weight so the grid looks uniform.

---

### 2) Shared avatar keys constant (single source of truth)
**Add**
- `lib/avatars.ts`

**Exports**
- `AVATAR_KEYS` (readonly array)
- `AvatarKey` type
- `isValidAvatarKey(value: string): value is AvatarKey`

Purpose: both the **frontend** picker and **backend** allow-list validation use the same keys.

---

### 3) Reusable `<Avatar />` component
**Add**
- `components/Avatar.tsx`

**Props**
- `user?: { name?: string; email?: string; avatarKey?: string; profilepic?: string }`
- `size?: number` (default e.g. 40)
- `className?: string`

**Render priority**
1. If `user.avatarKey` exists: render `/avatars/${avatarKey}.svg`
2. Else if `user.profilepic` exists: render that URL (legacy)
3. Else render a circle with initials (2 letters)

**Initials rules (suggested)**
- If name has 2+ words: first letter of first + first letter of last
- Else first 2 letters of the name
- Else fallback to email prefix

**Deterministic background color**
- Hash `name || email` and choose from a small palette (10–12 colors)

---

### 4) Avatar picker modal
**Add**
- `components/profile/AvatarPickerModal.tsx`

**UI**
- React-Bootstrap `Modal`
- Grid of avatars using `AVATAR_KEYS`
- Selected state highlight (border/ring)

**Behavior**
- Save-on-click is simplest:
  - user clicks an avatar → `onSelect(avatarKey)` → dispatch Redux thunk → close modal on success
- Optional "Remove avatar" action sets `avatarKey` to empty/null.

---

### 5) Backend API route
**Add**
- `app/api/profile/avatar/route.ts`

**Endpoint**
- `PUT /api/profile/avatar`

**Request body**
```json
{ "avatarKey": "avatar-07" }
```

**Validation**
- Require authentication via existing `getSessionUser()`
- Validate `avatarKey` via `isValidAvatarKey`

**DB update**
- Update authenticated user:
  - `{ avatarKey, updatedAt: new Date() }`

**Response**
- `{ message: "Avatar updated successfully", avatarKey }`

**Optional migration behavior**
- When setting `avatarKey`, optionally clear `profilepic` to remove dependence on remote URLs.

---

### 6) Redux action + reducer updates
**Change**
- `store/auth/authtypes.ts` (or constants file):
  - `UPDATE_AVATAR_REQUEST`, `UPDATE_AVATAR_SUCCESS`, `UPDATE_AVATAR_FAILURE`

**Change**
- `store/auth/authactions.ts`
  - Add thunk `updateAvatar(avatarKey: string)`:
    - dispatch request
    - `axios.put('/api/profile/avatar', { avatarKey }, { withCredentials: true })`
    - dispatch success with `{ avatarKey }`
    - update `localStorage.loginUser.avatarKey = avatarKey`

**Change**
- `store/auth/authreducers.ts`
  - On success, update `state.user.avatarKey`

---

### 7) Wire into Profile page
**Change**
- `app/profile/page.tsx`

**Replace**
- File input + upload button (Firebase)

**With**
- `<Avatar user={user} size={120} />`
- "Choose avatar" button that opens `AvatarPickerModal`
- On select: dispatch `updateAvatar(avatarKey)`

Keep legacy `profilepic` rendering support, but remove upload UI.

---

### 8) Optional: update Auth Users modal to remove Firebase
**Change**
- `components/users/UserFormModal.tsx`

**Replace**
- Firebase upload flow

**With**
- Avatar selection using the same picker or a dropdown
- Save `avatarKey` in the user payload

---

### 9) Cleanup (after migration)
Once all UI flows stop using Firebase:
- Remove `utils/firebaseConfig.ts`
- Remove `firebase` from `package.json`
- Remove Firebase imports and upload logic in:
  - `store/auth/authactions.ts`
  - `components/users/UserFormModal.tsx`

---

### Notes / Recommendations
- Start with **12–24** SVGs; expand later.
- Prefer SVGs that work in both light and dark mode (single-color with CSS `currentColor` is ideal).
- Ensure backend allow-list validation to prevent arbitrary file path usage.