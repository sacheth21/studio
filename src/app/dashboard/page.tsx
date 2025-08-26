"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, LogOut, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

        setTimeout(() => {
            const storedSchools = JSON.parse(localStorage.getItem('aura_schools') || '[]');
            setSchools(storedSchools);
            setLoading(false);
        }, 1500); // Simulate network delay
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('aura_auth');
        router.replace('/');
    };
    
    const loggedInSchool = useMemo(() => schools.find(s => s.id === authSchoolId), [schools, authSchoolId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
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
                        <CardTitle className="font-headline text-2xl">School Data Overview</CardTitle>
                        <CardDescription>
                            {loggedInSchool ? `Welcome back, ${loggedInSchool.name}!` : "A list of all registered schools in the system."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>School ID</TableHead>
                                        <TableHead>School Name</TableHead>
                                        <TableHead>Added Date</TableHead>
                                        <TableHead className="text-right">Wallet Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : schools.length > 0 ? (
                                        schools.map((school) => (
                                            <TableRow key={school.id} className={school.id === authSchoolId ? 'bg-primary/10' : ''}>
                                                <TableCell className="font-mono">
                                                    {school.id}
                                                    {school.id === authSchoolId && <Badge variant="secondary" className="ml-2">You</Badge>}
                                                </TableCell>
                                                <TableCell className="font-medium">{school.name}</TableCell>
                                                <TableCell>{school.addedDate}</TableCell>
                                                <TableCell className="text-right font-medium text-primary">
                                                    {formatCurrency(school.walletBalance)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">
                                                No schools registered yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
