import Link from "next/link";
import { Search, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

const PAGE_SIZE = 9;

export const metadata = { title: "Teacher directory" };

export default async function TeachersPage({ searchParams }) {
  const params = await searchParams;
  const name = params?.name?.trim() ?? "";
  const department = params?.department?.trim() ?? "";
  const page = Math.max(1, Number(params?.page) || 1);

  // Prisma's `contains` is parameterized under the hood, unlike the old
  // app's unescaped Mongo $regex search (a regex-injection/ReDoS surface).
  const where = {
    ...(name ? { user: { name: { contains: name, mode: "insensitive" } } } : {}),
    ...(department ? { department: { name: { contains: department, mode: "insensitive" } } } : {}),
  };

  const [teachers, total, departments] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: { user: true, department: true },
      orderBy: { user: { name: "asc" } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.teacher.count({ where }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage) {
    const sp = new URLSearchParams();
    if (name) sp.set("name", name);
    if (department) sp.set("department", department);
    sp.set("page", String(targetPage));
    return `/teachers?${sp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Teacher directory</h1>
        <p className="text-muted-foreground">Search by name or department to find a teacher's schedule.</p>
      </div>

      <form className="mb-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" action="/teachers">
        <Input name="name" placeholder="Search by name" defaultValue={name} />
        <Input name="department" placeholder="Search by department" defaultValue={department} list="department-options" />
        <datalist id="department-options">
          {departments.map((d) => (
            <option key={d.id} value={d.name} />
          ))}
        </datalist>
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </form>

      {teachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teachers found"
          description="Try a different name or department."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <Link key={teacher.id} href={`/teachers/${teacher.id}`}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">{teacher.user.name}</CardTitle>
                    {teacher.department ? <Badge variant="secondary">{teacher.department.name}</Badge> : null}
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{teacher.user.email}</CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages} &middot; {total} teacher{total === 1 ? "" : "s"}
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(page - 1)}>Previous</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
              )}
              {page < totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(page + 1)}>Next</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
