
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, School, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-3 mb-8">
            <Gem className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-headline tracking-tight">Admin Panel</h1>
        </div>
      <Card className="w-full max-w-2xl shadow-lg border">
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>
            This is your central hub for managing the Aura platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard" passHref>
                <Button variant="outline" className="w-full h-24 text-lg">
                    <School className="mr-2" /> View Schools
                </Button>
            </Link>
             <Button variant="outline" className="w-full h-24 text-lg" disabled>
                <Users className="mr-2" /> Manage Users (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
