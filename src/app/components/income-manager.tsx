import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Pencil, Trash2, TrendingUp, Wallet, Receipt } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { API_BASE_URL } from '../../api-config';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import { FinancialDataTable, type FinancialDataColumn } from './financial-data-table';

interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  bankAccountId?: string;
  category?: string;
  recurring?: boolean;
  description?: string;
}

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
}

interface IncomeManagerProps {
  accessToken: string;
  income: Income[];
  onRefresh: () => void;
}

const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Investment',
  'Rental Income',
  'Business',
  'Bonus',
  'Gift',
  'Refund',
  'Farming',
  'Other',
];

export function IncomeManager({ accessToken, income, onRefresh }: IncomeManagerProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);
  const [bankAccountsError, setBankAccountsError] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const t = useTranslation();
  const formatCurrency = useFormatCurrency();
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    bankAccountId: '',
    recurring: false,
  });
  const [filterSource, setFilterSource] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
      const incomeData = {
        amount: parseFloat(formData.amount),
        source: formData.source,
        date: formData.date,
        description: formData.description,
        bankAccountId: formData.bankAccountId || null,
        recurring: formData.recurring,
      };

      const url = editingIncome
        ? `${API_BASE_URL}/income/${editingIncome.id}`
        : `${API_BASE_URL}/income`;

      const response = await fetch(url, {
        method: editingIncome ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(incomeData),
      });

      if (!response.ok) {
        throw new Error('Failed to save income');
      }

      onRefresh();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/income/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete income');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Failed to delete income');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      amount: income.amount.toString(),
      source: income.source,
      date: income.date,
      description: income.description || '',
      bankAccountId: income.bankAccountId || '',
      recurring: income.recurring || false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      bankAccountId: '',
      recurring: false,
    });
    setEditingIncome(null);
  };

  const filteredIncome = useMemo(() => {
    const query = deferredSearchTerm.trim().toLowerCase();
    const minAmount = minimumAmount === '' ? undefined : Number(minimumAmount);
    const maxAmount = maximumAmount === '' ? undefined : Number(maximumAmount);

    return income.filter((item) => {
      const matchesSearch = !query ||
        item.source.toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query) ||
        item.date.toLowerCase().includes(query) ||
        String(item.amount).includes(query);
      const matchesSource = filterSource === 'all' || item.source === filterSource;
      const matchesMinimum = minAmount === undefined || item.amount >= minAmount;
      const matchesMaximum = maxAmount === undefined || item.amount <= maxAmount;
      const itemDate = item.date.slice(0, 10);
      const matchesDateFrom = !dateFrom || itemDate >= dateFrom;
      const matchesDateTo = !dateTo || itemDate <= dateTo;

      return matchesSearch && matchesSource && matchesMinimum && matchesMaximum &&
        matchesDateFrom && matchesDateTo;
    });
  }, [dateFrom, dateTo, deferredSearchTerm, filterSource, income, maximumAmount, minimumAmount]);

  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, item) => sum + item.amount, 0),
    [filteredIncome],
  );
  const currentMonthIncome = useMemo(() => {
    const now = new Date();
    return income.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }).reduce((sum, item) => sum + item.amount, 0);
  }, [income]);
  const bankAccountNames = useMemo(
    () => new Map(bankAccounts.map((account) => [account.id, account.accountName])),
    [bankAccounts],
  );
  const incomeColumns = useMemo<FinancialDataColumn<Income>[]>(() => [
    {
      id: 'date',
      header: 'Date',
      sortValue: (item) => item.date,
      cell: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      id: 'source',
      header: 'Source',
      sortValue: (item) => item.source,
      cell: (item) => (
        <div className="d-flex align-items-center gap-2 fw-medium">
          {item.source}
          {item.recurring && (
            <span className="px-2 py-1 text-xs bg-muted-success fg-success fg-success rounded">
              Recurring
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      sortValue: (item) => item.description || '',
      cell: (item) => (
        <div className="app-max-w-80 text-wrap text-break">
          {item.description || '—'}
        </div>
      ),
    },
    {
      id: 'bankAccount',
      header: 'Bank account',
      sortValue: (item) => bankAccountNames.get(item.bankAccountId || '') || '',
      cell: (item) => item.bankAccountId
        ? bankAccountNames.get(item.bankAccountId) || 'Bank account'
        : '—',
    },
    {
      id: 'amount',
      header: 'Amount',
      sortValue: (item) => item.amount,
      cell: (item) => <span className="fw-semibold fg-success fg-success">{formatCurrency(item.amount)}</span>,
      className: 'text-end',
    },
  ], [bankAccountNames, formatCurrency]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="d-flex flex-row align-items-center justify-content-between space-y-0 pb-2">
            <CardTitle className="text-sm fw-medium">{t('totalIncome')}</CardTitle>
            <div className="p-2 rounded-2 bg-muted-success fg-success">
              <TrendingUp className="app-h-4 app-w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl fw-bold fg-success">{formatCurrency(totalIncome)}</div>
            <p className="text-xs fg-2">{t('allTimeIncome')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="d-flex flex-row align-items-center justify-content-between space-y-0 pb-2">
            <CardTitle className="text-sm fw-medium">{t('thisMonth')}</CardTitle>
            <div className="p-2 rounded-2 bg-muted-success fg-success">
              <Wallet className="app-h-4 app-w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl fw-bold fg-success">{formatCurrency(currentMonthIncome)}</div>
            <p className="text-xs fg-2">{t('thisMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="d-flex flex-row align-items-center justify-content-between space-y-0 pb-2">
            <CardTitle className="text-sm fw-medium">{t('income')}</CardTitle>
            <div className="p-2 rounded-2 bg-1 fg-2">
              <Receipt className="app-h-4 app-w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl fw-bold">{filteredIncome.length}</div>
            <p className="text-xs fg-2 mt-1">Recorded transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Income List */}
      <Card>
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <CardTitle>{t('income')}</CardTitle>
              <CardDescription>{t('manageYourFinances')}</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="me-2 app-h-4 app-w-4" />
                  {t('addNewIncome')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingIncome ? t('edit') : t('addNewIncome')}</DialogTitle>
                  <DialogDescription>
                    {editingIncome ? t('edit') : t('addNewIncome')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-5">
                  <div className="me-8 ms-8 mb-8">
                  <div className="d-flex flex-column gap-3">
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
                      <Label htmlFor="source">{t('incomeSource')}</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) => setFormData({ ...formData, source: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('incomeSource')} />
                        </SelectTrigger>
                        <SelectContent>
                          {INCOME_SOURCES.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <Label htmlFor="incomeBankAccountId">Bank Account (optional)</Label>
                      <Select
                        value={formData.bankAccountId || 'unassigned'}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          bankAccountId: value === 'unassigned' ? '' : value,
                        })}
                      >
                        <SelectTrigger id="incomeBankAccountId">
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
                      <Label htmlFor="date">{t('date')}</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <Label htmlFor="description">{t('description')}</Label>
                      <Input
                        id="description"
                        placeholder={t('description')}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        id="recurring"
                        checked={formData.recurring}
                        onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                        className="rounded border-keyline"
                      />
                      <Label htmlFor="recurring" className="app-cursor-pointer">
                        Recurring income
                      </Label>
                    </div>
                  </div>
                   </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : editingIncome ? 'Update Income' : 'Add Income'}
                    </Button>
                  </DialogFooter>
                 
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-muted-success border border-subtle-success rounded-4 shadow-xs">
              <p className="text-sm fg-2">{t('totalIncome')}</p>
              <p className="text-2xl fw-bold fg-success fg-success">
                {formatCurrency(filteredIncome.reduce((sum, item) => sum + item.amount, 0))}
              </p>
              <p className="text-xs fg-2 mt-1">{filteredIncome.length} entries</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 app-sm-span-2 app-lg-span-3">
                <Label htmlFor="income-search">Search income</Label>
                <Input
                  id="income-search"
                  placeholder="Search source, description, date, or amount..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-source-filter">Source</Label>
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger id="income-source-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {INCOME_SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-minimum">Minimum amount</Label>
                <Input
                  id="income-minimum"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minimumAmount}
                  onChange={(event) => setMinimumAmount(event.target.value)}
                  placeholder="No minimum"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-maximum">Maximum amount</Label>
                <Input
                  id="income-maximum"
                  type="number"
                  min="0"
                  step="0.01"
                  value={maximumAmount}
                  onChange={(event) => setMaximumAmount(event.target.value)}
                  placeholder="No maximum"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-date-from">From date</Label>
                <Input
                  id="income-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-date-to">To date</Label>
                <Input
                  id="income-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </div>
            </div>

            <FinancialDataTable
              rows={filteredIncome}
              columns={incomeColumns}
              getRowId={(item) => item.id}
              emptyMessage="No income records match these filters."
              renderActions={(item) => (
                <>
                  <Button size="icon" variant="ghost" aria-label="Edit income" onClick={() => handleEdit(item)}>
                    <Pencil className="app-h-4 app-w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Delete income" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="app-h-4 app-w-4 fg-danger" />
                  </Button>
                </>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
