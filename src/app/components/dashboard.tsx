import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ExpenseManager } from './expense-manager';
import { IncomeManager } from './income-manager';
import { AssetManager } from './asset-manager';
import { BudgetManager } from './budget-manager';
import { AnalyticsDashboard } from './analytics-dashboard';
import { BankAccountManager } from './bank-account-manager';
import { CurrencySettings } from './currency-settings';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import { useTranslation } from '../hooks/useTranslation';
import { useCurrency } from '../context/CurrencyContext';
import { LogOut, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { API_BASE_URL } from '../../api-config';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface DashboardProps {
  accessToken: string;
  onLogout: () => void;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  recurring?: boolean;
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
  purchaseDate: string;
}

export function Dashboard({ accessToken, onLogout }: DashboardProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCurrency } = useCurrency();
  const formatCurrency = useFormatCurrency();
  const t = useTranslation();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchExpenses(), fetchIncome(), fetchAssets()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/expenses`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchIncome = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/income`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setIncome(data.income || []);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/assets`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  // Calculate summary metrics
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = assets.reduce((sum, item) => sum + item.currentValue, 0);
  const netWorth = totalAssets + (totalIncome - totalExpenses);

  // Get current month expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  }).reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('financeManager')}</h1>
              <p className="text-sm text-gray-600">{t('manageYourFinances')}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('netWorth')}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netWorth)}</div>
              <p className="text-xs text-muted-foreground">Total assets minus expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalIncome')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">{t('allTimeIncome')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('monthlyExpenses')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
              <p className="text-xs text-muted-foreground">{t('thisMonth')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalAssets')}</CardTitle>
              <PiggyBank className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAssets)}</div>
              <p className="text-xs text-muted-foreground">{t('totalAssetsLabel').replace('{count}', assets.length.toString())}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">{t('dashboard')}</TabsTrigger>
            <TabsTrigger value="income">{t('income')}</TabsTrigger>
            <TabsTrigger value="expenses">{t('expenses')}</TabsTrigger>
            <TabsTrigger value="assets">{t('assets')}</TabsTrigger>
            <TabsTrigger value="bank">{t('bankAccounts')}</TabsTrigger>
            <TabsTrigger value="budget">{t('budget')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
            <TabsTrigger value="settings">{t('settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AnalyticsDashboard 
              expenses={expenses} 
              income={income} 
              assets={assets} 
            />
          </TabsContent>

          <TabsContent value="income">
            <IncomeManager
              accessToken={accessToken}
              income={income}
              onRefresh={fetchIncome}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseManager
              accessToken={accessToken}
              expenses={expenses}
              onRefresh={fetchExpenses}
            />
          </TabsContent>

          <TabsContent value="assets">
            <AssetManager
              accessToken={accessToken}
              assets={assets}
              onRefresh={fetchAssets}
            />
          </TabsContent>

          <TabsContent value="bank">
            <BankAccountManager
              accessToken={accessToken}
            />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetManager
              accessToken={accessToken}
              expenses={expenses}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard 
              expenses={expenses} 
              income={income} 
              assets={assets} 
            />
          </TabsContent>

          <TabsContent value="settings">
            <CurrencySettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
