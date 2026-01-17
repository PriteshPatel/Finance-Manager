import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
import { formatCurrency } from '../../lib/currency-config';

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
  for (let i = 5; i >= 0; i--) {
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
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Distribution of your spending</CardDescription>
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
                  <Tooltip />
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
            <CardTitle>Asset Distribution</CardTitle>
            <CardDescription>Your portfolio allocation</CardDescription>
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
                  <Tooltip />
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
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>6-month trend comparison</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.some(d => d.expenses > 0 || d.income > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
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

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
          <CardDescription>Your highest expense categories</CardDescription>
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" name="Amount" />
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
            <CardTitle>Asset Performance</CardTitle>
            <CardDescription>Gains and losses on your assets</CardDescription>
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
                    <tr key={index} className="border-b hover:bg-gray-50">
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
