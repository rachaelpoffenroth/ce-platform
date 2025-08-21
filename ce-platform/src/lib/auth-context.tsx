import { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  createdAt: string;
  profile?: {
    avatar?: string;
    ciprNumber?: string;
    organization?: string;
  }
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For demo purposes, we'll simulate a successful login
      if (email === "rachaelpoffenroth@gmail.com" && password === "Parent77") {
        const userData: User = {
          id: "user_123",
          name: "Rachael Poffenroth",
          email: "rachaelpoffenroth@gmail.com",
          role: "admin",
          createdAt: new Date().toISOString(),
          profile: {
            ciprNumber: "CIP12345",
            organization: "Easy CE Admin"
          }
        };
        
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else if (email === "student@example.com" && password === "password") {
        const userData: User = {
          id: "user_456",
          name: "John Student",
          email: "student@example.com",
          role: "student",
          createdAt: new Date().toISOString(),
          profile: {
            ciprNumber: "CIP67890"
          }
        };
        
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else if (email === "instructor@example.com" && password === "password") {
        const userData: User = {
          id: "user_789",
          name: "Jane Instructor",
          email: "instructor@example.com",
          role: "instructor",
          createdAt: new Date().toISOString(),
          profile: {
            ciprNumber: "CIP54321",
            organization: "Insurance Pro Training"
          }
        };
        
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to login");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For demo purposes, we'll simulate a successful registration
      
      // Check if email is already in use
      if (userData.email === "rachaelpoffenroth@gmail.com") {
        throw new Error("Email already in use");
      }
      
      const newUser: User = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        name: userData.name || "New User",
        email: userData.email || "user@example.com",
        role: userData.role || "student",
        createdAt: new Date().toISOString(),
        profile: userData.profile
      };
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to register");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};