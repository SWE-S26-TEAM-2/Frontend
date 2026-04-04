# QA Test Plan: 50% Phase

**Project:** SoundCloud Frontend Clone  
**Phase:** 50% Milestone  
**Created:** 2026-04-04  
**Status:** Planning

---

## Overview

This document defines test scenarios for the 50% QA phase. All scenarios are based on expected user behaviors and existing feature scope. Scenarios marked as automation candidates are suitable for Jest or Playwright implementation.

---

## Module: Auth

| ID       | Scenario Name                                           | Priority | Type        | Auto Candidate | Evidence Needed                          | Status  |
| -------- | ------------------------------------------------------- | -------- | ----------- | -------------- | ---------------------------------------- | ------- |
| AUTH-001 | User opens login modal from header Sign In button       | P1       | Functional  | Yes            | Modal visible, social buttons present    | Planned |
| AUTH-002 | User opens login modal from landing page CTA            | P1       | Functional  | Yes            | Modal visible after CTA click            | Planned |
| AUTH-003 | User closes login modal via X button                    | P1       | Functional  | Yes            | Modal hidden, page state preserved       | Planned |
| AUTH-004 | User closes login modal via overlay click               | P2       | Functional  | Yes            | Modal hidden on backdrop click           | Planned |
| AUTH-005 | User closes login modal via Escape key                  | P2       | Functional  | Yes            | Modal hidden on keydown                  | Planned |
| AUTH-006 | Login modal displays all OAuth provider buttons         | P1       | Smoke       | Yes            | Facebook, Google, Apple buttons visible  | Planned |
| AUTH-007 | Email input accepts valid email format                  | P1       | Functional  | Yes            | Input value updates, no validation error | Planned |
| AUTH-008 | Email input rejects invalid email format                | P2       | Negative    | Yes            | Validation error displayed               | Planned |
| AUTH-009 | Continue button disabled when email empty               | P2       | Functional  | Yes            | Button disabled state                    | Planned |
| AUTH-010 | Authenticated user redirected from landing to /discover | P1       | Functional  | Yes            | URL changes to /discover                 | Planned |
| AUTH-011 | Unauthenticated user stays on landing page              | P1       | Functional  | Yes            | URL remains /                            | Planned |
| AUTH-012 | Auth token persisted to localStorage on login           | P1       | Integration | Yes            | localStorage contains auth_token         | Planned |
| AUTH-013 | Auth token cleared from localStorage on logout          | P1       | Integration | Yes            | localStorage auth_token removed          | Planned |
| AUTH-014 | User can sign out from header dropdown                  | P1       | E2E         | Yes            | Dropdown → Sign out → token cleared      | Planned |
| AUTH-015 | Session persists across page refresh                    | P2       | Integration | Yes            | Refresh page → still authenticated       | Planned |
| AUTH-016 | Expired token triggers re-authentication                | P3       | Negative    | Yes            | Expired token → redirected to login      | Planned |

---

## Module: Navigation

| ID      | Scenario Name                                     | Priority | Type       | Auto Candidate | Evidence Needed                    | Status  |
| ------- | ------------------------------------------------- | -------- | ---------- | -------------- | ---------------------------------- | ------- |
| NAV-001 | Header logo navigates to home                     | P1       | Smoke      | Yes            | URL is /                           | Planned |
| NAV-002 | Home nav link navigates to /                      | P1       | Functional | Yes            | URL is /, link has active state    | Planned |
| NAV-003 | Feed nav link navigates to /feed                  | P1       | Functional | Yes            | URL is /feed                       | Planned |
| NAV-004 | Library nav link navigates to /library            | P1       | Functional | Yes            | URL is /library                    | Planned |
| NAV-005 | Upload link navigates to /upload                  | P2       | Functional | Yes            | URL is /upload                     | Planned |
| NAV-006 | For Artists link navigates to /for-artists        | P3       | Functional | Yes            | URL is /for-artists                | Planned |
| NAV-007 | Try Artist Pro link navigates to /artist-pro      | P3       | Functional | Yes            | URL is /artist-pro                 | Planned |
| NAV-008 | Active nav item highlighted correctly             | P2       | Functional | Yes            | Active class on current route link | Planned |
| NAV-009 | Avatar dropdown opens on click                    | P1       | Functional | Yes            | Dropdown menu visible              | Planned |
| NAV-010 | Avatar dropdown closes on second click            | P2       | Functional | Yes            | Dropdown menu hidden               | Planned |
| NAV-011 | Avatar dropdown closes on outside click           | P2       | Functional | Yes            | Dropdown menu hidden               | Planned |
| NAV-012 | Profile link in dropdown navigates to /profile    | P1       | Functional | Yes            | URL is /profile                    | Planned |
| NAV-013 | Settings link in dots menu navigates to /settings | P1       | Functional | Yes            | URL is /settings/account           | Planned |
| NAV-014 | Notifications icon visible when authenticated     | P2       | Smoke      | Yes            | Bell icon in header                | Planned |
| NAV-015 | Messages icon visible when authenticated          | P2       | Smoke      | Yes            | Mail icon in header                | Planned |
| NAV-016 | Header controls hidden when unauthenticated       | P2       | Functional | Yes            | No avatar, notifications, messages | Planned |

---

## Module: Search

| ID       | Scenario Name                                  | Priority | Type       | Auto Candidate | Evidence Needed                 | Status  |
| -------- | ---------------------------------------------- | -------- | ---------- | -------------- | ------------------------------- | ------- |
| SRCH-001 | Search input visible in header                 | P1       | Smoke      | Yes            | Input with placeholder "Search" | Planned |
| SRCH-002 | Search input accepts text input                | P1       | Functional | Yes            | Input value updates on typing   | Planned |
| SRCH-003 | Search input can be cleared                    | P2       | Functional | Yes            | Input value empty after clear   | Planned |
| SRCH-004 | Search triggers on Enter key                   | P1       | Functional | Yes            | Search action initiated         | Planned |
| SRCH-005 | Search results page displays matching tracks   | P1       | E2E        | Yes            | Results visible for query       | Planned |
| SRCH-006 | Search results page displays matching artists  | P1       | E2E        | Yes            | Artist results visible          | Planned |
| SRCH-007 | Empty search query shows no results message    | P2       | Negative   | Yes            | "No results" or similar message | Planned |
| SRCH-008 | Search with no matches shows empty state       | P2       | Negative   | Yes            | Empty state UI displayed        | Planned |
| SRCH-009 | Clicking search result navigates to track page | P1       | E2E        | Yes            | URL is /track/{id}              | Planned |
| SRCH-010 | Clicking artist result navigates to profile    | P1       | E2E        | Yes            | URL is /{username}              | Planned |
| SRCH-011 | Search preserves query in URL                  | P3       | Functional | Yes            | URL contains ?q=query           | Planned |
| SRCH-012 | Landing page search input functional           | P2       | Functional | Yes            | Search from landing page works  | Planned |

---

## Module: Settings

| ID      | Scenario Name                                | Priority | Type        | Auto Candidate | Evidence Needed                                                    | Status  |
| ------- | -------------------------------------------- | -------- | ----------- | -------------- | ------------------------------------------------------------------ | ------- |
| SET-001 | /settings redirects to /settings/account     | P1       | Smoke       | Yes            | URL is /settings/account                                           | Planned |
| SET-002 | Settings sidebar displays all tabs           | P1       | Smoke       | Yes            | Account, Content, Notifications, Privacy, Advertising, 2FA visible | Planned |
| SET-003 | Account tab shows theme selection            | P1       | Functional  | Yes            | Light/Dark radio buttons visible                                   | Planned |
| SET-004 | User can switch to light theme               | P1       | Functional  | Yes            | Light radio checked, UI reflects theme                             | Planned |
| SET-005 | User can switch to dark theme                | P1       | Functional  | Yes            | Dark radio checked, UI reflects theme                              | Planned |
| SET-006 | Content tab shows RSS feed settings          | P2       | Smoke       | Yes            | RSS feed heading visible                                           | Planned |
| SET-007 | Custom author name input accepts text        | P2       | Functional  | Yes            | Input value updates                                                | Planned |
| SET-008 | Explicit content checkbox toggles            | P2       | Functional  | Yes            | Checkbox state changes                                             | Planned |
| SET-009 | Notifications tab shows activity preferences | P2       | Smoke       | Yes            | Activities section visible                                         | Planned |
| SET-010 | New follower notification checkbox toggles   | P2       | Functional  | Yes            | Checkbox state changes                                             | Planned |
| SET-011 | New message audience dropdown changes value  | P2       | Functional  | Yes            | Dropdown value updates                                             | Planned |
| SET-012 | Privacy tab shows privacy settings           | P2       | Smoke       | Yes            | Privacy settings heading visible                                   | Planned |
| SET-013 | Privacy toggle changes state                 | P2       | Functional  | Yes            | Toggle background color changes                                    | Planned |
| SET-014 | Privacy auth sub-page accessible             | P2       | Functional  | Yes            | /settings/privacy/auth loads                                       | Planned |
| SET-015 | Advertising tab shows ad settings            | P3       | Smoke       | Yes            | Advertising Settings heading visible                               | Planned |
| SET-016 | 2FA tab shows enable button                  | P2       | Smoke       | Yes            | Enable 2FA button visible                                          | Planned |
| SET-017 | User can enable 2FA                          | P2       | Functional  | Yes            | Disable button appears, status shows enabled                       | Planned |
| SET-018 | User can disable 2FA                         | P2       | Functional  | Yes            | Enable button appears, status shows disabled                       | Planned |
| SET-019 | Settings changes persist after navigation    | P3       | Integration | Yes            | Navigate away and back, settings retained                          | Planned |
| SET-020 | Settings API error displays error message    | P3       | Negative    | Yes            | Error toast or message shown                                       | Planned |

---

## Module: Profile

| ID       | Scenario Name                                     | Priority | Type       | Auto Candidate | Evidence Needed                        | Status  |
| -------- | ------------------------------------------------- | -------- | ---------- | -------------- | -------------------------------------- | ------- |
| PROF-001 | Public artist profile loads with header           | P1       | Smoke      | Yes            | Username, avatar, bio visible          | Planned |
| PROF-002 | Profile shows follower/following counts           | P1       | Smoke      | Yes            | Counts displayed                       | Planned |
| PROF-003 | Profile shows track count                         | P2       | Smoke      | Yes            | Track count displayed                  | Planned |
| PROF-004 | All tab displays user tracks                      | P1       | Functional | Yes            | Track cards visible                    | Planned |
| PROF-005 | Popular tracks tab shows sorted tracks            | P2       | Functional | Yes            | Popular tracks heading, tracks visible | Planned |
| PROF-006 | Playlists tab shows playlists or empty state      | P2       | Functional | Yes            | Playlists or "No playlists yet"        | Planned |
| PROF-007 | Reposts tab shows reposts or empty state          | P2       | Functional | Yes            | Reposts or empty state message         | Planned |
| PROF-008 | Fans Also Like section displays related artists   | P2       | Functional | Yes            | Related artist cards visible           | Planned |
| PROF-009 | Follow button visible on other user profiles      | P1       | Smoke      | Yes            | Follow button displayed                | Planned |
| PROF-010 | Follow button click updates button state          | P2       | Functional | Yes            | Button text changes to Following       | Planned |
| PROF-011 | Owner profile shows upload prompts                | P1       | Functional | Yes            | "Upload image", "Upload now" buttons   | Planned |
| PROF-012 | Owner profile shows empty state when no tracks    | P2       | Functional | Yes            | "Seems a little quiet" message         | Planned |
| PROF-013 | Clicking track card navigates to track page       | P1       | E2E        | Yes            | URL is /track/{id}                     | Planned |
| PROF-014 | Track card play button triggers playback          | P1       | Functional | Yes            | Player state changes, audio plays      | Planned |
| PROF-015 | Track card like button toggles like state         | P2       | Functional | Yes            | Heart icon state changes               | Planned |
| PROF-016 | Non-existent profile shows 404                    | P2       | Negative   | Yes            | 404 page or error displayed            | Planned |
| PROF-017 | Profile with special characters in username loads | P3       | Negative   | Yes            | Profile loads correctly                | Planned |

---

## Module: Track Playback

| ID       | Scenario Name                             | Priority | Type        | Auto Candidate | Evidence Needed                     | Status  |
| -------- | ----------------------------------------- | -------- | ----------- | -------------- | ----------------------------------- | ------- |
| PLAY-001 | Footer player visible when track loaded   | P1       | Smoke       | Yes            | Player controls visible             | Planned |
| PLAY-002 | Play button starts playback               | P1       | Functional  | Yes            | isPlaying true, audio plays         | Planned |
| PLAY-003 | Pause button stops playback               | P1       | Functional  | Yes            | isPlaying false, audio paused       | Planned |
| PLAY-004 | Next button advances to next track        | P1       | Functional  | Yes            | Current track changes               | Planned |
| PLAY-005 | Previous button goes to previous track    | P1       | Functional  | Yes            | Current track changes               | Planned |
| PLAY-006 | Progress bar shows current time           | P1       | Functional  | Yes            | Time display updates                | Planned |
| PLAY-007 | Seeking via progress bar works            | P2       | Functional  | Yes            | Current time jumps to seek position | Planned |
| PLAY-008 | Volume slider adjusts volume              | P2       | Functional  | Yes            | Volume level changes                | Planned |
| PLAY-009 | Mute button mutes audio                   | P2       | Functional  | Yes            | Volume 0, mute icon shown           | Planned |
| PLAY-010 | Shuffle button toggles shuffle mode       | P2       | Functional  | Yes            | Shuffle state true/false            | Planned |
| PLAY-011 | Repeat button toggles repeat mode         | P2       | Functional  | Yes            | Repeat state true/false             | Planned |
| PLAY-012 | Queue drawer opens on queue button click  | P2       | Functional  | Yes            | Queue drawer visible                | Planned |
| PLAY-013 | Queue displays all queued tracks          | P2       | Functional  | Yes            | Track list in queue                 | Planned |
| PLAY-014 | Clicking track in queue plays that track  | P2       | Functional  | Yes            | Current track updates               | Planned |
| PLAY-015 | Current track highlighted in queue        | P3       | Functional  | Yes            | Visual highlight on current         | Planned |
| PLAY-016 | Track info displays title and artist      | P1       | Smoke       | Yes            | Title, artist visible in player     | Planned |
| PLAY-017 | Track artwork displays in player          | P2       | Smoke       | Yes            | Album art image visible             | Planned |
| PLAY-018 | Playback continues when navigating pages  | P1       | E2E         | Yes            | Audio continues across routes       | Planned |
| PLAY-019 | Time formatting shows MM:SS correctly     | P2       | Unit        | Yes            | 90s → "1:30"                        | Planned |
| PLAY-020 | Duration displays correctly from metadata | P2       | Integration | Yes            | Duration matches track length       | Planned |

---

## Module: Stability / Stress

| ID       | Scenario Name                                      | Priority | Type        | Auto Candidate | Evidence Needed                      | Status  |
| -------- | -------------------------------------------------- | -------- | ----------- | -------------- | ------------------------------------ | ------- |
| STAB-001 | Page loads within 3 seconds on standard connection | P2       | Performance | Yes            | LCP < 3000ms                         | Planned |
| STAB-002 | No memory leaks during extended playback           | P3       | Stress      | Manual         | Memory stable over 30 min            | Planned |
| STAB-003 | Rapid play/pause does not crash player             | P2       | Stress      | Yes            | 20 rapid toggles, no errors          | Planned |
| STAB-004 | Rapid tab switching does not break state           | P2       | Stress      | Yes            | 10 rapid tab switches, UI stable     | Planned |
| STAB-005 | Multiple modal open/close cycles stable            | P2       | Stress      | Yes            | 10 open/close cycles, no errors      | Planned |
| STAB-006 | Large queue (50+ tracks) renders without lag       | P3       | Stress      | Yes            | Queue scrolls smoothly               | Planned |
| STAB-007 | Search with many results renders acceptably        | P3       | Performance | Yes            | 100+ results render < 2s             | Planned |
| STAB-008 | Profile with many tracks loads incrementally       | P3       | Performance | Yes            | Pagination or lazy loading works     | Planned |
| STAB-009 | Offline state shows appropriate messaging          | P3       | Negative    | Manual         | Error message when offline           | Planned |
| STAB-010 | Network timeout handled gracefully                 | P2       | Negative    | Yes            | Timeout → error message, no crash    | Planned |
| STAB-011 | API 500 error handled gracefully                   | P2       | Negative    | Yes            | Server error → user-friendly message | Planned |
| STAB-012 | Concurrent API calls do not race condition         | P3       | Stress      | Yes            | Rapid actions don't corrupt state    | Planned |

---

## Summary

| Module           | Total Scenarios | P1     | P2     | P3     |
| ---------------- | --------------- | ------ | ------ | ------ |
| Auth             | 16              | 9      | 5      | 2      |
| Navigation       | 16              | 5      | 10     | 1      |
| Search           | 12              | 5      | 5      | 2      |
| Settings         | 20              | 3      | 13     | 4      |
| Profile          | 17              | 5      | 9      | 3      |
| Track Playback   | 20              | 6      | 12     | 2      |
| Stability/Stress | 12              | 0      | 6      | 6      |
| **Total**        | **113**         | **33** | **60** | **20** |

---

## Automation Coverage Target

| Type             | Scenarios | Target Coverage |
| ---------------- | --------- | --------------- |
| Jest Unit        | ~25       | 100%            |
| Jest Integration | ~35       | 90%             |
| Playwright E2E   | ~40       | 80%             |
| Manual Only      | ~13       | N/A             |

---

## Status Legend

| Status      | Definition                            |
| ----------- | ------------------------------------- |
| Planned     | Scenario defined, not yet implemented |
| In Progress | Test being written                    |
| Automated   | Test implemented and passing          |
| Manual Pass | Manually verified, not automated      |
| Blocked     | Cannot test due to dependency         |
| Deferred    | Moved to future phase                 |

---

## Next Steps

1. Review scenarios with team for completeness
2. Prioritize P1 scenarios for first implementation sprint
3. Create test data fixtures for consistent scenario execution
4. Establish baseline metrics for stability/performance tests
