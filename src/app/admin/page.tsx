"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { School, AdminTransaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Loader2, LogOut, PlusCircle, Wallet, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [schools, setSchools] = useState<School[]>([]);
    const [adminTransactions, setAdminTransactions] = useState<AdminTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        setTimeout(() => {
            const storedSchools = JSON.parse(localStorage.getItem('aura_schools') || '[]');
            const storedAdminTransactions = JSON.parse(localStorage.getItem('aura_admin_transactions') || '[]');
            setSchools(storedSchools);
            setAdminTransactions(storedAdminTransactions.sort((a: AdminTransaction, b: AdminTransaction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setLoading(false);
        }, 1000);
    }, []);
    
    const handleLogout = () => {
        localStorage.removeItem('aura_auth');
        router.replace('/');
    };
    
    const handleSchoolClick = (schoolId: string) => {
        router.push(`/admin/school/${schoolId}`);
    };

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

    const openAddMoneyDialog = (school: School) => {
        setSelectedSchool(school);
        setAmountToAdd('');
        setPassword('');
        setIsAddMoneyOpen(true);
    };

    const handleAddMoney = () => {
        if (!selectedSchool) return;
        setIsSubmitting(true);

        if (password !== '11aug2008') {
            toast({
                variant: 'destructive',
                title: 'Incorrect Password',
                description: 'The admin password you entered is incorrect.',
            });
            setIsSubmitting(false);
            return;
        }

        const amount = parseFloat(amountToAdd);
        if (isNaN(amount) || amount <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Please enter a valid positive number.',
            });
            setIsSubmitting(false);
            return;
        }

        const newAdminTransaction: AdminTransaction = {
            id: `admintxn_${Date.now()}`,
            schoolId: selectedSchool.id,
            schoolName: selectedSchool.name,
            amount: amount,
            type: 'admin_top_up',
            timestamp: new Date().toISOString(),
        };

        const updatedAdminTransactions = [newAdminTransaction, ...adminTransactions];
        
        const updatedSchools = schools.map(school => {
            if (school.id === selectedSchool.id) {
                return { ...school, walletBalance: school.walletBalance + amount };
            }
            return school;
        });

        localStorage.setItem('aura_schools', JSON.stringify(updatedSchools));
        localStorage.setItem('aura_admin_transactions', JSON.stringify(updatedAdminTransactions));
        
        setSchools(updatedSchools);
        setAdminTransactions(updatedAdminTransactions);

        toast({
            title: 'Success!',
            description: `${formatCurrency(amount)} has been added to ${selectedSchool.name}'s wallet.`,
        });
        setIsAddMoneyOpen(false);
        setAmountToAdd('');
        setSelectedSchool(null);
        setPassword('');
        setIsSubmitting(false);
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
                            <TabsTrigger value="schools">Registered Schools</TabsTrigger>
                            <TabsTrigger value="history">Wallet Top-up History</TabsTrigger>
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
                                                        <TableRow key={school.id} onClick={() => handleSchoolClick(school.id)} className="cursor-pointer">
                                                            <TableCell className="font-medium">{school.name}</TableCell>
                                                            <TableCell className="font-medium text-primary">
                                                                {formatCurrency(school.walletBalance)}
                                                            </TableCell>
                                                             <TableCell>{school.addedDate}</TableCell>
                                                            <TableCell className="font-mono">{school.id}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button size="sm" onClick={(e) => { e.stopPropagation(); openAddMoneyDialog(school); }}>
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
                        <TabsContent value="history">
                            <Card className="shadow-lg border">
                                <CardHeader>
                                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wallet /> All Wallet Top-ups</CardTitle>
                                    <CardDescription>A log of all funds added to school wallets by the admin.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>School Name</TableHead>
                                                <TableHead>School ID</TableHead>
                                                <TableHead className="text-right">Amount Added</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                 Array.from({ length: 5 }).map((_, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                        <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                                                    </TableRow>
                                                ))
                                            ) : adminTransactions.length > 0 ? (
                                                adminTransactions.map((tx) => (
                                                    <TableRow key={tx.id}>
                                                        <TableCell>{formatTimestamp(tx.timestamp)}</TableCell>
                                                        <TableCell>{tx.schoolName}</TableCell>
                                                        <TableCell className="font-mono">{tx.schoolId}</TableCell>
                                                        <TableCell className="text-right font-medium text-green-600">+{formatCurrency(tx.amount)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center h-24">
                                                        No wallet top-ups have been recorded yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
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
                            Enter the amount to add to {selectedSchool?.name}'s wallet. Confirm with your admin password.
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
                                disabled={isSubmitting}
                            />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                <KeyRound className="h-4 w-4 inline-block mr-1" />
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Admin password"
                                className="col-span-3"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddMoney} disabled={isSubmitting}>
                           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           Confirm & Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
