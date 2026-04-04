# Stability & Stress Test Plan

**Project:** SoundCloud Frontend  
**Scope:** User-level repeated actions  
**Created:** 2026-04-04

---

## Overview

This plan focuses on **realistic user stress patterns** — actions a real user might repeat rapidly or excessively. These tests catch memory leaks, state corruption, UI freezes, and race conditions that only appear under repeated use.

---

## 1. Repeated Modal Open/Close

### STAB-MODAL-001: Login Modal Rapid Cycling

| Attribute         | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| **Action**        | Open login modal → close → repeat 20x                  |
| **Method**        | Automated                                              |
| **Cycles**        | 20                                                     |
| **Evidence**      | Screenshot after cycle 20, memory snapshot if manual   |
| **Pass Criteria** | Modal opens/closes cleanly every time, no UI artifacts |

**Risks Caught:**

- Memory leak from modal mount/unmount cycles
- Event listener accumulation (click handlers not cleaned up)
- Z-index stacking bugs
- Focus trap escaping

### STAB-MODAL-002: Modal with Partial Input

| Attribute         | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| **Action**        | Open modal → type partial email → close → reopen → check state |
| **Method**        | Automated                                                      |
| **Cycles**        | 10                                                             |
| **Evidence**      | Screenshot showing input state after reopen                    |
| **Pass Criteria** | Input resets on close OR preserves state consistently          |

**Risks Caught:**

- State persistence bugs (stale data shown)
- Form validation firing on stale input
- Controlled component state corruption

### STAB-MODAL-003: Overlay Click Dismiss Stress

| Attribute         | Value                                                 |
| ----------------- | ----------------------------------------------------- |
| **Action**        | Open modal → click overlay rapidly 5x → verify closed |
| **Method**        | Automated                                             |
| **Cycles**        | 5 sets                                                |
| **Evidence**      | Video of interaction                                  |
| **Pass Criteria** | Modal closes on first click, no double-close errors   |

**Risks Caught:**

- Double-close exceptions
- Click event bubbling issues
- Overlay click detection race conditions

---

## 2. Repeated Login Attempts

### STAB-AUTH-001: Rapid Valid Email Submissions

| Attribute         | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Action**        | Enter valid email → continue → back → repeat 10x |
| **Method**        | Automated                                        |
| **Cycles**        | 10                                               |
| **Evidence**      | Console logs, network tab                        |
| **Pass Criteria** | Each cycle completes, no duplicate API calls     |

**Risks Caught:**

- API call duplication
- Loading state stuck
- Navigation stack corruption

### STAB-AUTH-002: Rapid Invalid Submissions

| Attribute         | Value                                           |
| ----------------- | ----------------------------------------------- |
| **Action**        | Enter invalid email → click continue 5x rapidly |
| **Method**        | Automated                                       |
| **Cycles**        | 5 rapid clicks per attempt, 3 attempts          |
| **Evidence**      | Screenshot of error state                       |
| **Pass Criteria** | Single error shown, no stacked errors           |

**Risks Caught:**

- Error message duplication
- Validation running multiple times
- Button not debounced

### STAB-AUTH-003: Login/Logout Cycle

| Attribute         | Value                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Action**        | Seed auth token → verify authenticated → clear token → verify unauthenticated → repeat |
| **Method**        | Automated                                                                              |
| **Cycles**        | 5                                                                                      |
| **Evidence**      | Console logs showing token state                                                       |
| **Pass Criteria** | Auth state toggles correctly each time                                                 |

**Risks Caught:**

- localStorage sync issues
- Auth context not updating
- Stale UI showing wrong auth state

---

## 3. Repeated Navigation

### STAB-NAV-001: Tab Switching Stress

| Attribute         | Value                                               |
| ----------------- | --------------------------------------------------- |
| **Action**        | Navigate: Home → Feed → Library → Settings → repeat |
| **Method**        | Automated                                           |
| **Cycles**        | 10 full rotations                                   |
| **Evidence**      | Final screenshot, memory usage if manual            |
| **Pass Criteria** | All pages load, no blank screens                    |

**Risks Caught:**

- Route component memory leaks
- Lazy loading failures
- Navigation history stack overflow

### STAB-NAV-002: Rapid Back/Forward

| Attribute         | Value                                        |
| ----------------- | -------------------------------------------- |
| **Action**        | Navigate to 5 pages → rapid back/forward 10x |
| **Method**        | Automated                                    |
| **Cycles**        | 10 back/forward                              |
| **Evidence**      | Screenshot of final state                    |
| **Pass Criteria** | Correct page shown, no history corruption    |

**Risks Caught:**

- History API misuse
- State restoration bugs
- URL/content mismatch

### STAB-NAV-003: Profile Tab Rapid Switching

| Attribute         | Value                                                         |
| ----------------- | ------------------------------------------------------------- |
| **Action**        | On profile page: All → Popular → Playlists → Reposts → repeat |
| **Method**        | Automated                                                     |
| **Cycles**        | 10 full rotations                                             |
| **Evidence**      | Screenshot after final tab                                    |
| **Pass Criteria** | Correct content shown per tab                                 |

**Risks Caught:**

- Tab state corruption
- Content flashing/misrender
- API call cancellation issues

### STAB-NAV-004: Settings Tab Rapid Switching

| Attribute         | Value                                      |
| ----------------- | ------------------------------------------ |
| **Action**        | Switch between all 6 settings tabs rapidly |
| **Method**        | Automated                                  |
| **Cycles**        | 5 full rotations                           |
| **Evidence**      | Screenshot showing correct content         |
| **Pass Criteria** | Each tab loads correctly                   |

**Risks Caught:**

- Form state bleeding between tabs
- Unsaved changes lost without warning
- Active tab indicator desynced

---

## 4. Repeated Search Input

### STAB-SRCH-001: Rapid Typing

| Attribute         | Value                                             |
| ----------------- | ------------------------------------------------- |
| **Action**        | Type query character-by-character with 10ms delay |
| **Method**        | Automated                                         |
| **Cycles**        | 50 characters                                     |
| **Evidence**      | Final input value screenshot                      |
| **Pass Criteria** | All characters captured correctly                 |

**Risks Caught:**

- Input debounce dropping characters
- Controlled input lag
- React state batching issues

### STAB-SRCH-002: Type/Clear Cycles

| Attribute         | Value                                     |
| ----------------- | ----------------------------------------- |
| **Action**        | Type "test query" → clear → repeat        |
| **Method**        | Automated                                 |
| **Cycles**        | 20                                        |
| **Evidence**      | Screenshot after final clear              |
| **Pass Criteria** | Input empty after clear, no residual text |

**Risks Caught:**

- Clear not resetting state
- onChange not firing on programmatic clear
- Placeholder not reappearing

### STAB-SRCH-003: Rapid Submit

| Attribute         | Value                                      |
| ----------------- | ------------------------------------------ |
| **Action**        | Type query → press Enter 5x rapidly        |
| **Method**        | Automated                                  |
| **Cycles**        | 3 sets                                     |
| **Evidence**      | Network tab showing request count          |
| **Pass Criteria** | Single search triggered OR proper debounce |

**Risks Caught:**

- Multiple API calls per search
- Form double-submit
- Loading state race condition

---

## 5. Refresh/Reopen Flows

### STAB-REFRESH-001: Page Refresh Cycle

| Attribute         | Value                                       |
| ----------------- | ------------------------------------------- |
| **Action**        | Load page → refresh → verify state restored |
| **Method**        | Automated                                   |
| **Cycles**        | 5 per critical page                         |
| **Evidence**      | Screenshot before/after refresh             |
| **Pass Criteria** | Auth state, UI state restored correctly     |

**Risks Caught:**

- localStorage not persisting
- Hydration mismatches
- Flash of unauthenticated content

### STAB-REFRESH-002: Refresh During Loading

| Attribute         | Value                                          |
| ----------------- | ---------------------------------------------- |
| **Action**        | Navigate to page → refresh before fully loaded |
| **Method**        | Manual                                         |
| **Cycles**        | 5                                              |
| **Evidence**      | Screenshot of final state                      |
| **Pass Criteria** | Page recovers and loads correctly              |

**Risks Caught:**

- Incomplete state persisted
- Loading indicators stuck
- Race between mount and refresh

### STAB-REFRESH-003: Refresh With Unsaved Form Data

| Attribute         | Value                                                |
| ----------------- | ---------------------------------------------------- |
| **Action**        | Fill settings form partially → refresh → check state |
| **Method**        | Manual                                               |
| **Cycles**        | 3                                                    |
| **Evidence**      | Screenshot showing form state                        |
| **Pass Criteria** | Form resets OR prompts to save (documented behavior) |

**Risks Caught:**

- Data loss without warning
- Inconsistent save behavior
- beforeunload handler missing

### STAB-REFRESH-004: Tab Close/Reopen

| Attribute         | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| **Action**        | Authenticate → close tab → reopen → verify still authenticated |
| **Method**        | Manual                                                         |
| **Cycles**        | 3                                                              |
| **Evidence**      | Screenshot showing auth state                                  |
| **Pass Criteria** | Session persists across tab close                              |

**Risks Caught:**

- Session storage vs local storage confusion
- Auth token not persisted
- Cookie/token expiry issues

---

## 6. Extended Session Stability

### STAB-SESSION-001: Idle Session (Manual)

| Attribute         | Value                                           |
| ----------------- | ----------------------------------------------- |
| **Action**        | Load app → leave idle for 30 minutes → interact |
| **Method**        | Manual                                          |
| **Duration**      | 30 minutes                                      |
| **Evidence**      | Screenshot, memory usage                        |
| **Pass Criteria** | App responds normally after idle                |

**Risks Caught:**

- Token expiry not handled
- WebSocket reconnection failures (if applicable)
- Memory growth from timers/intervals

### STAB-SESSION-002: Background Tab

| Attribute         | Value                                                |
| ----------------- | ---------------------------------------------------- |
| **Action**        | Load app → switch to another tab for 10 min → return |
| **Method**        | Manual                                               |
| **Duration**      | 10 minutes                                           |
| **Evidence**      | Screenshot showing app state                         |
| **Pass Criteria** | App state consistent, no stale data                  |

**Risks Caught:**

- Page visibility API issues
- Paused timers not resuming
- Audio player state corruption

---

## Summary Table

| ID               | Scenario                      | Method | Priority |
| ---------------- | ----------------------------- | ------ | -------- |
| STAB-MODAL-001   | Modal rapid cycling (20x)     | Auto   | High     |
| STAB-MODAL-002   | Modal with partial input      | Auto   | High     |
| STAB-MODAL-003   | Overlay click dismiss stress  | Auto   | Medium   |
| STAB-AUTH-001    | Rapid valid email submissions | Auto   | High     |
| STAB-AUTH-002    | Rapid invalid submissions     | Auto   | High     |
| STAB-AUTH-003    | Login/logout cycle            | Auto   | High     |
| STAB-NAV-001     | Tab switching stress (10x)    | Auto   | High     |
| STAB-NAV-002     | Rapid back/forward            | Auto   | Medium   |
| STAB-NAV-003     | Profile tab rapid switching   | Auto   | Medium   |
| STAB-NAV-004     | Settings tab rapid switching  | Auto   | Medium   |
| STAB-SRCH-001    | Rapid typing                  | Auto   | High     |
| STAB-SRCH-002    | Type/clear cycles             | Auto   | Medium   |
| STAB-SRCH-003    | Rapid submit                  | Auto   | High     |
| STAB-REFRESH-001 | Page refresh cycle            | Auto   | High     |
| STAB-REFRESH-002 | Refresh during loading        | Manual | Medium   |
| STAB-REFRESH-003 | Refresh with unsaved data     | Manual | Medium   |
| STAB-REFRESH-004 | Tab close/reopen              | Manual | High     |
| STAB-SESSION-001 | Idle session (30 min)         | Manual | Low      |
| STAB-SESSION-002 | Background tab (10 min)       | Manual | Low      |

---

## Automation Coverage

| Category   | Auto   | Manual |
| ---------- | ------ | ------ |
| Modal      | 3      | 0      |
| Auth       | 3      | 0      |
| Navigation | 4      | 0      |
| Search     | 3      | 0      |
| Refresh    | 1      | 3      |
| Session    | 0      | 2      |
| **Total**  | **14** | **5**  |

---

## Already Implemented

These scenarios already have tests in the new E2E suite:

| Scenario       | Test File                      | Test Name                          |
| -------------- | ------------------------------ | ---------------------------------- |
| STAB-MODAL-001 | `navigation-stability.spec.ts` | `modal open/close 10 times`        |
| STAB-NAV-001   | `navigation-stability.spec.ts` | `10 navigation cycles`             |
| STAB-NAV-002   | `navigation-stability.spec.ts` | `rapid back/forward`               |
| STAB-NAV-003   | `navigation-stability.spec.ts` | `rapid profile tab switching`      |
| STAB-NAV-004   | `navigation-stability.spec.ts` | `rapid settings tab navigation`    |
| STAB-SRCH-001  | `search.spec.ts`               | `rapid typing`                     |
| STAB-SRCH-002  | `search.spec.ts`               | `repeated clear and type cycles`   |
| STAB-MODAL-003 | `auth-negative.spec.ts`        | `clicking outside modal closes it` |
| STAB-AUTH-002  | `auth-negative.spec.ts`        | `rapid clicking on sign in button` |

---

## Recommended Execution Order

1. **Daily (CI):** All automated @high scenarios
2. **Weekly (Manual):** STAB-REFRESH-002, 003, 004
3. **Pre-release:** Full suite including session tests
