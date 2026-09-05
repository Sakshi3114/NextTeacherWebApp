import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";

// A real GET route (not a Server Action) because a CSV export needs to
// trigger a native browser download — not covered by middleware.js's
// matcher, so the auth check happens here explicitly.
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new Response("Not authorized.", { status: 403 });
  }

  const teachers = await prisma.teacher.findMany({
    include: { user: true, department: true },
    orderBy: { user: { name: "asc" } },
  });

  const csv = toCsv(
    ["Name", "Email", "Phone", "Department"],
    teachers.map((t) => [t.user.name, t.user.email, t.phone ?? "", t.department?.name ?? ""])
  );

  return csvResponse("teachers.csv", csv);
}
