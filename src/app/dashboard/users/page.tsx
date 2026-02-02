
import { getUsers } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import DeleteUserButton from '@/components/delete-user-button';
import { User } from '@/lib/definitions';
import ChangePasswordDialog from '@/components/change-password-dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserPlus, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default async function ManageUsersPage() {
  const users = await getUsers();

  return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Logins</h1>
          <p className="text-muted-foreground">
            View and manage accounts that can log in to the platform.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All User Logins</CardTitle>
              <CardDescription className="mt-1">
                  A list of all registered users with login access.
              </CardDescription>
            </div>
            <Button asChild>
                <Link href="/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create User
                </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="grid gap-4 sm:hidden">
              {users.map((user: User) => (
                <Card key={user.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <Badge variant={user.role === 'Owner' ? 'default' : 'secondary'} className="mt-1">
                        {user.role}
                      </Badge>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <div>
                                    <ChangePasswordDialog user={user} triggerType="menuitem" />
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <div>
                                    <DeleteUserButton user={user} triggerType="menuitem" />
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>


            {/* Desktop View */}
            <Table className="hidden sm:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Owner' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       <ChangePasswordDialog user={user} />
                       <DeleteUserButton user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
