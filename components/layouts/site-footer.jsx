import { GraduationCap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          <span>Teacher Schedule</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Teacher Schedule. Built for schools and colleges.</p>
      </div>
    </footer>
  );
}
