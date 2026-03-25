import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Dumbbell, Link2, LogOut, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin, useUserProfile } from "../hooks/useQueries";

const navLinks = [
  { label: "Dashboard", path: "/" },
  { label: "Workouts", path: "/workouts" },
  { label: "Health", path: "/health" },
  { label: "History", path: "/history" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const displayName =
    userProfile?.name ||
    `${identity?.getPrincipal().toString().slice(0, 8)}...` ||
    "User";
  const initials = (userProfile?.name || "U").slice(0, 2).toUpperCase();

  const allNavLinks = [
    ...navLinks,
    ...(isAdmin ? [{ label: "Invite", path: "/invite" }] : []),
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #0f3a8a 0%, #1E73E8 60%, #5ba3f5 100%)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* App canvas */}
        <div className="bg-background rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  GymTrack
                </span>
              </div>

              {/* Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {allNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    data-ocid={`nav.${link.label.toLowerCase()}.link`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPath === link.path
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label === "Invite" ? (
                      <span className="flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5" />
                        Invite
                      </span>
                    ) : (
                      link.label
                    )}
                  </Link>
                ))}
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  data-ocid="nav.notification.button"
                >
                  <Bell className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      data-ocid="nav.user.dropdown_menu"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden md:block">
                        {displayName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-destructive"
                      onClick={clear}
                      data-ocid="nav.logout.button"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile nav */}
            <nav className="md:hidden flex items-center gap-1 mt-3 overflow-x-auto">
              {allNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-ocid={`nav.mobile.${link.label.toLowerCase()}.link`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    currentPath === link.path
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>

          {/* Main content */}
          <main>{children}</main>

          {/* Footer */}
          <footer
            className="px-6 py-4"
            style={{ background: "oklch(var(--footer, 0.25 0.01 255))" }}
          >
            <p
              className="text-center text-sm"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(255,255,255,0.9)" }}
                className="underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
