import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Calendar as CalendarComponent } from './ui/calendar';
import { useTranslation } from '../hooks/useTranslation';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  purchasePrice: number;
}

interface AnalyticsDashboardProps {
  expenses: Expense[];
  income: Income[];
  assets: Asset[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

export function AnalyticsDashboard({ expenses, income, assets }: AnalyticsDashboardProps) {
  const t = useTranslation();
  const formatCurrency = useFormatCurrency();
  const [dateRange, setDateRange] = useState<string>('last30days');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

  // Calculate date range based on selection
  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    switch (dateRange) {
      case 'last7days':
        return { start: subDays(now, 7), end: now };
      case 'last30days':
        return { start: subDays(now, 30), end: now };
      case 'thisMonth':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
      case 'custom':
        return {
          start: customStartDate ? startOfDay(customStartDate) : subDays(now, 30),
          end: customEndDate ? endOfDay(customEndDate) : now,
        };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

  // Calculate day-to-day income and expenses for the selected range
  const dailyData = () => {
    const data: { date: string; income: number; expenses: number }[] = [];
    let current = new Date(startDate);
    let safety = 0;
    while (current <= endDate && safety < 366) {
      const dateStr = format(current, 'yyyy-MM-dd');
      const dayIncome = income
        .filter(i => i.date === dateStr)
        .reduce((sum, i) => sum + i.amount, 0);
      const dayExpenses = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      data.push({
        date: format(current, 'MMM dd'),
        income: dayIncome,
        expenses: dayExpenses,
      });
      current = new Date(current.setDate(current.getDate() + 1));
      safety++;
    }
    return data;
  };

  const dailyIncomeVsExpenses = dailyData();
  // Calculate expense by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Calculate asset distribution
  const assetsByType = assets.reduce((acc, asset) => {
    const existing = acc.find(item => item.name === asset.type);
    if (existing) {
      existing.value += asset.currentValue;
    } else {
      acc.push({ name: asset.type, value: asset.currentValue });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Monthly trends (last 6 months)
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthExpenses = expenses.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getMonth() === month && eDate.getFullYear() === year;
    }).reduce((sum, e) => sum + e.amount, 0);

    const monthIncome = income.filter(i => {
      const iDate = new Date(i.date);
      return iDate.getMonth() === month && iDate.getFullYear() === year;
    }).reduce((sum, i) => sum + i.amount, 0);

    monthlyData.push({
      month: monthName,
      expenses: monthExpenses,
      income: monthIncome,
    });
  }

  // Top spending categories
  const topCategories = [...expensesByCategory]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Asset performance
  const assetPerformance = assets.map(asset => ({
    name: asset.name,
    gain: asset.currentValue - asset.purchasePrice,
    percentage: ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice * 100).toFixed(1),
  })).sort((a, b) => b.gain - a.gain);

  return (
    <div className="space-y-6">
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('expenses')}</CardTitle>
            <CardDescription>{t('manageYourFinances')}</CardDescription>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', color: 'var(--card-foreground)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('assetDistribution')}</CardTitle>
            <CardDescription>{t('portfolioAllocation')}</CardDescription>
          </CardHeader>
          <CardContent>
            {assetsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={80}
                    fill="#82ca9d"
                    dataKey="value"
                  >
                    {assetsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', color: 'var(--card-foreground)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No asset data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('incomeVsExpenses')}</CardTitle>
          <CardDescription>{t('sixMonthTrend')}</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.some(d => d.expenses > 0 || d.income > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', color: 'var(--card-foreground)' }} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No transaction data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Trend Chart with Date Range Selection */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>{t('dailyTrend')}</CardTitle>
              <CardDescription>{t('dailyTrendDescription')}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">{t('last7Days')}</SelectItem>
                  <SelectItem value="last30days">{t('last30Days')}</SelectItem>
                  <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
                  <SelectItem value="custom">{t('custom')}</SelectItem>
                </SelectContent>
              </Select>
              {dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                        {customStartDate ? format(customStartDate, 'MMM dd') : t('from')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                        {customEndDate ? format(customEndDate, 'MMM dd') : t('to')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dailyIncomeVsExpenses.some(d => d.income > 0 || d.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyIncomeVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', color: 'var(--card-foreground)' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No transaction data available for selected date range
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>{t('topSpendingCategories')}</CardTitle>
          <CardDescription>{t('highestExpenseCategories')}</CardDescription>
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCategories}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', color: 'var(--card-foreground)' }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No expense categories to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Performance Table */}
      {assetPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('assetPerformance')}</CardTitle>
            <CardDescription>{t('gainsAndLosses')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Asset</th>
                    <th className="text-right py-2 px-4">Gain/Loss</th>
                    <th className="text-right py-2 px-4">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {assetPerformance.map((asset, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{asset.name}</td>
                      <td className={`text-right py-3 px-4 ${asset.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(asset.gain)}
                      </td>
                      <td className={`text-right py-3 px-4 ${asset.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {asset.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
