"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lock, Unlock, Users } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  organization: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  } | null;
  createdAt: string;
}

export default function AdminPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchUsers();
  }, [session, router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: t("common.error"),
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update user");

      toast({
        title: t("common.success"),
        description: `User ${!currentStatus ? "activated" : "frozen"} successfully`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const toggleOrganizationStatus = async (orgId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update organization");

      toast({
        title: t("common.success"),
        description: `Organization ${!currentStatus ? "activated" : "frozen"} successfully`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Failed to update organization",
        variant: "destructive",
      });
    }
  };

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all users and organizations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">{t("common.loading")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>User Status</TableHead>
                    <TableHead>Org Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN"
                              ? "destructive"
                              : user.role === "OWNER"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.organization ? (
                          <div>
                            <div className="font-medium">
                              {user.organization.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{user.organization.slug}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "paid" : "cancelled"}>
                          {user.isActive ? "Active" : "Frozen"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.organization ? (
                          <Badge
                            variant={
                              user.organization.isActive ? "paid" : "cancelled"
                            }
                          >
                            {user.organization.isActive ? "Active" : "Frozen"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.role !== "ADMIN" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleUserStatus(user.id, user.isActive)
                              }
                            >
                              {user.isActive ? (
                                <>
                                  <Lock className="h-4 w-4 me-1" />
                                  Freeze User
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 me-1" />
                                  Activate User
                                </>
                              )}
                            </Button>
                          )}
                          {user.organization && user.role !== "ADMIN" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleOrganizationStatus(
                                  user.organization!.id,
                                  user.organization!.isActive
                                )
                              }
                            >
                              {user.organization.isActive ? (
                                <>
                                  <Lock className="h-4 w-4 me-1" />
                                  Freeze Org
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 me-1" />
                                  Activate Org
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



