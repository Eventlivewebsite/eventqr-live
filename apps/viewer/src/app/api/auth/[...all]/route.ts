import { auth } from "@repo/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export const { GET, POST } = toNextJsHandler(auth);