import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, PlusIcon, TrashIcon, UserIcon, Users2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  ciprNumber: string;
}

export default function CorporateSignupForm() {
  const [companyName, setCompanyName] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [users, setUsers] = useState<User[]>([
    { firstName: "", lastName: "", email: "", ciprNumber: "" }
  ]);

  // Add a new user row
  const addUser = () => {
    setUsers([...users, { firstName: "", lastName: "", email: "", ciprNumber: "" }]);
  };

  // Remove a user row
  const removeUser = (index: number) => {
    if (users.length > 1) {
      const updatedUsers = [...users];
      updatedUsers.splice(index, 1);
      setUsers(updatedUsers);
    }
  };

  // Update user information
  const updateUser = (index: number, field: keyof User, value: string) => {
    const updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setUsers(updatedUsers);
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Users2Icon className="h-4 w-4" />
            <span>Company Info</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Admin Account</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users2Icon className="h-4 w-4" />
            <span>Team Members</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Enter your company details. All users must share the same office address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Office Address</Label>
                <Input 
                  id="address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input 
                    id="province" 
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  All team members must be at the same office location to qualify for corporate pricing.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Back</Button>
              <Button>Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Account</CardTitle>
              <CardDescription>
                This person will manage your corporate subscription and have administrative access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminFirstName">First Name</Label>
                  <Input 
                    id="adminFirstName" 
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminLastName">Last Name</Label>
                  <Input 
                    id="adminLastName" 
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input 
                  id="adminEmail" 
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Phone Number</Label>
                <Input 
                  id="adminPhone" 
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The admin will receive all communications regarding billing and account management.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Back</Button>
              <Button>Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Add team members who need access to continuing education courses.
                Each team member will get their own account with their CIPR number.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {users.map((user, index) => (
                <div key={index} className="space-y-4">
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Team Member #{index + 1}</h4>
                    {users.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeUser(index)}
                        className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`firstName-${index}`}>First Name</Label>
                      <Input 
                        id={`firstName-${index}`} 
                        value={user.firstName}
                        onChange={(e) => updateUser(index, "firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                      <Input 
                        id={`lastName-${index}`} 
                        value={user.lastName}
                        onChange={(e) => updateUser(index, "lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`}>Email</Label>
                    <Input 
                      id={`email-${index}`} 
                      type="email"
                      value={user.email}
                      onChange={(e) => updateUser(index, "email", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`ciprNumber-${index}`}>CIPR Number</Label>
                    <Input 
                      id={`ciprNumber-${index}`} 
                      value={user.ciprNumber}
                      onChange={(e) => updateUser(index, "ciprNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2"
                onClick={addUser}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Another Team Member
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Back</Button>
              <Button>Submit Registration</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}