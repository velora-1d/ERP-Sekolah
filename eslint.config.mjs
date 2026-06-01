import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/immutability": "off",
    }
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "testsprite_tests/**",
    "drizzle/**",
    "scratch/**",
    "audit-pagination.js",
    "sync-users.ts",
    "run_migration.ts",
    "run_migration.cjs",
  ]),
]);
