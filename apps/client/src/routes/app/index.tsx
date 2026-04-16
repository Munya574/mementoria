import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Book, Clock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

interface Scrapbook {
  id: string;
  title: string;
  pages: { id: string }[];
  updatedAt: string;
}

const SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ||
  "http://localhost:4000";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function DashboardPage() {
  const { session } = useSession();
  const [scrapbooks, setScrapbooks] = useState<Scrapbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/scrapbooks`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as Scrapbook[];
        // Show 3 most recently updated
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        setScrapbooks(sorted.slice(0, 3));
      } catch {
        toast.error("Failed to load recent scrapbooks.");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome, {session?.user.name}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to embrace your whimsy?
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Recents
          </h2>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/app/scrapebooks">
              <Plus className="h-4 w-4 mr-2" />
              New Scrapbook
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : scrapbooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scrapbooks.map((scrapbook) => (
              <Link key={scrapbook.id} to="/app/scrapebooks">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Book className="h-5 w-5 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {scrapbook.pages.length} page
                        {scrapbook.pages.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardTitle className="text-lg text-card-foreground mb-2">
                      {scrapbook.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Last updated {timeAgo(scrapbook.updatedAt)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 border-dashed border-2 border-muted">
            <CardContent>
              <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No recent scrapbooks
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Let's start your creation journey!!!
              </p>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/app/scrapebooks">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Scrapbook
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
