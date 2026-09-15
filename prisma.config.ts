import "dotenv/config";
import { defineConfig } from "@prisma/config";

// Node environment typing declaration
declare const process: {
  env: { [key: string]: string | undefined };
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
});