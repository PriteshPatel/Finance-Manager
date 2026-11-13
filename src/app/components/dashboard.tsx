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
  bankAccountId?: string;
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
    <div className="min-vh-100 w-100 d-flex flex-column bg-body fg-body app-transition ">
      {/* Header */}
      <header className="w-100 app-bg-card border-bottom border-keyline app-transition  position-sticky top-0 z-sticky shadow-xs app-backdrop-blur">
        <div className="w-100 app-max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="d-flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-4">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 rounded-4 bg-muted-primary fg-primary border border-subtle-primary shadow-xs">
                <Wallet className="app-h-6 app-w-6" />
              </div>
              <div>
                <h1 className="text-xl app-sm-text-xl fw-bold app-tracking-tight fg-body lh-sm">
                  {t('financeManager')}
                </h1>
                <p className="text-xs app-sm-text-sm fg-2 mt-1">{t('manageYourFinances')}</p>
              </div>
            </div>

            <div className="d-flex align-items-center flex-wrap gap-3">
              <HeaderThemeSelector />
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                <LogOut className="me-1 app-h-4 app-w-4 fg-2" />
                <span>{t('logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-100 app-max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-fill space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-keyline shadow-xs app-hover-shadow app-transition">
            <CardHeader className="d-flex flex-row align-items-center justify-content-between space-y-0 pb-2">
              <CardTitle className="text-sm fw-medium">{t('netWorth')}</CardTitle>
              <div className="p-2 rounded-2 bg-1 fg-2">
                <Wallet className="app-h-4 app-w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl fw-bold fg-body">{formatCurrency(netWorth)}</div>
              <p className="text-xs fg-2 mt-1">Total assets minus expenses</p>
            </CardContent>
          </Card>

          <Card className="border-keyline shadow-xs app-hover-shadow app-transition">
            <CardHeader className="d-flex flex-row align-items-center justify-content-between space-y-0 pb-2">
              <CardTitle className="text-sm fw-medium">{t('totalIncome')}</CardTitle>
              <div className="p-2 rounded-2 bg-muted-success fg-success">
                <TrendingUp className="app-h-4 app-w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl fw-bold fg-success fg-success">{formatCurrency(totalIncome)}</div>
              <p className="text-xs fg-2 mt-1">{t('allTimeIncome')}</p>
            </CardContent>
          </Card>

          <Card className="border-keyline shadow-xs app-hover-shadow app-transition">
            <CardHeader className="d-flex flex-row align-items-center justify-content-between space-y-0 pb-2">
              <CardTitle className="text-sm fw-medium">{t('monthlyExpenses')}</CardTitle>
              <div className="p-2 rounded-2 bg-muted-danger fg-danger">
                <TrendingDown className="app-h-4 app-w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl fw-bold fg-danger">{formatCurrency(monthlyExpenses)}</div>
              <p className="text-xs fg-2 mt-1">{t('thisMonth')}</p>
            </CardContent>
          </Card>

          <Card className="border-keyline shadow-xs app-hover-shadow app-transition">
            <CardHeader className="d-flex flex-row align-items-center justify-content-between space-y-0 pb-2">
              <CardTitle className="text-sm fw-medium">{t('totalAssets')}</CardTitle>
              <div className="p-2 rounded-2 bg-muted-primary fg-primary">
                <PiggyBank className="app-h-4 app-w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl fw-bold fg-primary">{formatCurrency(totalAssets)}</div>
              <p className="text-xs fg-2 mt-1">{t('totalAssetsLabel').replace('{count}', assets.length.toString())}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="w-100 space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 app-lg-grid-8 gap-2 p-2 h-auto app-bg-muted-80 rounded-4 border border-keyline shadow-xs w-100">
            <TabsTrigger value="dashboard" className="app-h-11 py-2 px-3 text-xs app-sm-text-sm fw-medium gap-2 rounded-3 radix-tab-active radix-tab-active radix-tab-active app-transition">
              <LayoutDashboard className="app-h-4 app-w-4 flex-shrink-0" />
              <span className="text-truncate">{t('dashboard')}</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="app-h-11 py-2 px-3 text-xs app-sm-text-sm fw-medium gap-2 rounded-3 radix-tab-active radix-tab-active radix-tab-active app-transition">
              <TrendingUp className="app-h-4 app-w-4 flex-shrink-0" />
              <span className="text-truncate">{t('income')}</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="app-h-11 py-2 px-3 text-xs app-sm-text-sm fw-medium gap-2 rounded-3 radix-tab-active radix-tab-active radix-tab-active app-transition">
              <TrendingDown className="app-h-4 app-w-4 flex-shrink-0" />
              <span className="text-truncate">{t('expenses')}</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="app-h-11 py-2 px-3 text-xs app-sm-text-sm fw-medium gap-2 rounded-3 radix-tab-active radix-tab-active radix-tab-active app-transition">
              <PiggyBank className="app-h-4 app-w-4 flex-shrink-0" />
              <span className="text-truncate">{t('assets')}</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="app-h-11 py-2 px-3 text-xs app-sm-text-sm fw-medium gap-2 rounded-3 radix-tab-active radix-tab-active radix-tab-active app-transition">
              <Landmark className="app-h-4 app-w-4 flex-shrink-0" />
              <span className="text-truncate">{t('bankAccounts')}</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="app-h-11 py-2 px-3 text-xs app-sm-text-sm fw-medium gap-2 rounded-3 radix-tab-active radix-tab-active radix-tab-active app-transition">
              <PieChart className="app-h-4 app-w-4 flex-shrink-0" />
              <span className="text-truncate">{t('budget')}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="app-h-11 py-2 px-3 text-xs app-sm-text-sm fw-medium gap-2 rounded-3 radix-tab-active radix-tab-active radix-tab-active app-transition">
              <BarChart3 className="app-h-4 app-w-4 flex-shrink-0" />
              <span className="text-truncate">{t('analytics')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="app-h-11 py-2 px-3 text-xs app-sm-text-sm fw-medium gap-2 rounded-3 radix-tab-active radix-tab-active radix-tab-active app-transition">
              <Settings className="app-h-4 app-w-4 flex-shrink-0" />
              <span className="text-truncate">{t('settings')}</span>
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
