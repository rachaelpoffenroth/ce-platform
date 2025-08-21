import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { 
  MenuIcon, 
  GraduationCapIcon, 
  BookOpenIcon, 
  Award, 
  SettingsIcon,
  UsersIcon,
  BarChartIcon,
  LogOutIcon,
} from "lucide-react";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">
              CE
            </div>
            <span className="hidden sm:inline-block font-bold text-xl">Easy CE</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="ml-auto flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                {user.role === 'student' ? (
                  <>
                    <Button variant={isActive('/student-dashboard') ? "default" : "ghost"} onClick={() => navigate('/student-dashboard')}>Dashboard</Button>
                    <Button variant={isActive('/courses') ? "default" : "ghost"} onClick={() => navigate('/courses')}>Courses</Button>
                    <Button variant={isActive('/certificates') ? "default" : "ghost"} onClick={() => navigate('/certificates')}>Certificates</Button>
                  </>
                ) : (
                  <>
                    <Button variant={isActive('/instructor-dashboard') ? "default" : "ghost"} onClick={() => navigate('/instructor-dashboard')}>Dashboard</Button>
                    <Button variant={isActive('/course-creator') ? "default" : "ghost"} onClick={() => navigate('/course-creator')}>Course Creator</Button>
                    <Button variant={isActive('/students') ? "default" : "ghost"} onClick={() => navigate('/students')}>Students</Button>
                    <Button variant={isActive('/analytics') ? "default" : "ghost"} onClick={() => navigate('/analytics')}>Analytics</Button>
                  </>
                )}
              </>
            )}

            {!user && (
              <>
                <Button variant="ghost" onClick={() => navigate('/about')}>About</Button>
                <Button variant="ghost" onClick={() => navigate('/pricing')}>Pricing</Button>
                <Button variant="ghost" onClick={() => navigate('/contact')}>Contact</Button>
              </>
            )}
          </div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.png" alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <Award className="mr-2 h-4 w-4" />
                  <span>My Certificates</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center cursor-pointer" onClick={handleLogout}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div>
              <Button variant="ghost" onClick={() => navigate('/login')} className="mr-2">
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          )}
          
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="py-4 space-y-4">
                  {user ? (
                    <>
                      <div className="mb-4 flex items-center">
                        <Avatar className="h-10 w-10 mr-2">
                          <AvatarImage src="/placeholder-avatar.png" alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {user.role === 'student' ? (
                          <>
                            <Button 
                              variant={isActive('/student-dashboard') ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => {
                                navigate('/student-dashboard');
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <GraduationCapIcon className="mr-2 h-4 w-4" />
                              Dashboard
                            </Button>
                            <Button 
                              variant={isActive('/courses') ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => {
                                navigate('/courses');
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <BookOpenIcon className="mr-2 h-4 w-4" />
                              Courses
                            </Button>
                            <Button 
                              variant={isActive('/certificates') ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => {
                                navigate('/certificates');
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <Award className="mr-2 h-4 w-4" />
                              Certificates
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant={isActive('/instructor-dashboard') ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => {
                                navigate('/instructor-dashboard');
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <GraduationCapIcon className="mr-2 h-4 w-4" />
                              Dashboard
                            </Button>
                            <Button 
                              variant={isActive('/course-creator') ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => {
                                navigate('/course-creator');
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <BookOpenIcon className="mr-2 h-4 w-4" />
                              Course Creator
                            </Button>
                            <Button 
                              variant={isActive('/students') ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => {
                                navigate('/students');
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <UsersIcon className="mr-2 h-4 w-4" />
                              Students
                            </Button>
                            <Button 
                              variant={isActive('/analytics') ? "default" : "ghost"}
                              className="w-full justify-start"
                              onClick={() => {
                                navigate('/analytics');
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <BarChartIcon className="mr-2 h-4 w-4" />
                              Analytics
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="pt-4">
                        <Button 
                          variant="ghost"
                          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <LogOutIcon className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <Button 
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            navigate('/about');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          About
                        </Button>
                        <Button 
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            navigate('/pricing');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Pricing
                        </Button>
                        <Button 
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            navigate('/contact');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Contact
                        </Button>
                      </div>
                      <div className="pt-4 space-y-2">
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            navigate('/login');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Sign In
                        </Button>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            navigate('/register');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Register
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}