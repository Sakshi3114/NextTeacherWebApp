import Link from "next/link";
import { Megaphone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

const PAGE_SIZE = 10;

export const metadata = { title: "Notices" };

export default async function NoticesPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);

  // App-level expiry filter — replaces the old Mongo subdocument TTL, which
  // never actually worked (TTL indexes require a top-level Date field).
  const where = { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      include: { author: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.notice.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Notices</h1>
        <p className="text-muted-foreground">Announcements from teachers and admins.</p>
      </div>

      {notices.length === 0 ? (
        <EmptyState icon={Megaphone} title="No notices right now" description="Check back later." />
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{notice.title}</CardTitle>
                  <Badge variant="outline">{notice.author.name}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{notice.body}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Posted {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(notice.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/notices?page=${page - 1}`}>Previous</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          {page < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/notices?page=${page + 1}`}>Next</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
