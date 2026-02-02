
'use client';

import { deleteUser } from '@/lib/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function DeleteUserButton({ user, triggerType = 'button' }: { user: User, triggerType?: 'button' | 'menuitem' }) {
  const { toast } = useToast();
  const isOwner = user.role === 'Owner';

  const handleDelete = async () => {
    await deleteUser(user.id);
    toast({
      title: 'Success!',
      description: 'The user has been deleted.',
    });
  };

  if (isOwner) {
    const disabledButton = triggerType === 'button' ? (
        <Button variant="destructive" size="icon" disabled>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete User</span>
        </Button>
      ) : (
         <span className="relative flex cursor-not-allowed select-none items-center rounded-sm px-2 py-1.5 text-sm opacity-50 w-full text-destructive">Delete</span>
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
            <p>The owner account cannot be deleted.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const triggerElement = triggerType === 'button' ? (
    <Button variant="destructive" size="icon">
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete User</span>
    </Button>
  ) : (
    <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive focus:bg-destructive/10 focus:text-destructive">Delete</button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {triggerElement}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
