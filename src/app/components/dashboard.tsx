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
import { HeaderThemeSelector } from './ui/theme-selector';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import { useTranslation } from '../hooks/useTranslation';
import { useCurrency } from '../context/CurrencyContext';
import { 
  LogOut, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Landmark, 
  PieChart, 
  BarChart3, 
  Settings, 
  LayoutDashboard 
} from 'lucide-react';
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
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <header className="w-full bg-card border-b border-border transition-colors duration-200 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-card-foreground leading-tight">
                  {t('financeManager')}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{t('manageYourFinances')}</p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <HeaderThemeSelector />
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>{t('logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-border shadow-xs hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('netWorth')}</CardTitle>
              <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                <Wallet className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(netWorth)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total assets minus expenses</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalIncome')}</CardTitle>
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('allTimeIncome')}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('monthlyExpenses')}</CardTitle>
              <div className="p-1.5 rounded-md bg-destructive/10 text-destructive">
                <TrendingDown className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(monthlyExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('thisMonth')}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalAssets')}</CardTitle>
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <PiggyBank className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalAssets)}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('totalAssetsLabel').replace('{count}', assets.length.toString())}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="w-full space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 p-1.5 h-auto bg-muted/80 rounded-xl border border-border shadow-xs w-full">
            <TabsTrigger value="dashboard" className="h-11 py-2 px-3 text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('dashboard')}</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="h-11 py-2 px-3 text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('income')}</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="h-11 py-2 px-3 text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              <TrendingDown className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('expenses')}</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="h-11 py-2 px-3 text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              <PiggyBank className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('assets')}</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="h-11 py-2 px-3 text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              <Landmark className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('bankAccounts')}</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="h-11 py-2 px-3 text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              <PieChart className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('budget')}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="h-11 py-2 px-3 text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('analytics')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="h-11 py-2 px-3 text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
              <Settings className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('settings')}</span>
            </TabsTrigger>
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
