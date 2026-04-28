# Real-API spec fixtures

This folder holds binary/non-test fixtures consumed by the **chromium-real**
Playwright project. Keep it tiny; binary blobs do not belong in git.

## sample.mp3

`upload-real.spec.ts` and `track-real.spec.ts` need a tiny audio file that the
backend will accept (`POST /tracks/`). To keep the repository binary-free, no
file is committed.

You have two options:

1. **Drop your own** at `e2e/real/fixtures/sample.mp3`. A 1-2 second silent
   MP3 (≤50 KB) is plenty.
2. **Override via env**: set `SAMPLE_MP3_PATH=/abs/path/to/silent.mp3` and the
   real specs will use that path instead.

If neither option is satisfied, the upload/track real specs will gracefully
`test.skip()` with a message pointing back to this README.

### One-liner to generate a silent placeholder

If you have `ffmpeg` available locally:

```bash
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -c:a libmp3lame \
  -b:a 64k e2e/real/fixtures/sample.mp3
```

## Other env vars consumed by the real-API specs

| Var                          | Purpose                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| `BACKEND_URL`                | FastAPI base, default `http://localhost:8000`. The setup uses `${BACKEND_URL}/api`. |
| `E2E_REAL_USER_EMAIL/USERNAME/PASSWORD` | Reuse a pre-provisioned account instead of registering a fresh one. |
| `TEST_VERIFY_TOKEN_OVERRIDE` | Hard-coded verification token fed to `/auth/verify-email`.     |
| `VERIFICATION_BACKDOOR`      | URL of a test-only endpoint returning `{ token }` for a given email. |
| `SAMPLE_MP3_PATH`            | Override path for the upload fixture audio file.               |
| `OTHER_USERNAME`             | Optional second account used by profile-real follow tests.     |
