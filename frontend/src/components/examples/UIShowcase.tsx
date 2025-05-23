import React, { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";

const UIShowcase: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("buttons");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">UI Components Showcase</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="dialog">Dialog</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-4">
          <h2 className="text-xl font-semibold">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
          </div>

          <h2 className="text-xl font-semibold mt-6">Button Sizes</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <span className="text-lg">+</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="inputs" className="space-y-4">
          <h2 className="text-xl font-semibold">Input Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Default input" />
            <Input variant="outline" placeholder="Outline input" />
            <Input variant="ghost" placeholder="Ghost input" />
            <Input
              error
              helperText="This field has an error"
              placeholder="Error input"
            />
            <Input
              helperText="This is helper text"
              placeholder="With helper text"
            />
            <Input disabled placeholder="Disabled input" />
          </div>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <h2 className="text-xl font-semibold">Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is the default card style with a header and content.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <CardTitle>Outline Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is an outline card style with a header and content.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is an elevated card style with a header and content.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>

            <Card variant="filled">
              <CardHeader>
                <CardTitle>Filled Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is a filled card style with a header and content.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <h2 className="text-xl font-semibold">Badge Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
          </div>

          <h2 className="text-xl font-semibold mt-6">Badge Sizes</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge size="sm">Small</Badge>
            <Badge>Default</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <h2 className="text-xl font-semibold">Progress Variants</h2>
          <div className="space-y-6">
            <div>
              <p className="mb-2">Default (75%)</p>
              <Progress value={75} />
            </div>
            <div>
              <p className="mb-2">Success (50%)</p>
              <Progress value={50} variant="success" />
            </div>
            <div>
              <p className="mb-2">Warning (25%)</p>
              <Progress value={25} variant="warning" />
            </div>
            <div>
              <p className="mb-2">Destructive (90%)</p>
              <Progress value={90} variant="destructive" />
            </div>
          </div>

          <h2 className="text-xl font-semibold mt-6">Progress Sizes</h2>
          <div className="space-y-6">
            <div>
              <p className="mb-2">Small</p>
              <Progress value={60} size="sm" />
            </div>
            <div>
              <p className="mb-2">Default</p>
              <Progress value={60} />
            </div>
            <div>
              <p className="mb-2">Large</p>
              <Progress value={60} size="lg" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dialog" className="space-y-4">
          <h2 className="text-xl font-semibold">Dialog Component</h2>
          <div className="space-y-4">
            <p>Click the button below to open a dialog:</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Example</DialogTitle>
                  <DialogDescription>
                    This is an example of a dialog component that can be used
                    for confirmations or forms.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    Dialog content goes here. This could be a form or any other
                    content.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UIShowcase;
