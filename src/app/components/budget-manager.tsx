import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { useTranslation } from '../hooks/useTranslation';
import { Plus, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../api-config';
import { useFormatCurrency } from '../hooks/useFormatCurrency';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
}

interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
}

interface BudgetManagerProps {
  accessToken: string;
  expenses: Expense[];
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

export function BudgetManager({ accessToken, expenses }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const t = useTranslation();
  const formatCurrency = useFormatCurrency();
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/budgets`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setBudgets(data.budgets || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: selectedMonth,
      };

      const response = await fetch(
        `${API_BASE_URL}/budgets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(budgetData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save budget');
      }

      fetchBudgets();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
    });
  };

  // Calculate spending for current month
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.toISOString().slice(0, 7);
    return expenseMonth === selectedMonth;
  });

  // Group expenses by category
  const expensesByCategory = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get budgets for selected month
  const monthBudgets = budgets.filter(b => b.month === selectedMonth);

  // Calculate budget status for each category
  const budgetStatus = EXPENSE_CATEGORIES.map(category => {
    const budget = monthBudgets.find(b => b.category === category);
    const spent = expensesByCategory[category] || 0;
    const budgetAmount = budget?.amount || 0;
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    let status: 'safe' | 'warning' | 'danger' | 'none' = 'none';
    if (budgetAmount > 0) {
      if (percentage >= 100) status = 'danger';
      else if (percentage >= 80) status = 'warning';
      else status = 'safe';
    }

    return {
      category,
      budget: budgetAmount,
      spent,
      remaining: Math.max(0, budgetAmount - spent),
      percentage: Math.min(100, percentage),
      status,
    };
  }).filter(item => item.budget > 0); // Only show categories with budgets

  const totalBudget = budgetStatus.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = budgetStatus.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = Math.max(0, totalBudget - totalSpent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <CardTitle>{t('budget')}</CardTitle>
              <CardDescription>{t('manageYourFinances')}</CardDescription>
            </div>
            <div className="d-flex gap-4 align-items-center">
              <div className="app-w-48">
                <Label htmlFor="month-select" className="text-sm mb-2 d-block">{t('selectMonth')}</Label>
                <Input
                  id="month-select"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="mt-6">
                    <Plus className="me-2 app-h-4 app-w-4" />
                    Set Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className="app-max-w-md">
                  <DialogHeader>
                    <DialogTitle>Set Budget</DialogTitle>
                    <DialogDescription>
                      Set a budget limit for a specific category
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="me-8 ms-8 mb-8">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
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
                    

                    <div className="space-y-2">
                      <Label htmlFor="amount">Budget Amount</Label>
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

                    <div className="p-3 app-bg-muted-50 border border-keyline rounded-3">
                      <p className="text-sm fg-2">
                        This budget will be set for: <strong>{new Date(selectedMonth + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</strong>
                      </p>
                    </div>
                            </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Set Budget'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted-primary border border-subtle-primary rounded-4 shadow-xs">
              <p className="text-sm fg-2 mb-1">Total Budget</p>
              <p className="text-2xl fw-bold fg-primary">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="p-4 bg-muted-danger border border-subtle-danger rounded-4 shadow-xs">
              <p className="text-sm fg-2 mb-1">Total Spent</p>
              <p className="text-2xl fw-bold fg-danger">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="p-4 bg-muted-success border border-subtle-success rounded-4 shadow-xs">
              <p className="text-sm fg-2 mb-1">Remaining</p>
              <p className="text-2xl fw-bold fg-success fg-success">{formatCurrency(totalRemaining)}</p>
            </div>
          </div>

          {/* Budget Categories */}
          <div className="space-y-4">
            {budgetStatus.length === 0 ? (
              <div className="text-center py-12 fg-2">
                <p>No budgets set for this month</p>
                <p className="text-sm">Click "Set Budget" to create your first budget</p>
              </div>
            ) : (
              budgetStatus.map((item) => (
                <div
                  key={item.category}
                  className="p-4 border border-keyline rounded-3 app-hover-muted app-transition"
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <h4 className="fw-semibold">{item.category}</h4>
                      {item.status === 'safe' && (
                        <CheckCircle className="app-h-4 app-w-4 fg-success" />
                      )}
                      {item.status === 'warning' && (
                        <AlertTriangle className="app-h-4 app-w-4 fg-warning" />
                      )}
                      {item.status === 'danger' && (
                        <AlertCircle className="app-h-4 app-w-4 fg-danger" />
                      )}
                    </div>
                    <div className="text-end">
                      <p className="text-sm fg-2">{formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                      </p>
                      <p className={`text-xs ${
                        item.status === 'danger' ? 'fg-danger' :
                        item.status === 'warning' ? 'fg-warning' :
                        'fg-success'
                      }`}>
                        {item.percentage.toFixed(1)}% used
                      </p>
                    </div>
                  </div>

                  <Progress
                    value={item.percentage}
                    className={`app-h-2 ${
                      item.status === 'danger' ? 'progress-fill-danger' :
                      item.status === 'warning' ? 'progress-fill-warning' :
                      'progress-fill-success'
                    }`}
                  />

                  <div className="mt-2 d-flex justify-content-between text-sm">
                    <span className="fg-2">Remaining:</span>
                    <span className={`fw-medium ${
                      item.remaining > 0 ? 'fg-success' : 'fg-danger'
                    }`}>
                      {formatCurrency(item.remaining)}
                    </span>
                  </div>

                  {item.status === 'danger' && (
                    <div className="mt-3 p-2 bg-subtle-danger rounded text-sm fg-danger">
                      ⚠️ You have exceeded your budget for this category!
                    </div>
                  )}
                  {item.status === 'warning' && (
                    <div className="mt-3 p-2 bg-subtle-warning rounded text-sm fg-warning">
                      ⚠️ You are approaching your budget limit
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
