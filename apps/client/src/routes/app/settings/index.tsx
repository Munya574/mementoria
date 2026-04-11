import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/hooks/use-session";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/utils";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Camera, LogOut, Save, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const router = useRouter();
  const { session, refetch } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name,
        email: session.user.email,
      });
    }
  }, [session]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!session) return;
    setIsSaving(true);

    try {
      const { error } = await authClient.updateUser({ name: formData.name });
      if (error) {
        toast.error(error.message || "Failed to save changes");
      } else {
        toast.success("Profile updated");
        await refetch();
      }
    } catch {
      toast.error("Unable to save settings right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.revokeSession({
        token: session?.session.token ?? "",
      });
    } catch {
      // ignore logout errors and continue
    }
    router.navigate({ to: "/auth" });
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account functionality
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      console.log("Deleting account...");
    }
  };

  const hasChanges = formData.name !== session?.user.name;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={session?.user.image as string}
                alt={`Profile Picture of ${session?.user.name}`}
              />
              <AvatarFallback className="text-lg">
                {initials(session?.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </span>
                </Button>
              </Label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email changes require identity verification and are not yet
                supported.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleSaveChanges}
          disabled={!hasChanges || isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>

        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </div>
    </div>
  );
}
