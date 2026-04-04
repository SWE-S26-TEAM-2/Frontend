# QA Evidence Capture Guide

**Project:** SoundCloud Frontend  
**Last Updated:** 2026-04-04

---

## Quick Reference

| Evidence Type | Location                       | When Captured         |
| ------------- | ------------------------------ | --------------------- |
| Screenshots   | `playwright-report/`           | On failure (auto)     |
| Videos        | `test-results/`                | On failure (auto)     |
| Traces        | `test-results/`                | On first retry (auto) |
| HTML Report   | `playwright-report/index.html` | After every run       |

---

## 1. Playwright Evidence Storage

### Default Locations

```
media/
├── playwright-report/     # HTML report + embedded screenshots
│   └── index.html         # Open this to view report
├── test-results/          # Raw artifacts per test
│   ├── test-name-chromium/
│   │   ├── video.webm     # Failure video
│   │   ├── trace.zip      # Trace file
│   │   └── screenshot.png # Failure screenshot
```

### Current Config (playwright.config.ts)

| Setting      | Value               | Meaning                       |
| ------------ | ------------------- | ----------------------------- |
| `screenshot` | `only-on-failure`   | Auto-capture on fail          |
| `video`      | `retain-on-failure` | Records always, keeps on fail |
| `trace`      | `on-first-retry`    | Captures trace on retry       |

---

## 2. Capturing Failure Evidence

### Automatic (Default)

Failures automatically capture:

- ✅ Screenshot at failure point
- ✅ Video of entire test
- ✅ Trace on retry

### Manual Screenshot in Test

```typescript
// Capture at specific point
await page.screenshot({ path: 'evidence/my-screenshot.png' });

// Full page capture
await page.screenshot({ path: 'evidence/full-page.png', fullPage: true });
```

### Force Evidence for All Tests

```bash
# Screenshots for all tests (pass or fail)
npx playwright test --screenshot on

# Video for all tests
npx playwright test --video on

# Full trace for all tests
npx playwright test --trace on
```

### View Trace File

```bash
npx playwright show-trace test-results/test-name-chromium/trace.zip
```

---

## 3. Flutter Simulator Evidence (Mobile QA)

### iOS Simulator Screenshots

```bash
# Take screenshot
xcrun simctl io booted screenshot ~/Desktop/ios-screenshot.png

# With timestamp
xcrun simctl io booted screenshot ~/Desktop/ios-$(date +%Y%m%d-%H%M%S).png
```

### iOS Simulator Video

```bash
# Start recording
xcrun simctl io booted recordVideo ~/Desktop/ios-recording.mov

# Stop with Ctrl+C
```

### Android Emulator Screenshots

```bash
adb exec-out screencap -p > ~/Desktop/android-screenshot.png
```

### Android Emulator Video

```bash
# Start (max 180 seconds)
adb shell screenrecord /sdcard/recording.mp4

# Stop with Ctrl+C, then pull file
adb pull /sdcard/recording.mp4 ~/Desktop/
```

---

## 4. Required Evidence for Failed Scenarios

### Minimum Required

| Evidence              | Format | Notes                       |
| --------------------- | ------ | --------------------------- |
| Screenshot at failure | PNG    | Shows UI state              |
| Error message         | Text   | From console or test output |
| Steps to reproduce    | Text   | What actions led to failure |

### Strongly Recommended

| Evidence     | When                        |
| ------------ | --------------------------- |
| Video        | Complex multi-step failures |
| Trace        | Timing/network issues       |
| Console logs | JavaScript errors           |
| Network HAR  | API failures                |

### Bug Report Template

```markdown
## Failed Scenario: [SCENARIO-ID]

**Test:** `e2e/tests/auth-flows.spec.ts:42`
**Priority:** @critical
**Date:** YYYY-MM-DD

### Steps to Reproduce

1. Navigate to /
2. Click Sign In
3. Enter email: test@example.com
4. [FAILURE POINT]

### Expected

Modal advances to password step

### Actual

Modal shows validation error / hangs / crashes

### Evidence

- Screenshot: [attached]
- Video: [link or attached]
- Trace: [attached if available]

### Environment

- Browser: Chromium
- OS: macOS
- Build: [commit hash]
```

---

## 5. Recommended Evidence for Critical Passed Scenarios

For audit trails and regression baselines, capture evidence on critical passes:

### When to Capture

| Scenario Type                 | Capture Evidence? |
| ----------------------------- | ----------------- |
| @critical login flow          | ✅ Yes            |
| @critical session persistence | ✅ Yes            |
| @critical payment/sensitive   | ✅ Yes            |
| @high repeated actions        | Optional          |
| @medium edge cases            | No                |

### How to Capture

```bash
# Run critical tests with full evidence
npx playwright test --grep @critical --screenshot on --video on

# Or specific test file
npx playwright test auth-flows.spec.ts --screenshot on --video on
```

### Archiving Baseline Evidence

```bash
# After successful critical run
mkdir -p evidence/baseline/$(date +%Y%m%d)
cp -r test-results/* evidence/baseline/$(date +%Y%m%d)/
cp -r playwright-report evidence/baseline/$(date +%Y%m%d)/
```

### What to Keep

| Evidence     | Retention                          |
| ------------ | ---------------------------------- |
| Screenshots  | Keep last 3 runs                   |
| Videos       | Keep last successful + last failed |
| Traces       | Delete after analysis              |
| HTML Reports | Keep for release milestones        |

---

## 6. Quick Commands

```bash
# Run tests and open report
npx playwright test && npx playwright show-report

# Run with all evidence
npx playwright test --screenshot on --video on --trace on

# Run specific priority with evidence
npx playwright test --grep @critical --video on

# Debug mode (headed browser, pauses on failure)
npx playwright test --debug

# UI mode (interactive)
npx playwright test --ui
```

---

## 7. CI Evidence

In CI (GitHub Actions), artifacts are uploaded automatically if configured. Current CI does **not** run Playwright tests.

To add:

```yaml
- name: Run E2E tests
  run: npx playwright test

- name: Upload test artifacts
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: |
      playwright-report/
      test-results/
```

---

## Questions?

Contact the QA lead or check Playwright docs: https://playwright.dev/docs/test-reporters
