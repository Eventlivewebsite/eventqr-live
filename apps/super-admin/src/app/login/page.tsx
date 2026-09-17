import { redirect } from "next/navigation";

export default function SuperAdminLoginRedirect() {
  redirect("https://eventqr-live-admin.vercel.app/login");
}