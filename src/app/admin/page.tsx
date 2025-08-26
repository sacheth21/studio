"use client";

import { useEffect, useState } from 'react';
import { School } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => {
            const storedSchools = JSON.parse(localStorage.getItem('aura_schools') || '[]');
            setSchools(storedSchools);
            setLoading(false);
        }, 1000);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('aura_auth');
        router.replace('/');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Gem className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-headline tracking-tight">Aura Booths</h1>
                    </div>
                     <Button variant="ghost" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Admin Logout
                    </Button>
                </header>

                <Card className="shadow-lg border">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Registered Schools</CardTitle>
                        <CardDescription>
                            A list of all registered schools in the system.
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
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : schools.length > 0 ? (
                                        schools.map((school) => (
                                            <TableRow key={school.id}>
                                                <TableCell className="font-mono">{school.id}</TableCell>
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
