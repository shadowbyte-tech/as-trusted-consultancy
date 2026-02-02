
'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SettingsPage() {
    const { toast } = useToast();
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast({
                title: 'Error',
                description: 'New passwords do not match.',
                variant: 'destructive',
            });
            return;
        }
        if (passwords.new.length < 6) {
             toast({
                title: 'Error',
                description: 'Password must be at least 6 characters long.',
                variant: 'destructive',
            });
            return;
        }
        // In a real app, you would call a server action here.
        console.log('Changing password...');
        toast({
            title: 'Success!',
            description: 'Your password has been changed (simulated).',
        });
        setPasswords({ current: '', new: '', confirm: '' });
    };

  return (
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your login credentials and security settings.
          </p>
        </div>

        <Card>
            <form onSubmit={handlePasswordChange}>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        For security, please choose a strong password.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="currentPassword" type="password" placeholder="••••••••" required className="pl-10" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="newPassword" type="password" placeholder="••••••••" required className="pl-10" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})}/>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="confirmPassword" type="password" placeholder="••••••••" required className="pl-10" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})}/>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit">Update Password</Button>
                </CardFooter>
            </form>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                    Customize the look and feel of the application.
                </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label className="text-base flex items-center">
                            <Palette className="mr-2 h-4 w-4" />
                            Theme
                        </Label>
                        <p className="text-sm text-muted-foreground">Select a light or dark theme for the interface.</p>
                    </div>
                    <ThemeToggle />
                </div>
            </CardContent>
        </Card>

      </div>
  );
}
