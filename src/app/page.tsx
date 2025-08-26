import { AuthForm } from '@/components/auth-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gem } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center space-y-4">
             <div className="flex justify-center items-center">
               <Gem className="h-12 w-12 text-primary" />
             </div>
            <CardTitle className="text-4xl font-headline tracking-tight">Aura Admin Portal</CardTitle>
            <CardDescription className="text-lg">Welcome! Manage your schools with ease.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <AuthForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
