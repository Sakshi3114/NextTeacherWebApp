import Link from "next/link";
import { ArrowRight, Users, GraduationCap, BookOpen, Building2, Megaphone, ShieldCheck, CalendarDays } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    icon: CalendarDays,
    title: "Live timetables",
    description: "Every teacher's weekly schedule in one place, built by admins with automatic conflict checks.",
    href: "/teachers",
    cta: "Browse directory",
  },
  {
    icon: Megaphone,
    title: "Notices that reach everyone",
    description: "Class changes and announcements post instantly, with read receipts once students sign in.",
    href: "/notices",
    cta: "Check notices",
  },
  {
    icon: ShieldCheck,
    title: "Real, server-verified accounts",
    description: "Admins, teachers, and students each sign in with their own role — no shared passwords, ever.",
    href: "/sign-in",
    cta: "Sign in",
  },
];

const DASHBOARD_PATH = { ADMIN: "/admin", TEACHER: "/teacher", STUDENT: "/student" };

export default async function Home() {
  const session = await auth();

  const [teacherCount, studentCount, subjectCount, departmentCount] = await Promise.all([
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.subject.count(),
    prisma.department.count(),
  ]);

  const stats = [
    { icon: Users, value: teacherCount, label: "Teachers" },
    { icon: GraduationCap, value: studentCount, label: "Students" },
    { icon: BookOpen, value: subjectCount, label: "Subjects" },
    { icon: Building2, value: departmentCount, label: "Departments" },
  ];

  const primaryCta = session?.user
    ? { href: DASHBOARD_PATH[session.user.role] ?? "/", label: "Go to my dashboard" }
    : { href: "/teachers", label: "Browse the directory" };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-12rem] h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            For schools &amp; colleges
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            One place to run your school's schedule
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
            Teachers post notices under their own account, students find schedules and stay in the loop, and
            admins manage the whole directory — all with real, role-based sign-in.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={primaryCta.href}>
                {primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {!session?.user ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            ) : null}
          </div>

          {/* Stat tiles */}
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <dd className="text-3xl font-semibold">{value}</dd>
                <dt className="text-sm text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description, href, cta }) => (
            <Card key={title} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="pt-3">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button asChild variant="ghost" size="sm" className="px-0 hover:bg-transparent hover:underline">
                  <Link href={href}>
                    {cta} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
