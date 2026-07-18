import { apiSuccess } from "@/lib/api";

export function GET() {
  return apiSuccess({
    status: "healthy"
  });
}
