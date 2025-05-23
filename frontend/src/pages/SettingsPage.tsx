import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  Button,
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Input,
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger, 
  DialogDescription 
} from "@/components/ui";
import UIShowcase from "@/components/examples/UIShowcase";

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button variant="outline" size="sm">Save Changes</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="components">UI Components</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize the appearance of the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Theme Mode</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        checked={theme === "light"}
                        onChange={() => setTheme("light")}
                        className="accent-primary"
                      />
                      <span>Light</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        checked={theme === "dark"}
                        onChange={() => setTheme("dark")}
                        className="accent-primary"
                      />
                      <span>Dark</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        checked={theme === "system"}
                        onChange={() => setTheme("system")}
                        className="accent-primary"
                      />
                      <span>System</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="Enter your full name" />
                <Input label="Email" type="email" placeholder="Enter your email" />
              </div>
              <div className="pt-4">
                <Button>Update Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add notification preferences here */}
                <p className="text-muted-foreground">Notification settings coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export, import, or reset your data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline">Export Data</Button>
                <Button variant="outline">Import Data</Button>
                
                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Reset Data</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Data</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete all your data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Are you sure you want to reset all your data? All your habits, progress, and settings will be deleted.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={() => {
                        // Handle reset
                        setResetDialogOpen(false);
                      }}>
                        Delete All Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <UIShowcase />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
