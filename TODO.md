# Optimasi MainLayout - Approved Plan
Status: **IN PROGRESS** (Plan disetujui, implementasi dimulai)

## 1. Preparation [TODO: IN PROGRESS]
- [ ] Update TODO.md (current)
- [ ] Check/Create AuthContext.jsx untuk dynamic permissions
- [ ] Create ErrorBoundary.jsx & Loader.jsx jika belum ada

## 2. Core Implementation [TODO]
- [ ] Create Overlay.jsx (reusable mobile sidebar overlay)
- [ ] Edit fe/src/layout/MainLayout.jsx (memoization, dynamic perms, Suspense/ErrorBoundary)
- [ ] Update MenuContext.jsx jika perlu adaptasi permissions

## 3. Testing & Polish [TODO]
- [ ] Install deps: clsx (jika belum)
- [ ] npm run lint && npm run build
- [ ] Test: sidebar toggle, mobile overlay, permissions, dark mode
- [ ] Update routes/App.jsx untuk wrap AuthProvider

## 4. Completion
- [ ] Remove from TODO setelah verified
- Command demo: `cd fe && npm start`

**Progress Notes:** Mulai dari AuthContext check. Edit satu per satu, confirm sebelum next.

