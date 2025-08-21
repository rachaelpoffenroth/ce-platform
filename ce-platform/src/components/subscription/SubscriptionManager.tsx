import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CalendarIcon, CheckIcon, DownloadIcon, RefreshCwIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SubscriptionProps {
  type: "individual" | "corporate";
  plan: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  totalDays: number;
  receiptUrl?: string;
  users?: {
    name: string;
    email: string;
    ciprNumber: string;
    completedCourses: number;
  }[];
}

export default function SubscriptionManager({ 
  type, 
  plan, 
  startDate, 
  endDate, 
  daysRemaining,
  totalDays,
  receiptUrl,
  users
}: SubscriptionProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Calculate percentage of subscription remaining
  const percentageRemaining = Math.round((daysRemaining / totalDays) * 100);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Your Subscription</CardTitle>
              <CardDescription>Manage your {type === "individual" ? "individual" : "corporate"} subscription</CardDescription>
            </div>
            <Badge variant={daysRemaining < 14 ? "destructive" : "outline"}>
              {daysRemaining} days remaining
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-1 space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-medium">{plan}</span>
              <span>{percentageRemaining}% remaining</span>
            </div>
            <Progress value={percentageRemaining} className="h-2" />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span>Started: {new Date(startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span>Expires: {new Date(endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {daysRemaining < 14 && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Subscription Expiring Soon</AlertTitle>
              <AlertDescription>
                Your subscription will expire in {daysRemaining} days. Renew now to maintain uninterrupted access.
              </AlertDescription>
            </Alert>
          )}
          
          {receiptUrl && (
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(receiptUrl, '_blank')}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download Receipt for Tax Purposes
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-3">
          <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
            Cancel Subscription
          </Button>
          <Button>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Renew Subscription
          </Button>
        </CardFooter>
      </Card>
      
      {type === "corporate" && users && (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users in your organization. All users must be at the same office location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Name</th>
                    <th className="py-3 px-4 text-left font-medium">Email</th>
                    <th className="py-3 px-4 text-left font-medium">CIPR #</th>
                    <th className="py-3 px-4 text-left font-medium">Courses Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4">{user.ciprNumber}</td>
                      <td className="py-2 px-4">{user.completedCourses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm">
                Add User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel?</DialogTitle>
            <DialogDescription>
              Cancelling your subscription will limit your access to courses at the end of your current billing period.
              You will still have access until {new Date(endDate).toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Your benefits</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm mt-1">
                  <li>Access to all courses until your subscription ends</li>
                  <li>Keep all earned certificates</li>
                  <li>Download your completion history</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Subscription</Button>
            <Button variant="destructive">Confirm Cancellation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}