# Playlist Detail View — Integration Guide

**Branch:** `feature/fe-playlist-detail-view`
**Route:** `/playlist/[id]`
**Domain:** Playlists & Interactions

---

## PowerShell — Create Environment Files

Run from inside `media/` folder:

```powershell
New-Item .env.local -ItemType File
Add-Content .env.local "NEXT_PUBLIC_USE_MOCK_API=true"
Add-Content .env.local "NEXT_PUBLIC_API_URL=http://localhost:8000/api"

New-Item .env.production -ItemType File
Add-Content .env.production "NEXT_PUBLIC_USE_MOCK_API=false"
Add-Content .env.production "NEXT_PUBLIC_API_URL=http://your-backend-url/api"
```

Switch mock/real by changing `NEXT_PUBLIC_USE_MOCK_API`.
The DI layer in `src/services/di.ts` handles routing automatically.

---

## URLs to verify locally

| Page | URL |
|---|---|
| Landing page (Sign in button) | http://localhost:3000/ |
| Privacy settings | http://localhost:3000/settings/privacy/auth |
| Login form | http://localhost:3000/login |
| Playlist detail (mock data) | http://localhost:3000/playlist/123 |

---

## Review Commands — must run zero errors

```bash
npx eslint .
npm run build
npm run test -- --coverage --verbose
```

---

## Domain Responsibilities

| Responsibility | Implementation |
|---|---|
| Skeleton loading | `PlaylistSkeleton.tsx` — mirrors exact page layout, shimmer animation |
| Error boundary | `PlaylistErrorBoundary.tsx` — class component, catches render errors |
| Retry mechanism | `usePlaylist.ts` — `handleRetry()`, max 3 attempts, `canRetry` flag |
| Track array management | `usePlaylist.ts` — add / remove / reorder; helpers in `playlistMockData.ts` |
| Fetching data | `playlistService` via `@/services` DI barrel |
| Player integration | `PlaylistHeader` + `PlaylistTrackItem` wire into `usePlayerStore` |

---

## Backend API Contract

```
GET /api/playlists/:id

Response 200:
{
  "id": "string",
  "title": "string",
  "description": "string",
  "coverArt": "string",
  "creator": "string",
  "tracks": [
    {
      "id": "string",
      "title": "string",
      "artist": "string",
      "albumArt": "string",   <- matches ITrack.albumArt
      "duration": number      <- integer seconds
    }
  ]
}
```

`ITrack.url` is `""` for now. Populate with audio stream URL when ready.

---

## Git Workflow

```bash
git checkout main && git pull origin main
git checkout -b feature/fe-playlist-detail-view
git add src/
git commit -m "feat(fe): add playlist detail view with skeleton, error boundary, retry, and track management"
git push -u origin feature/fe-playlist-detail-view
```
