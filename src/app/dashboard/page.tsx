"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { School, Card, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gem, LogOut, Loader2, Wallet, User, Pencil, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [schools, setSchools] = useState<School[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [authSchoolId, setAuthSchoolId] = useState<string | null>(null);
    
    const [cardIdInput, setCardIdInput] = useState('');
    const [searchedCard, setSearchedCard] = useState<Card | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');
    
    const [isUpdateNameOpen, setIsUpdateNameOpen] = useState(false);
    const [newName, setNewName] = useState('');


    useEffect(() => {
        const authData = localStorage.getItem('aura_auth');
        if (!authData) {
            router.replace('/');
            return;
        }
        const parsedAuth = JSON.parse(authData);
        if (parsedAuth.schoolId === 'admin') {
            router.replace('/admin');
            return;
        }
        setAuthSchoolId(parsedAuth.schoolId);

        setTimeout(() => {
            const storedSchools = JSON.parse(localStorage.getItem('aura_schools') || '[]');
            const storedCards = JSON.parse(localStorage.getItem('aura_cards') || '[]');
            const storedTransactions = JSON.parse(localStorage.getItem('aura_transactions') || '[]');
            setSchools(storedSchools);
            setCards(storedCards);
            setTransactions(storedTransactions);
            setLoading(false);
        }, 1000);
    }, [router]);

    const loggedInSchool = useMemo(() => schools.find(s => s.id === authSchoolId), [schools, authSchoolId]);

    const handleLogout = () => {
        localStorage.removeItem('aura_auth');
        router.replace('/');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handleCardSearch = () => {
        if (!cardIdInput) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a Card ID.' });
            return;
        }

        const foundCard = cards.find(c => c.id === cardIdInput && c.schoolId === authSchoolId);

        if (foundCard) {
            setSearchedCard(foundCard);
        } else {
            // If card not found, create a new one for this school
            const newCard: Card = {
                id: cardIdInput,
                schoolId: authSchoolId!,
                name: "New Student",
                phoneNumbers: [],
                balance: 0,
            };
            const updatedCards = [...cards, newCard];
            setCards(updatedCards);
            localStorage.setItem('aura_cards', JSON.stringify(updatedCards));
            setSearchedCard(newCard);
            toast({ title: 'New Card Created', description: `Card ID ${cardIdInput} has been registered.` });
        }
    };
    
    const handleUpdateName = () => {
        if (!searchedCard || !newName) return;
        setIsSubmitting(true);

        const updatedCards = cards.map(c => 
            c.id === searchedCard.id ? { ...c, name: newName } : c
        );
        setCards(updatedCards);
        localStorage.setItem('aura_cards', JSON.stringify(updatedCards));
        setSearchedCard(prev => prev ? { ...prev, name: newName } : null);
        
        toast({ title: 'Success', description: 'Student name updated.' });
        setIsUpdateNameOpen(false);
        setNewName('');
        setIsSubmitting(false);
    };

    const handleAddMoneyToCard = () => {
        if (!searchedCard || !loggedInSchool) return;
        
        const amount = parseFloat(amountToAdd);
        if (isNaN(amount) || amount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount' });
            return;
        }

        if (loggedInSchool.walletBalance < amount) {
            toast({ variant: 'destructive', title: 'Insufficient Funds', description: "The school's wallet does not have enough balance." });
            return;
        }
        
        setIsSubmitting(true);

        // 1. Deduct from school wallet
        const updatedSchools = schools.map(s => 
            s.id === loggedInSchool.id ? { ...s, walletBalance: s.walletBalance - amount } : s
        );

        // 2. Add to card balance
        const updatedCards = cards.map(c =>
            c.id === searchedCard.id ? { ...c, balance: c.balance + amount } : c
        );
        
        // 3. Create transaction record
        const newTransaction: Transaction = {
            id: `txn_${Date.now()}`,
            schoolId: loggedInSchool.id,
            cardId: searchedCard.id,
            amount: amount,
            type: 'add_money_to_card',
            timestamp: new Date().toISOString(),
            schoolName: loggedInSchool.name
        };
        const updatedTransactions = [...transactions, newTransaction];

        // 4. Update state and localStorage
        setSchools(updatedSchools);
        setCards(updatedCards);
        setTransactions(updatedTransactions);
        setSearchedCard(prev => prev ? { ...prev, balance: prev.balance + amount } : null);

        localStorage.setItem('aura_schools', JSON.stringify(updatedSchools));
        localStorage.setItem('aura_cards', JSON.stringify(updatedCards));
        localStorage.setItem('aura_transactions', JSON.stringify(updatedTransactions));

        toast({ title: 'Success', description: `${formatCurrency(amount)} added to ${searchedCard.name}'s card.` });
        setIsAddMoneyOpen(false);
        setAmountToAdd('');
        setIsSubmitting(false);
    };


    if (loading || !loggedInSchool) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
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
                
                <UICard className="shadow-lg border mb-8">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl tracking-tight">{loggedInSchool.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UICard className="bg-primary/5">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <Wallet className="h-8 w-8 text-primary" />
                                     <div>
                                        <p className="text-sm font-medium text-muted-foreground">Main Wallet Balance</p>
                                        <p className="text-3xl font-bold text-primary">{formatCurrency(loggedInSchool.walletBalance)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </UICard>
                    </CardContent>
                </UICard>
                
                <UICard className="shadow-lg border">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Card Management</CardTitle>
                        <CardDescription>Enter a student card ID to view details or add funds.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-6">
                            <Input 
                                placeholder="Enter Card ID" 
                                value={cardIdInput}
                                onChange={(e) => setCardIdInput(e.target.value)}
                            />
                            <Button onClick={handleCardSearch}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Search"}
                            </Button>
                        </div>

                        {searchedCard && (
                            <UICard className="bg-secondary/40">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <User /> {searchedCard.name}
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setNewName(searchedCard.name); setIsUpdateNameOpen(true); }}>
                                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </CardTitle>
                                            <CardDescription>Card ID: <span className="font-mono bg-muted px-2 py-1 rounded-md">{searchedCard.id}</span></CardDescription>
                                        </div>
                                        <Button size="sm" onClick={() => setIsAddMoneyOpen(true)}>
                                            <PlusCircle className="mr-2 h-4 w-4"/> Add Money
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <UICard>
                                        <CardContent className="p-4">
                                            <p className="text-sm font-medium text-muted-foreground">Card Balance</p>
                                            <p className="text-2xl font-bold">{formatCurrency(searchedCard.balance)}</p>
                                        </CardContent>
                                    </UICard>
                                     <div>
                                        <h4 className="font-medium mb-2">Registered Phone Numbers ({searchedCard.phoneNumbers.length}/5)</h4>
                                        {searchedCard.phoneNumbers.length > 0 ? (
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            {searchedCard.phoneNumbers.map((num, i) => <p key={i}>{num}</p>)}
                                        </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No phone numbers added yet.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </UICard>
                        )}
                    </CardContent>
                </UICard>

            </div>
        </main>
        
        {/* Add Money Dialog */}
        <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Money to Card</DialogTitle>
                    <DialogDescription>
                        Add funds to {searchedCard?.name}'s card. This will be deducted from your school's main wallet.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="amount-card">Amount (INR)</Label>
                    <Input
                        id="amount-card"
                        type="number"
                        value={amountToAdd}
                        onChange={(e) => setAmountToAdd(e.target.value)}
                        placeholder="e.g., 500"
                        disabled={isSubmitting}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
                    <Button onClick={handleAddMoneyToCard} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Update Name Dialog */}
        <Dialog open={isUpdateNameOpen} onOpenChange={setIsUpdateNameOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Student Name</DialogTitle>
                    <DialogDescription>
                        Change the name associated with card ID {searchedCard?.id}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="student-name">Student Name</Label>
                    <Input
                        id="student-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name"
                        disabled={isSubmitting}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
                    <Button onClick={handleUpdateName} disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
