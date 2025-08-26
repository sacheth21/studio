"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { School, Card, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gem, LogOut, Loader2, Wallet, User, Pencil, PlusCircle, History, Trash2, Phone, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const generateInitialCards = (schoolId: string) => {
    return Array.from({ length: 20 }, (_, i) => {
        const cardId = (1001 + i).toString();
        return {
            id: cardId,
            schoolId: schoolId,
            name: `Student ${cardId}`,
            phoneNumbers: [],
            balance: 0,
        };
    });
};

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [schools, setSchools] = useState<School[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [authSchoolId, setAuthSchoolId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const [cardIdInput, setCardIdInput] = useState('');
    const [searchedCard, setSearchedCard] = useState<Card | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');
    
    const [isUpdateNameOpen, setIsUpdateNameOpen] = useState(false);
    const [newName, setNewName] = useState('');

    const [isUpdateNumbersOpen, setIsUpdateNumbersOpen] = useState(false);
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);


    useEffect(() => {
        const authData = localStorage.getItem('aura_auth');
        if (!authData) {
            router.replace('/');
            return;
        }
        const parsedAuth = JSON.parse(authData);
        let currentSchoolId: string | null = null;

        if (parsedAuth.schoolId === 'admin') {
            setIsAdmin(true);
            const adminSelectedSchoolId = localStorage.getItem('aura_admin_view');
             if (adminSelectedSchoolId) {
                currentSchoolId = JSON.parse(adminSelectedSchoolId);
             } else {
                 router.replace('/admin');
                 return;
             }
        } else {
             currentSchoolId = parsedAuth.schoolId;
        }
        
        setAuthSchoolId(currentSchoolId);

        setTimeout(() => {
            const storedSchools = JSON.parse(localStorage.getItem('aura_schools') || '[]');
            let allCards = JSON.parse(localStorage.getItem('aura_cards') || '[]');
            const storedTransactions = JSON.parse(localStorage.getItem('aura_transactions') || '[]');
            
            if (currentSchoolId) {
                const schoolCardsExist = allCards.some((card: Card) => card.schoolId === currentSchoolId);
                if (!schoolCardsExist) {
                    const newSchoolCards = generateInitialCards(currentSchoolId);
                    allCards = [...allCards, ...newSchoolCards];
                    localStorage.setItem('aura_cards', JSON.stringify(allCards));
                }
            }
            
            setSchools(storedSchools);
            setCards(allCards);
            setTransactions(storedTransactions);
            setLoading(false);
        }, 1000);
    }, [router]);

    const loggedInSchool = useMemo(() => schools.find(s => s.id === authSchoolId), [schools, authSchoolId]);
    
    const schoolTransactions = useMemo(() => {
        if (!loggedInSchool) return [];
        return transactions
            .filter(tx => tx.schoolId === loggedInSchool.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [transactions, loggedInSchool]);

    const handleLogout = () => {
        localStorage.removeItem('aura_auth');
        router.replace('/');
    };
    
    const handleAdminBack = () => {
        router.replace('/admin');
    }

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

    const handleCardSearch = () => {
        if (!cardIdInput) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a Card ID.' });
            return;
        }

        const foundCard = cards.find(c => c.id === cardIdInput && c.schoolId === authSchoolId);

        if (foundCard) {
            setSearchedCard(foundCard);
        } else {
            setSearchedCard(null);
            toast({ 
                variant: 'destructive', 
                title: 'Card Not Found', 
                description: `Card ID ${cardIdInput} is not registered for this school.` 
            });
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

        const balanceBefore = searchedCard.balance;
        const balanceAfter = balanceBefore + amount;

        const updatedSchools = schools.map(s => 
            s.id === loggedInSchool.id ? { ...s, walletBalance: s.walletBalance - amount } : s
        );

        const updatedCards = cards.map(c =>
            c.id === searchedCard.id ? { ...c, balance: balanceAfter } : c
        );
        
        const newTransaction: Transaction = {
            id: `txn_${Date.now()}`,
            schoolId: loggedInSchool.id,
            cardId: searchedCard.id,
            amount: amount,
            type: 'add_money_to_card',
            timestamp: new Date().toISOString(),
            schoolName: loggedInSchool.name,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter
        };
        const updatedTransactions = [...transactions, newTransaction];

        setSchools(updatedSchools);
        setCards(updatedCards);
        setTransactions(updatedTransactions);
        setSearchedCard(prev => prev ? { ...prev, balance: balanceAfter } : null);

        localStorage.setItem('aura_schools', JSON.stringify(updatedSchools));
        localStorage.setItem('aura_cards', JSON.stringify(updatedCards));
        localStorage.setItem('aura_transactions', JSON.stringify(updatedTransactions));

        toast({ title: 'Success', description: `${formatCurrency(amount)} added to ${searchedCard.name}'s card.` });
        setIsAddMoneyOpen(false);
        setAmountToAdd('');
        setIsSubmitting(false);
    };
    
    const handlePhoneNumberChange = (index: number, value: string) => {
        const newPhoneNumbers = [...phoneNumbers];
        if (value.match(/^[0-9]{0,10}$/)) {
            newPhoneNumbers[index] = value;
            setPhoneNumbers(newPhoneNumbers);
        }
    };
    
    const handleAddPhoneNumber = () => {
        if (phoneNumbers.length < 5) {
            setPhoneNumbers([...phoneNumbers, '']);
        }
    };

    const handleRemovePhoneNumber = (index: number) => {
        const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
        setPhoneNumbers(newPhoneNumbers);
    };
    
    const openUpdateNumbersDialog = () => {
        if (!searchedCard) return;
        setPhoneNumbers([...searchedCard.phoneNumbers]);
        setIsUpdateNumbersOpen(true);
    };

    const handleUpdateNumbers = () => {
        if (!searchedCard) return;

        const validNumbers = phoneNumbers.filter(num => num && num.length === 10);
        if (validNumbers.length !== phoneNumbers.length) {
            toast({ variant: 'destructive', title: 'Invalid Phone Numbers', description: 'All phone numbers must be exactly 10 digits.' });
            return;
        }

        setIsSubmitting(true);

        const updatedCards = cards.map(c => 
            c.id === searchedCard.id ? { ...c, phoneNumbers: validNumbers } : c
        );
        setCards(updatedCards);
        localStorage.setItem('aura_cards', JSON.stringify(updatedCards));
        setSearchedCard(prev => prev ? { ...prev, phoneNumbers: validNumbers } : null);

        toast({ title: 'Success', description: 'Phone numbers updated.' });
        setIsUpdateNumbersOpen(false);
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
                     {isAdmin ? (
                        <Button variant="outline" onClick={handleAdminBack}>
                           Back to Admin
                        </Button>
                    ) : (
                         <Button variant="ghost" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    )}
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
                
                <UICard className="shadow-lg border mb-8">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Card Management</CardTitle>
                        <CardDescription>Enter a registered student card ID to view details or add funds.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-6">
                            <Input 
                                placeholder="Enter Card ID" 
                                value={cardIdInput}
                                onChange={(e) => setCardIdInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCardSearch()}
                            />
                            <Button onClick={handleCardSearch}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Search />}
                                <span className="sr-only sm:not-sr-only sm:ml-2">Search</span>
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
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">Registered Phone Numbers ({searchedCard.phoneNumbers.length}/5)</h4>
                                            <Button variant="outline" size="sm" onClick={openUpdateNumbersDialog}>
                                                <Pencil className="mr-2 h-3 w-3" />
                                                Update Numbers
                                            </Button>
                                        </div>
                                        {searchedCard.phoneNumbers.length > 0 ? (
                                        <div className="space-y-2 text-sm">
                                            {searchedCard.phoneNumbers.map((num, i) => (
                                                <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                    <Phone className="h-4 w-4 text-muted-foreground"/>
                                                    <span className="font-mono">{num}</span>
                                                </div>
                                            ))}
                                        </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4">No phone numbers added yet.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </UICard>
                        )}
                    </CardContent>
                </UICard>

                <UICard className="shadow-lg border">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><History/> Transaction History</CardTitle>
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
                                     {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                            </TableRow>
                                        ))
                                     ) : schoolTransactions.length > 0 ? (
                                        schoolTransactions.map((tx) => (
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
                                                No transactions have been recorded for this school yet.
                                            </TableCell>
                                        </TableRow>
                                     )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </UICard>

            </div>
        </main>
        
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

        <Dialog open={isUpdateNumbersOpen} onOpenChange={setIsUpdateNumbersOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Phone Numbers</DialogTitle>
                    <DialogDescription>
                        Manage the phone numbers for {searchedCard?.name}. Each number must be 10 digits.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[300px] overflow-y-auto pr-2">
                    {phoneNumbers.map((number, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Label htmlFor={`phone-${index}`} className="sr-only">Phone Number {index + 1}</Label>
                            <Input
                                id={`phone-${index}`}
                                type="tel"
                                value={number}
                                onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                                placeholder="10-digit number"
                                className="flex-grow"
                                maxLength={10}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemovePhoneNumber(index)} disabled={isSubmitting}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    {phoneNumbers.length < 5 && (
                         <Button variant="outline" onClick={handleAddPhoneNumber} disabled={isSubmitting}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Number
                        </Button>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
                    <Button onClick={handleUpdateNumbers} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Numbers
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
