import Link from "next/link";
import { Users, Megaphone, ShieldCheck } from "lucide-react";
import ImageSlider from "@/components/common/Slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    icon: Users,
    title: "Teacher directory",
    description: "Search every teacher by name or department and see their live weekly schedule.",
    href: "/teachers",
    cta: "Browse directory",
  },
  {
    icon: Megaphone,
    title: "Notices",
    description: "Class changes, room swaps, and announcements from teachers, all in one feed.",
    href: "/notices",
    cta: "Check notices",
  },
  {
    icon: ShieldCheck,
    title: "Secure sign-in",
    description: "Admins and teachers sign in with real, server-verified accounts — no shared passwords.",
    href: "/sign-in",
    cta: "Sign in",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Teacher Schedule Check</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          A central place for students to find teachers and schedules, for teachers to post notices, and for
          admins to manage the directory.
        </p>
      </section>

      <ImageSlider />

      <section className="mt-14 grid gap-6 sm:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description, href, cta }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="h-8 w-8 text-primary" />
              <CardTitle className="pt-2">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link href={href}>{cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
