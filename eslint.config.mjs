import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "apps/backend/**/*.{ts,tsx}",
      "packages/**/*.{ts,tsx}",
      "tests/**/*.{ts,tsx}",
    ],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/application/**",
                "@/infrastructure/**",
                "@/app/**",
                "@/components/**",
                "@/payload/**",
                "@/lib/**",
              ],
              message:
                "Domain layer must stay independent from app, framework, and infrastructure layers.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/**", "@/components/**"],
              message:
                "Application layer must not depend on UI/framework route files.",
            },
            {
              group: ["@/infrastructure/cms/**", "@/payload/**"],
              message:
                "Application services must depend on repository ports, not Payload/CMS adapters directly.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/api/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/**", "@/payload/**", "@/domain/**", "@/components/**"],
              message:
                "API routes are controllers only. Import application services or HTTP adapters, not low-level modules directly.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/application/**", "@/infrastructure/**", "@/domain/**"],
              message:
                "UI components should consume contracts/data models, not application or infrastructure services directly.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "packages/api-client/src/generated.ts",
  ]),
]);

export default eslintConfig;
