"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const authData = localStorage.getItem('aura_auth');
    if (!authData) {
      router.replace('/');
      return;
    }
    const { schoolId } = JSON.parse(authData);
    if (schoolId === 'admin') {
      router.replace('/admin'); // Admins shouldn't be on this page
      return;
    }
    const schools: School[] = JSON.parse(localStorage.getItem('aura_schools') || '[]');
    const currentSchool = schools.find(s => s.id === schoolId);
    if (currentSchool) {
      setSchool(currentSchool);
    } else {
      router.replace('/'); // School not found
    }
  }, [router]);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
  });

  const onSubmit = (values: z.infer<typeof passwordSchema>) => {
    setLoading(true);

    if (values.currentPassword !== school?.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Your current password is incorrect.",
      });
      setLoading(false);
      return;
    }
    
    const schools: School[] = JSON.parse(localStorage.getItem('aura_schools') || '[]');
    const updatedSchools = schools.map(s =>
      s.id === school?.id ? { ...s, password: values.newPassword } : s
    );
    localStorage.setItem('aura_schools', JSON.stringify(updatedSchools));

    toast({
      title: "Success",
      description: "Your password has been changed successfully.",
    });
    form.reset();
    setLoading(false);
  };

  if (!school) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Go Back</span>
            </Button>
            <h1 className="text-3xl font-headline tracking-tight">Profile Settings</h1>
        </header>

        <Card className="shadow-lg border">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update the password for your school account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input type={showCurrentPassword ? "text" : "password"} placeholder="Enter your current password" {...field} />
                           <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                               <span className="sr-only">{showCurrentPassword ? 'Hide password' : 'Show password'}</span>
                               {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                         <div className="relative">
                           <Input type={showNewPassword ? "text" : "password"} placeholder="Enter new password" {...field} />
                           <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowNewPassword(!showNewPassword)}>
                              <span className="sr-only">{showNewPassword ? 'Hide password' : 'Show password'}</span>
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </Button>
                         </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                         <div className="relative">
                           <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your new password" {...field} />
                           <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </Button>
                         </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full !mt-8" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}