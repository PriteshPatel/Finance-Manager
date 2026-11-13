import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import { API_BASE_URL } from '../../api-config';
import { FinancialDataTable, type FinancialDataColumn } from './financial-data-table';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  bankAccountId?: string;
  recurring?: boolean;
  tags?: string[];
}

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
}

interface ExpenseManagerProps {
  accessToken: string;
  expenses: Expense[];
  onRefresh: () => void;
}

const EXPENSE_CATEGORIES = [
  "Ashsih Traders",
  "Beauty & Personal Care",
  "Clothing & Apparel",
  "Education & School Supplies",
  "Electricity & Power",
  "EMI",
  "Entertainment & Leisure",
  "Food & Groceries",
  "Furniture & Decor",
  "Gas & Cooking Fuel",
  "Gifts & Donations",
  "Healthcare & Medical",
  "Home Maintenance & Repairs",
  "Insurance (Health, Home, Life)",
  "Internet & Cable",
  "J V",
  "Mukesh Bakery",
  "Personal",
  "Pets & Pet Care",
  "Rent or Mortgage",
  "Shreechand",
  "Streaming Services & Subscriptions",
  "Taxes & Government Fees",
  "Telephone & Mobile Bills",
  "Transportation & Fuel",
  "Water & Sewage",
  "Other"
];

export function ExpenseManager({ accessToken, expenses, onRefresh }: ExpenseManagerProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);
  const [bankAccountsError, setBankAccountsError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const t = useTranslation();
  const formatCurrency = useFormatCurrency();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    bankAccountId: '',
    recurring: false,
    tags: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [minimumAmount, setMinimumAmount] = useState('');
  const [maximumAmount, setMaximumAmount] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    if (!isDialogOpen) return;

    const fetchBankAccounts = async () => {
      setBankAccountsLoading(true);
      setBankAccountsError(false);
      try {
        const response = await fetch(`${API_BASE_URL}/bank-accounts`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch bank accounts');
        }
        const data = await response.json();
        setBankAccounts(data.bankAccounts || []);
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
        setBankAccountsError(true);
      } finally {
        setBankAccountsLoading(false);
      }
    };

    fetchBankAccounts();
  }, [accessToken, isDialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        bankAccountId: formData.bankAccountId || undefined,
        recurring: formData.recurring,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      };

      const url = editingExpense
        ? `${API_BASE_URL}/expenses/${editingExpense.id}`
        : `${API_BASE_URL}/expenses`;

      console.log('Saving expense to:', url);
      console.log('Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NO TOKEN');

      const response = await fetch(url, {
        method: editingExpense ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(expenseData),
      });

      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save expense');
      }

      onRefresh();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/expenses/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: expense.date,
      bankAccountId: expense.bankAccountId || '',
      recurring: expense.recurring || false,
      tags: expense.tags?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      bankAccountId: '',
      recurring: false,
      tags: '',
    });
    setEditingExpense(null);
  };

  const filteredExpenses = useMemo(() => {
    const query = deferredSearchTerm.trim().toLowerCase();
    const minAmount = minimumAmount === '' ? undefined : Number(minimumAmount);
    const maxAmount = maximumAmount === '' ? undefined : Number(maximumAmount);

    return expenses.filter((expense) => {
      const matchesSearch = !query ||
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.date.toLowerCase().includes(query) ||
        String(expense.amount).includes(query) ||
        expense.tags?.some((tag) => tag.toLowerCase().includes(query)) === true;
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      const matchesMinimum = minAmount === undefined || expense.amount >= minAmount;
      const matchesMaximum = maxAmount === undefined || expense.amount <= maxAmount;
      const expenseDate = expense.date.slice(0, 10);
      const matchesDateFrom = !dateFrom || expenseDate >= dateFrom;
      const matchesDateTo = !dateTo || expenseDate <= dateTo;

      return matchesSearch && matchesCategory && matchesMinimum && matchesMaximum &&
        matchesDateFrom && matchesDateTo;
    });
  }, [dateFrom, dateTo, deferredSearchTerm, expenses, filterCategory, maximumAmount, minimumAmount]);

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    [filteredExpenses],
  );
  const bankAccountNames = useMemo(
    () => new Map(bankAccounts.map((account) => [account.id, account.accountName])),
    [bankAccounts],
  );
  const expenseColumns = useMemo<FinancialDataColumn<Expense>[]>(() => [
    {
      id: 'date',
      header: 'Date',
      sortValue: (expense) => expense.date,
      cell: (expense) => new Date(expense.date).toLocaleDateString(),
    },
    {
      id: 'description',
      header: 'Description',
      sortValue: (expense) => expense.description,
      cell: (expense) => (
        <div className="app-min-w-40 app-max-w-80 text-wrap text-break">
          <div className="d-flex flex-wrap align-items-center gap-2 fw-medium">
            <span className="text-break">{expense.description}</span>
            {expense.recurring && (
              <span className="text-xs bg-muted-primary fg-primary px-2 py-1 rounded">Recurring</span>
            )}
          </div>
          {expense.tags && expense.tags.length > 0 && (
            <div className="mt-1 d-flex flex-wrap gap-1">
              {expense.tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="rounded bg-1 px-2 py-1 text-xs fg-2">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      sortValue: (expense) => expense.category,
      cell: (expense) => expense.category,
    },
    {
      id: 'bankAccount',
      header: 'Bank account',
      sortValue: (expense) => bankAccountNames.get(expense.bankAccountId || '') || '',
      cell: (expense) => expense.bankAccountId
        ? bankAccountNames.get(expense.bankAccountId) || 'Bank account'
        : '—',
    },
    {
      id: 'amount',
      header: 'Amount',
      sortValue: (expense) => expense.amount,
      cell: (expense) => <span className="fw-semibold">{formatCurrency(expense.amount)}</span>,
      className: 'text-end',
    },
  ], [bankAccountNames, formatCurrency]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <CardTitle>{t('expenses')}</CardTitle>
              <CardDescription>{t('manageYourFinances')}</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="me-2 app-h-4 app-w-4" />
                  {t('addNewExpense')}
                </Button>
              </DialogTrigger>
              <DialogContent className="app-max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingExpense ? t('edit') : t('addNewExpense')}</DialogTitle>
                  <DialogDescription>
                    {editingExpense ? t('edit') : t('addNewExpense')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  <div className="me-8 ms-8 mb-8">
                  <div className="d-flex flex-column gap-2">
                    <Label htmlFor="amount">{t('amount')}</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <Label htmlFor="category">{t('expenseCategory')}</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('expenseCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <Label htmlFor="bankAccountId">Bank Account (optional)</Label>
                    <Select
                      value={formData.bankAccountId || 'unassigned'}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        bankAccountId: value === 'unassigned' ? '' : value,
                      })}
                    >
                      <SelectTrigger id="bankAccountId">
                        <SelectValue placeholder="Select a bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">No bank account</SelectItem>
                        {bankAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountName} ({account.bankName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bankAccountsError && (
                      <p className="text-sm fg-danger">Bank accounts could not be loaded.</p>
                    )}
                    {bankAccountsLoading && (
                      <p className="text-sm fg-2">Loading bank accounts...</p>
                    )}
                    {!bankAccountsLoading && !bankAccountsError && bankAccounts.length === 0 && (
                      <p className="text-sm fg-2">No bank accounts available.</p>
                    )}
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <Label htmlFor="description">{t('description')}</Label>
                    <Input
                      id="description"
                      placeholder={t('description')}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., work, personal, urgent"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <input
                      id="recurring"
                      type="checkbox"
                      checked={formData.recurring}
                      onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="recurring" className="app-cursor-pointer">
                      Recurring expense
                    </Label>
                  </div>
 </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : editingExpense ? 'Update' : 'Add'}
                    </Button>
                  </DialogFooter>
                 
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="app-sm-span-2 app-lg-span-3">
              <div className="position-relative">
                <Search className="position-absolute app-start-3 top-50  translate-middle-y app-h-4 app-w-4 fg-3" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="app-ps-10"
                />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="income-source-filter">Source</Label>
                 <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-minimum">Minimum amount</Label>
              <Input
                id="expense-minimum"
                type="number"
                min="0"
                step="0.01"
                value={minimumAmount}
                onChange={(event) => setMinimumAmount(event.target.value)}
                placeholder="No minimum"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-maximum">Maximum amount</Label>
              <Input
                id="expense-maximum"
                type="number"
                min="0"
                step="0.01"
                value={maximumAmount}
                onChange={(event) => setMaximumAmount(event.target.value)}
                placeholder="No maximum"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-date-from">From date</Label>
              <Input
                id="expense-date-from"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-date-to">To date</Label>
              <Input
                id="expense-date-to"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mb-4 p-4 bg-muted-primary border border-subtle-primary rounded-4 shadow-xs">
            <p className="text-sm fg-2">Total Expenses</p>
            <p className="text-2xl fw-bold fg-primary">{formatCurrency(totalAmount)}</p>
            <p className="text-xs fg-2 mt-1">{filteredExpenses.length} transactions</p>
          </div>

          <FinancialDataTable
            rows={filteredExpenses}
            columns={expenseColumns}
            getRowId={(expense) => expense.id}
            emptyMessage="No expenses match these filters."
            renderActions={(expense) => (
              <>
                <Button size="icon" variant="ghost" aria-label="Edit expense" onClick={() => handleEdit(expense)}>
                  <Pencil className="app-h-4 app-w-4" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Delete expense" onClick={() => handleDelete(expense.id)}>
                  <Trash2 className="app-h-4 app-w-4 fg-danger" />
                </Button>
              </>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
