
'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Send, Mail, User } from 'lucide-react';
import { useRef } from 'react';
import { saveInquiry } from '@/lib/actions';

export default function ContactForm({ plotNumber }: { plotNumber: string }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await saveInquiry(formData);
    
    if (result.success) {
      toast({
        title: 'Inquiry Sent!',
        description: "Thank you for your interest. We will get back to you shortly.",
      });
      formRef.current?.reset();
    } else {
        toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interested in this plot?</CardTitle>
        <CardDescription>
          Fill out the form below to send an inquiry to the owner.
        </CardDescription>
      </CardHeader>
      <form ref={formRef} action={handleSubmit}>
        <CardContent className="space-y-4">
          <input type="hidden" name="plotNumber" value={plotNumber} />
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="name" 
                name="name"
                placeholder="John Doe" 
                required 
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@consult.com"
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder={`I'm interested in Plot No. ${plotNumber} and would like more information...`}
              required
              minLength={10}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Send Inquiry
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
