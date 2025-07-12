"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Ban,
  CheckCircle2,
  Clock,
  FileWarning,
  Mail,
  Send,
  Trash2,
  UserCheck,
  Users,
  Download,
} from "lucide-react";

const mockUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", banned: false },
  { id: 2, name: "Bob Smith", email: "bob@example.com", banned: true },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", banned: false },
];

const mockQuestions = [
  { id: 1, title: "What is JSX?", status: "pending" },
  { id: 2, title: "Explain React hooks.", status: "approved" },
  { id: 3, title: "Difference between var, let, const?", status: "pending" },
];

export default function AdminPage() {
  const [users, setUsers] = useState(mockUsers);
  const [questions, setQuestions] = useState(mockQuestions);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const handleBanToggle = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, banned: !user.banned } : user
      )
    );
  };

  const handleQuestionAction = (id, action) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status: action === "approve" ? "approved" : "rejected" }
          : q
      )
    );
    
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return console.log("Message cannot be empty.");
    setBroadcastMessage("");
  };

  const downloadReport = (type) => {
    console.log("downloaded")
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileWarning className="h-5 w-5" /> Questions Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {questions.filter((q) => q.status === "pending").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" /> Banned Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {users.filter((u) => u.banned).length}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              {user.banned ? (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" /> Unban
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" /> Ban
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure you want to{" "}
                                {user.banned ? "unban" : "ban"} this user?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <Button
                                onClick={() => handleBanToggle(user.id)}
                                variant="destructive"
                              >
                                Confirm
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTENT MODERATION */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>{q.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            q.status === "approved"
                              ? "success"
                              : q.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {q.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuestionAction(q.id, "approve")}
                          disabled={q.status === "approved"}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleQuestionAction(q.id, "reject")}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => downloadReport("Full Analytics")}>
                <Download className="mr-2 h-4 w-4" />
                Download Full Analytics
              </Button>
              <Button onClick={() => downloadReport("User Activity")}>
                <Download className="mr-2 h-4 w-4" />
                Download User Activity
              </Button>
              <Button onClick={() => downloadReport("Content Stats")}>
                <Download className="mr-2 h-4 w-4" />
                Download Content Stats
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BROADCAST */}
        <TabsContent value="broadcast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Broadcast Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your message here..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={handleSendBroadcast}>
                <Send className="mr-2 h-4 w-4" />
                Send Broadcast
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
