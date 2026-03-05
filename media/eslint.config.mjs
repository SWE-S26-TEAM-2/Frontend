import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier"; // 1. Import this

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 2. Add Prettier at the end to turn off conflicting style rules
  eslintConfigPrettier, 
  
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;