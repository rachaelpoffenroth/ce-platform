import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Home, 
  BookOpen, 
  Users, 
  BarChart, 
  Settings, 
  LogOut, 
  User,
  Plus,
  Bell,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isInstructor = user?.role === "instructor" || user?.role === "admin";

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      active: location === "/"
    },
    ...(isInstructor ? [
      {
        name: "Create Course",
        href: "/create-course",
        icon: Plus,
        active: location === "/create-course"
      },
      {
        name: "My Courses",
        href: "/courses",
        icon: BookOpen,
        active: location.startsWith("/courses")
      },
      {
        name: "Students",
        href: "/students",
        icon: Users,
        active: location === "/students"
      },
      {
        name: "Analytics",
        href: "/analytics",
        icon: BarChart,
        active: location === "/analytics"
      }
    ] : [
      {
        name: "My Learning",
        href: "/student",
        icon: BookOpen,
        active: location === "/student"
      }
    ])
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50" data-testid="main-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-primary-foreground h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-foreground">EduFlow AI</span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses, modules..."
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu-trigger">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || user?.email || ""} />
                      <AvatarFallback>
                        {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email
                        }
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/settings")} data-testid="menu-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setLocation(item.href)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Role Badge */}
      {isInstructor && (
        <div className="fixed bottom-4 right-4 z-50">
          <Badge variant="default" className="px-3 py-1">
            Instructor Mode
          </Badge>
        </div>
      )}
    </div>
  );
}
