import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { API_BASE_URL } from '../../api-config';
import { formatCurrency } from '../../lib/currency-config';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  recurring?: boolean;
  tags?: string[];
}

interface ExpenseManagerProps {
  accessToken: string;
  expenses: Expense[];
  onRefresh: () => void;
}

const EXPENSE_CATEGORIES = [
  'Groceries',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Dining',
  'Education',
  'Insurance',
  'Other',
];

export function ExpenseManager({ accessToken, expenses, onRefresh }: ExpenseManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false,
    tags: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
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
      recurring: false,
      tags: '',
    });
    setEditingExpense(null);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Expense Management</CardTitle>
              <CardDescription>Track and manage your expenses</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                  <DialogDescription>
                    {editingExpense ? 'Update expense details' : 'Enter the details of your expense'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="What was this expense for?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
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
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., work, personal, urgent"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="recurring"
                      type="checkbox"
                      checked={formData.recurring}
                      onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="recurring" className="cursor-pointer">
                      Recurring expense
                    </Label>
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
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
          </div>

          {/* Summary */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
            <p className="text-xs text-gray-500">{filteredExpenses.length} transactions</p>
          </div>

          {/* Expense List */}
          <div className="space-y-4">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No expenses found</p>
                <p className="text-sm">Add your first expense to get started</p>
              </div>
            ) : (
              filteredExpenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{expense.description}</h4>
                        {expense.recurring && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Recurring
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.tags && expense.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {expense.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(expense.amount)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(expense)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
