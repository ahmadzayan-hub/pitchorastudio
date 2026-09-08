import { getRequestContext } from "@/lib/presentiq";
import { json, unauthorized } from "@/lib/presentiq/api/response";

export async function GET() {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorized();
  return json({ user: { id: ctx.userId, email: ctx.email }, org: { id: ctx.orgId, role: ctx.role } });
}
