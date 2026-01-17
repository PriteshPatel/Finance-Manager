import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Pencil, Trash2, TrendingUp, IndianRupee  } from 'lucide-react';
import { API_BASE_URL } from '../../api-config';
import { formatCurrency } from '../../lib/currency-config';

interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  category?: string;
  recurring?: boolean;
  description?: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    recurring: false,
  });
  const [filterSource, setFilterSource] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const incomeData = {
        amount: parseFloat(formData.amount),
        source: formData.source,
        date: formData.date,
        description: formData.description,
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
      recurring: false,
    });
    setEditingIncome(null);
  };

  const filteredIncome = income.filter(item => {
    if (filterSource === 'all') return true;
    return item.source === filterSource;
  });

  const totalIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
  const currentMonthIncome = income.filter(item => {
    const itemDate = new Date(item.date);
    const now = new Date();
    return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
  }).reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">All-time total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(currentMonthIncome)}</div>
            <p className="text-xs text-muted-foreground">Current month income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Records</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredIncome.length}</div>
            <p className="text-xs text-muted-foreground">Total entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Income List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Income Records</CardTitle>
              <CardDescription>Track all your income sources</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Income
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingIncome ? 'Edit Income' : 'Add New Income'}</DialogTitle>
                  <DialogDescription>
                    {editingIncome ? 'Update the income record' : 'Enter details of your new income'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="source">Source</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(value) => setFormData({ ...formData, source: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
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
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Add notes..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="recurring"
                        checked={formData.recurring}
                        onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="recurring" className="cursor-pointer">
                        Recurring income
                      </Label>
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
            {/* Filter */}
            <div className="flex items-center gap-4">
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {INCOME_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Income Items */}
            {filteredIncome.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No income records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first income entry.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIncome
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.source}</h4>
                          {item.recurring && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Recurring
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
