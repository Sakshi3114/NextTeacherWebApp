import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarUploadForm } from "@/components/profile/avatar-upload-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>Update your profile photo. Other details are managed by an admin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUploadForm name={session.user.name} image={session.user.image} />
          <div className="space-y-1 border-t pt-4 text-sm">
            <p className="font-medium">{session.user.name}</p>
            <p className="text-muted-foreground">{session.user.email}</p>
            <Badge variant="outline" className="mt-1">{session.user.role}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
