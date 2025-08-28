"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { School, Card, CardTransaction, AdminTransaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gem, Loader2, Wallet, Users, History, ArrowLeft, Phone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SchoolDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.schoolId as string;

    const [school, setSchool] = useState<School | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [cardTransactions, setCardTransactions] = useState<CardTransaction[]>([]);
    const [adminTransactions, setAdminTransactions] = useState<AdminTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!schoolId) return;

        const authData = localStorage.getItem('aura_auth');
        if (!authData || JSON.parse(authData).schoolId !== 'admin') {
            router.replace('/');
            return;
        }

        setTimeout(() => {
            const allSchools = JSON.parse(localStorage.getItem('aura_schools') || '[]');
            const allCards = JSON.parse(localStorage.getItem('aura_cards') || '[]');
            const allCardTransactions = JSON.parse(localStorage.getItem('aura_card_transactions') || '[]');
            const allAdminTransactions = JSON.parse(localStorage.getItem('aura_admin_transactions') || '[]');

            const currentSchool = allSchools.find((s: School) => s.id === schoolId);
            
            if (currentSchool) {
                setSchool(currentSchool);
                setCards(allCards.filter((c: Card) => c.schoolId === schoolId));
                setCardTransactions(allCardTransactions);
                setAdminTransactions(allAdminTransactions);
            } else {
                 router.replace('/admin'); // School not found, redirect to admin home
            }
            
            setLoading(false);
        }, 1000);
    }, [schoolId, router]);

    const schoolCardTransactions = useMemo(() => {
        return cardTransactions
            .filter(tx => tx.schoolId === schoolId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [cardTransactions, schoolId]);

    const schoolAdminTransactions = useMemo(() => {
        return adminTransactions
            .filter(tx => tx.schoolId === schoolId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [adminTransactions, schoolId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    if (loading || !school) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Admin</span>
                    </Button>
                    <div className="flex items-center gap-3">
                        <Gem className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-headline tracking-tight">{school.name}</h1>
                    </div>
                </header>

                <UICard className="shadow-lg border mb-8 bg-primary/5">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <Wallet className="h-8 w-8 text-primary" />
                             <div>
                                <p className="text-sm font-medium text-muted-foreground">Main Wallet Balance</p>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(school.walletBalance)}</p>
                            </div>
                        </div>
                    </CardContent>
                </UICard>

                <Tabs defaultValue="students">
                    <TabsList className="mb-4">
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="card_transactions">Card Transactions</TabsTrigger>
                        <TabsTrigger value="admin_topups">Admin Top-ups</TabsTrigger>
                    </TabsList>
                    <TabsContent value="students">
                        <UICard className="shadow-lg border">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Users/> Registered Students</CardTitle>
                                <CardDescription>
                                    A list of all students and their card details for {school.name}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Card ID</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Card Balance</TableHead>
                                            <TableHead>Registered Phone Numbers</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cards.length > 0 ? (
                                            cards.map((card) => (
                                                <TableRow key={card.id}>
                                                    <TableCell className="font-mono">{card.id}</TableCell>
                                                    <TableCell>{card.name}</TableCell>
                                                    <TableCell className="font-medium">{formatCurrency(card.balance)}</TableCell>
                                                    <TableCell>
                                                    {card.phoneNumbers.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            {card.phoneNumbers.map((num, i) => (
                                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                                     <Phone className="h-3 w-3 text-muted-foreground"/>
                                                                     <span className="font-mono">{num}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">None</span>
                                                    )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">
                                                   No student cards have been set up for this school yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </UICard>
                    </TabsContent>
                    <TabsContent value="card_transactions">
                         <UICard className="shadow-lg border">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2"><History/> Card Transaction History</CardTitle>
                                <CardDescription>
                                    A log of all funds added to student cards at this school.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>Card ID</TableHead>
                                                <TableHead>Balance Before</TableHead>
                                                <TableHead>Amount Added</TableHead>
                                                <TableHead>Balance After</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {schoolCardTransactions.length > 0 ? (
                                                schoolCardTransactions.map((tx) => (
                                                    <TableRow key={tx.id}>
                                                        <TableCell>{formatTimestamp(tx.timestamp)}</TableCell>
                                                        <TableCell className="font-mono">{tx.cardId}</TableCell>
                                                        <TableCell>{formatCurrency(tx.balanceBefore)}</TableCell>
                                                        <TableCell className="font-medium text-green-600">
                                                        +{formatCurrency(tx.amount)}
                                                        </TableCell>
                                                        <TableCell className="font-bold">
                                                            {formatCurrency(tx.balanceAfter)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center h-24">
                                                        No card transactions have been recorded for this school yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </UICard>
                    </TabsContent>
                    <TabsContent value="admin_topups">
                         <UICard className="shadow-lg border">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wallet/> Admin Top-up History</CardTitle>
                                <CardDescription>A log of all funds added to this school's wallet by the admin.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead className="text-right">Amount Received</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {schoolAdminTransactions.length > 0 ? (
                                            schoolAdminTransactions.map((tx) => (
                                                <TableRow key={tx.id}>
                                                    <TableCell>{formatTimestamp(tx.timestamp)}</TableCell>
                                                    <TableCell className="text-right font-medium text-green-600">+{formatCurrency(tx.amount)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center h-24">
                                                    No top-ups from admin have been recorded for this school yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </UICard>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
