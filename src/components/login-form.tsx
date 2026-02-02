
'use client';

import React, { useState } from 'react';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Mail, ShieldQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ASLogo } from './as-logo';

type View = 'manual' | 'forgot-password' | 'reset-password';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<View>('manual');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for manual login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
        router.push('/dashboard');
        toast({
            title: 'Login Successful',
            description: 'Welcome back!',
        });
    } else {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid email or password. Please try again.',
        });
    }
  };

  const handleSecurityQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityAnswer.toLowerCase() === 'mani') {
        toast({
            title: 'Success!',
            description: 'Security question answered correctly. Please reset your password.',
        });
        setView('reset-password');
    } else {
        toast({
            title: 'Incorrect Answer',
            description: 'The answer to the security question is not correct. Please try again.',
            variant: 'destructive',
        });
    }
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        toast({
            title: 'Passwords Mismatch',
            description: 'The new passwords do not match. Please try again.',
            variant: 'destructive',
        });
        return;
    }
    if (newPassword.length < 6) {
        toast({
            title: 'Password Too Short',
            description: 'Your new password must be at least 6 characters long.',
            variant: 'destructive',
        });
        return;
    }
    // In a real app, this would call an action to update the password
    console.log('Password reset successfully (simulated). New password:', newPassword);
    toast({
        title: 'Password Reset!',
        description: 'Your password has been successfully changed. Please log in with your new password.',
    });
    
    setView('manual');
  }

  const renderContent = () => {
    switch (view) {
        case 'reset-password':
            return (
                <form onSubmit={handlePasswordReset}>
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>Enter and confirm your new password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="newPassword" 
                                    type="password" 
                                    placeholder="••••••••" 
                                    required 
                                    className="pl-10" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="confirmPassword" 
                                    type="password" 
                                    placeholder="••••••••" 
                                    required 
                                    className="pl-10" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full">
                            Set New Password
                        </Button>
                         <Button variant="link" type="button" onClick={() => setView('manual')} className="p-0 h-auto">
                            Back to Login
                        </Button>
                    </CardFooter>
                </form>
            );
        case 'forgot-password':
            return (
                 <form onSubmit={handleSecurityQuestionSubmit}>
                    <CardHeader>
                        <CardTitle>Forgot Password</CardTitle>
                        <CardDescription>To reset your password, please answer the security question below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="securityQuestion">Who is your favorite person?</Label>
                            <div className="relative">
                                <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    id="securityQuestion" 
                                    type="text" 
                                    placeholder="Enter your answer" 
                                    required 
                                    className="pl-10" 
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full">
                            Submit Answer
                        </Button>
                        <Button variant="link" type="button" onClick={() => setView('manual')} className="p-0 h-auto">
                            Back to Login
                        </Button>
                    </CardFooter>
                </form>
            );
        case 'manual':
        default:
             return (
                 <form onSubmit={handleManualLogin}>
                    <CardHeader className="items-center text-center">
                       <ASLogo className="h-16 w-16 mb-2" />
                       <CardTitle>Owner Sign In</CardTitle>
                       <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="Email" required className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            required
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        </div>
                    </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>
                         <Button variant="link" type="button" onClick={() => setView('forgot-password')} className="p-0 h-auto text-sm">
                            Forgot Password?
                        </Button>
                    </CardFooter>
                </form>
            );
    }
  }

  return (
    <Card className="w-full">
        {renderContent()}
    </Card>
  );
}
