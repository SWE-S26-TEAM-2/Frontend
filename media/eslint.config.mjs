import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Unused variables prefixed with _ are intentional (e.g. _userId, _token, _payload)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "@typescript-eslint/naming-convention": [
        "error",
        // Interfaces must be PascalCase prefixed with I — e.g. ITrack, IUser
        { selector: "interface", format: ["PascalCase"], prefix: ["I"] },
        // Type aliases must be PascalCase — e.g. TrackType
        { selector: "typeAlias", format: ["PascalCase"] },
        // Variables: camelCase, UPPER_CASE constants, or PascalCase components
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
        // Functions: camelCase for utils/handlers, PascalCase for components
        { selector: "function", format: ["camelCase", "PascalCase"] },
        // Parameters: camelCase only — e.g. trackId, userId
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow", // allow _unused params
        },
      ],
    },
  },

  // ── Per-directory overrides ───────────────────────────────────────────────
  {
    // Studio components use <img> intentionally for external media previews
    files: ["src/components/Studio/**"],
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    // Studio page has a complex conditional effect — exhaustive-deps disabled deliberately
    files: ["src/app/**/creator/studio/**"],
    rules: { "react-hooks/exhaustive-deps": "off" },
  },

  eslintConfigPrettier,

  // ── Global ignores ────────────────────────────────────────────────────────
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    // E2E test files use Playwright types not in the main tsconfig scope
    "e2e/**",
    // Legacy mock files kept in repo — not linted
    "src/services/mocks/**",
  ]),
]);

export default eslintConfig;
