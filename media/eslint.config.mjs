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

  eslintConfigPrettier,

  // ── Global ignores ────────────────────────────────────────────────────────
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;