import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  ChartBarIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { familyAPI, budgetAPI, expenseAPI } from '../services/api';
import { Family, Budget, Expense, ExpenseStatistics } from '../types';
import { formatCurrencyForUser } from '../utils/currency';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [activeBudgets, setActiveBudgets] = useState<Budget[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [statistics, setStatistics] = useState<ExpenseStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedFamily]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load families
      const familiesData = await familyAPI.getFamilies();
      setFamilies(familiesData);
      
      if (familiesData.length > 0 && !selectedFamily) {
        setSelectedFamily(familiesData[0].id);
      }

      if (selectedFamily) {
        // Load active budgets
        const budgetsData = await budgetAPI.getActiveBudgets(selectedFamily);
        setActiveBudgets(budgetsData);

        // Load recent expenses
        const expensesData = await expenseAPI.getRecentExpenses(selectedFamily, 5);
        setRecentExpenses(expensesData);

        // Load statistics
        const statsData = await expenseAPI.getExpenseStatistics(selectedFamily, 'month');
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const getBudgetStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your family budget.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/expenses/new"
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Expense
          </Link>
          <Link
            to="/budgets/new"
            className="btn-secondary flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Budget
          </Link>
        </div>
      </div>

      {/* Family Selector */}
      {families.length > 1 && (
        <div className="card">
          <div className="card-body">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Family
            </label>
            <select
              value={selectedFamily || ''}
              onChange={(e) => setSelectedFamily(Number(e.target.value))}
              className="input-field"
            >
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrencyForUser(statistics.total_expenses, user?.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Transactions
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {statistics.expense_count}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Over Budget
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {activeBudgets.filter(b => b.spent_percentage > 100).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Active Budgets
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {activeBudgets.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Budgets */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Active Budgets
            </h3>
          </div>
          <div className="card-body">
            {activeBudgets.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No active budgets found.
              </p>
            ) : (
              <div className="space-y-4">
                {activeBudgets.map((budget) => (
                  <div key={budget.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {budget.name}
                      </h4>
                      <span className={`text-sm font-medium ${getBudgetStatusColor(budget.spent_percentage)}`}>
                        {budget.spent_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span>{budget.category.name}</span>
                      <span>{budget.period}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          budget.spent_percentage >= 100
                            ? 'bg-red-500'
                            : budget.spent_percentage >= 75
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.spent_percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mt-2">
                      <span>{formatCurrencyForUser(budget.spent_amount, user?.currency)} spent</span>
                      <span>{formatCurrencyForUser(budget.remaining_amount, user?.currency)} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Expenses
            </h3>
          </div>
          <div className="card-body">
            {recentExpenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent expenses found.
              </p>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3 bg-primary-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {expense.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrencyForUser(expense.amount, user?.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/expenses/new"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <CreditCardIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Add Expense</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Record a new expense</p>
              </div>
            </Link>
            <Link
              to="/budgets/new"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Create Budget</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set up a new budget</p>
              </div>
            </Link>
            <Link
              to="/families"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Manage Family</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Invite family members</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

