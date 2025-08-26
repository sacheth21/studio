"use client";

import { useEffect, useState } from 'react';
import { School, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Loader2, LogOut, PlusCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [schools, setSchools] = useState<School[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');

    useEffect(() => {
        setTimeout(() => {
            const storedSchools = JSON.parse(localStorage.getItem('aura_schools') || '[]');
            const storedTransactions = JSON.parse(localStorage.getItem('aura_transactions') || '[]');
            setSchools(storedSchools);
            setTransactions(storedTransactions.sort((a: Transaction, b: Transaction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setLoading(false);
        }, 1000);
    }, []);
    
    const handleLogout = () => {
        localStorage.removeItem('aura_auth');
        router.replace('/');
    };
    
    const handleSchoolClick = (schoolId: string) => {
        localStorage.setItem('aura_auth', JSON.stringify({ schoolId: schoolId }));
        router.push('/dashboard');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const openAddMoneyDialog = (school: School) => {
        setSelectedSchool(school);
        setIsAddMoneyOpen(true);
    };

    const handleAddMoney = () => {
        if (!selectedSchool) return;

        const amount = parseFloat(amountToAdd);
        if (isNaN(amount) || amount <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Please enter a valid positive number.',
            });
            return;
        }

        const updatedSchools = schools.map(school => {
            if (school.id === selectedSchool.id) {
                return { ...school, walletBalance: school.walletBalance + amount };
            }
            return school;
        });

        localStorage.setItem('aura_schools', JSON.stringify(updatedSchools));
        setSchools(updatedSchools);
        toast({
            title: 'Success!',
            description: `${formatCurrency(amount)} has been added to ${selectedSchool.name}'s wallet.`,
        });
        setIsAddMoneyOpen(false);
        setAmountToAdd('');
        setSelectedSchool(null);
    };
    
    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <>
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

                    <Tabs defaultValue="schools">
                        <TabsList className="mb-4">
                            <TabsTrigger value="schools">Schools</TabsTrigger>
                            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="schools">
                            <Card className="shadow-lg border">
                                <CardHeader>
                                    <CardTitle className="font-headline text-2xl">Registered Schools</CardTitle>
                                    <CardDescription>
                                        A list of all registered schools. Click a row to view their dashboard or add money to their wallet.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>School Name</TableHead>
                                                    <TableHead>Wallet Balance</TableHead>
                                                    <TableHead>Added Date</TableHead>
                                                    <TableHead>School ID</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    Array.from({ length: 3 }).map((_, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                            <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : schools.length > 0 ? (
                                                    schools.map((school) => (
                                                        <TableRow key={school.id} >
                                                            <TableCell onClick={() => handleSchoolClick(school.id)} className="font-medium cursor-pointer hover:underline">{school.name}</TableCell>
                                                            <TableCell onClick={() => handleSchoolClick(school.id)} className="font-medium text-primary cursor-pointer hover:underline">
                                                                {formatCurrency(school.walletBalance)}
                                                            </TableCell>
                                                             <TableCell onClick={() => handleSchoolClick(school.id)} className="cursor-pointer hover:underline">{school.addedDate}</TableCell>
                                                            <TableCell onClick={() => handleSchoolClick(school.id)} className="font-mono cursor-pointer hover:underline">{school.id}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button size="sm" onClick={() => openAddMoneyDialog(school)}>
                                                                    <PlusCircle className="mr-2 h-4 w-4"/>
                                                                    Add Money
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center h-24">
                                                            No schools registered yet.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="transactions">
                             <Card className="shadow-lg border">
                                <CardHeader>
                                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><History/> All Transactions</CardTitle>
                                    <CardDescription>
                                       A complete log of all funds added to student cards across all schools.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date & Time</TableHead>
                                                    <TableHead>School</TableHead>
                                                    <TableHead>Card ID</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                 {loading ? (
                                                    Array.from({ length: 5 }).map((_, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                                        </TableRow>
                                                    ))
                                                 ) : transactions.length > 0 ? (
                                                    transactions.map((tx) => (
                                                        <TableRow key={tx.id}>
                                                            <TableCell>{formatTimestamp(tx.timestamp)}</TableCell>
                                                            <TableCell className="font-medium">{tx.schoolName}</TableCell>
                                                            <TableCell className="font-mono">{tx.cardId}</TableCell>
                                                            <TableCell className="font-medium text-green-600">{formatCurrency(tx.amount)}</TableCell>
                                                        </TableRow>
                                                    ))
                                                 ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center h-24">
                                                            No transactions have been recorded yet.
                                                        </TableCell>
                                                    </TableRow>
                                                 )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Money to Wallet</DialogTitle>
                        <DialogDescription>
                            Enter the amount you want to add to {selectedSchool?.name}'s wallet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount (INR)
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amountToAdd}
                                onChange={(e) => setAmountToAdd(e.target.value)}
                                placeholder="e.g., 5000"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddMoney}>Confirm & Add</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
