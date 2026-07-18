import { apiSuccess } from "@/lib/api";
import { getServerHealth } from "@/lib/config";

export const runtime = "nodejs";

export function GET() {
  return apiSuccess(getServerHealth());
}
