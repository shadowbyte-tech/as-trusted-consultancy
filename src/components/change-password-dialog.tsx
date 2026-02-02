
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';
import { changeUserPassword } from '@/lib/actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function ChangePasswordDialog({ user, triggerType = 'button' }: { user: User, triggerType?: 'button' | 'menuitem' }) {
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isOwner = user.role === 'Owner';

  const handleSubmit = async () => {
    if (!password) {
      toast({
        title: 'Error',
        description: 'Password cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    
    await changeUserPassword(user.id, password);
    toast({
      title: 'Success!',
      description: `Password for ${user.email} has been changed.`,
    });
    setOpen(false);
    setPassword('');
  };
  
  if (isOwner) {
     const disabledButton = triggerType === 'button' ? (
        <Button variant="outline" size="icon" disabled>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Change Password</span>
        </Button>
      ) : (
         <span className="relative flex cursor-not-allowed select-none items-center rounded-sm px-2 py-1.5 text-sm opacity-50 w-full">Change Password</span>
      )
    return (
       <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              {disabledButton}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>The owner's password cannot be changed from here.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const triggerElement = triggerType === 'button' ? (
      <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
           <span className="sr-only">Change Password</span>
      </Button>
  ) : (
      <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">Change Password</button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter a new password for {user.email}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
             <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
