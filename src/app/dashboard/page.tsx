"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, LogOut, Loader2, Wallet, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [authSchoolId, setAuthSchoolId] = useState<string | null>(null);

    useEffect(() => {
        const authData = localStorage.getItem('aura_auth');
        if (!authData) {
            router.replace('/');
            return;
        }
        setAuthSchoolId(JSON.parse(authData).schoolId);

        // Simulate fetching data
        setTimeout(() => {
            const storedSchools = JSON.parse(localStorage.getItem('aura_schools') || '[]');
            setSchools(storedSchools);
            setLoading(false);
        }, 1000);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('aura_auth');
        router.replace('/');
    };
    
    const loggedInSchool = useMemo(() => schools.find(s => s.id === authSchoolId), [schools, authSchoolId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    if (loading || !loggedInSchool) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Gem className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-headline tracking-tight">Aura Dashboard</h1>
                    </div>
                    <Button variant="ghost" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </header>
                
                <Card className="shadow-lg border">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl tracking-tight">{loggedInSchool.name}</CardTitle>
                        <CardDescription>
                           Manage your school's wallet and details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card className="bg-primary/5">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                                    <p className="text-3xl font-bold text-primary">{formatCurrency(loggedInSchool.walletBalance)}</p>
                                </div>
                                <Button size="lg">
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    Add Money
                                </Button>
                            </CardContent>
                        </Card>
                         <div className="text-sm text-muted-foreground">
                           <p>School ID: <span className="font-mono bg-muted px-2 py-1 rounded-md">{loggedInSchool.id}</span></p>
                           <p>Date Joined: {loggedInSchool.addedDate}</p>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </main>
    );
}
