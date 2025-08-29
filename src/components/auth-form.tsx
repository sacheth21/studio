"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  id: z.string().min(1, "Email or School ID is required."),
  password: z.string().min(1, "Password is required."),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  otp: z.string().length(6, "OTP must be 6 digits."),
  name: z.string().min(2, "School name must be at least 2 characters."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newSchoolId, setNewSchoolId] = useState<string | null>(null);
  const [showNewIdDialog, setShowNewIdDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { id: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", otp: "", name: "", password: "" },
  });

  const handleSendOtp = () => {
    const email = registerForm.getValues("email");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address to receive an OTP.",
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setOtpSent(true);
      setLoading(false);
      toast({
        title: "OTP Sent (Simulated)",
        description: `For testing purposes, your OTP is: ${otp}`,
      });
    }, 1000);
  };
  
  const handleVerifyOtp = () => {
    const otp = registerForm.getValues("otp");
    if (otp === generatedOtp) {
        setIsOtpVerified(true);
        toast({
            title: "Success",
            description: "OTP verified successfully. You can now complete your registration.",
        });
    } else {
        toast({
            variant: "destructive",
            title: "Invalid OTP",
            description: "The OTP you entered is incorrect.",
        });
    }
  };


  const onLogin = (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    setTimeout(() => {
      // Admin Login
      if (values.id === 'gaganrathod2008@gmail.com' && values.password === '11aug2008') {
        localStorage.setItem('aura_auth', JSON.stringify({ schoolId: 'admin' }));
        toast({ title: "Admin Login Successful", description: "Redirecting to the admin panel..." });
        router.push('/admin');
        setLoading(false);
        return;
      }
      
      // School Login
      const schools: School[] = JSON.parse(localStorage.getItem('aura_schools') || '[]');
      const school = schools.find(s => s.id === values.id && s.password === values.password);

      if (school) {
        localStorage.setItem('aura_auth', JSON.stringify({ schoolId: school.id }));
        toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
        router.push('/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid credentials.",
        });
      }
      setLoading(false);
    }, 1000);
  };

  const onRegister = (values: z.infer<typeof registerSchema>) => {
    if (!isOtpVerified) {
        toast({
            variant: "destructive",
            title: "OTP Not Verified",
            description: "Please verify your email with an OTP before registering.",
        });
        return;
    }
    setLoading(true);
    setTimeout(() => {
        const schools: School[] = JSON.parse(localStorage.getItem('aura_schools') || '[]');
        const newId = (111 + schools.length).toString();
        const newSchool: School = {
            id: newId,
            name: values.name,
            password: values.password,
            addedDate: new Date().toLocaleDateString('en-US'),
            walletBalance: 0,
        };

        schools.push(newSchool);
        localStorage.setItem('aura_schools', JSON.stringify(schools));

        setNewSchoolId(newId);
        setShowNewIdDialog(true);
        registerForm.reset();
        setLoading(false);
        setOtpSent(false);
        setIsOtpVerified(false);
    }, 1000);
  };
  
  return (
    <>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6 pt-4">
              <FormField
                control={loginForm.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email / School ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Email or School ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} />
                        <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                          <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full !mt-8" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="register">
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6 pt-4">
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Email</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} disabled={otpSent}/>
                      </FormControl>
                      <Button type="button" onClick={handleSendOtp} disabled={loading || otpSent}>
                         {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send OTP
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {otpSent && !isOtpVerified && (
                 <FormField
                    control={registerForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                         <div className="flex gap-2">
                            <FormControl>
                            <Input placeholder="Enter 6-digit OTP" {...field} />
                            </FormControl>
                            <Button type="button" onClick={handleVerifyOtp}>Verify</Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}

              <fieldset disabled={!isOtpVerified} className="space-y-6">
                <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>School Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Enter school name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="Create a strong password" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </fieldset>
              <Button type="submit" className="w-full !mt-8" disabled={loading || !isOtpVerified}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
      <AlertDialog open={showNewIdDialog} onOpenChange={setShowNewIdDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registration Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Your school has been registered. Your new School ID is:
              <br />
              <strong className="text-lg text-primary font-mono my-2 block text-center bg-muted p-2 rounded-md">{newSchoolId}</strong>
              Please use this ID and your password to log in. This password will also be required for card recharges. Your wallet is currently empty, please contact an admin to add funds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNewIdDialog(false)}>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
