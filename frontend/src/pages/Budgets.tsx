import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { budgetAPI } from '../services/api';
import { Budget } from '../types';
import { formatCurrencyForUser } from '../utils/currency';

const Budgets: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const budgetsData = await budgetAPI.getBudgets(selectedFamily || undefined);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFamily]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleEditBudget = (budgetId: number) => {
    navigate(`/budgets/${budgetId}/edit`);
  };

  const handleDeleteBudget = async (budgetId: number) => {
    try {
      setDeleting(true);
      await budgetAPI.deleteBudget(budgetId);
      // Reload budgets after deletion
      await loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const getBudgetStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBudgetStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
    if (percentage >= 75) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
    return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
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
            Budgets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your family budgets and track spending.
          </p>
        </div>
        <Link
          to="/budgets/new"
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Budget
        </Link>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No budgets</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new budget.
            </p>
            <div className="mt-6">
              <Link
                to="/budgets/new"
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Budget
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <div key={budget.id} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {budget.name}
                  </h3>
                  {getBudgetStatusIcon(budget.spent_percentage)}
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>{budget.category.name}</span>
                    <span className="capitalize">{budget.period}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
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
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${getBudgetStatusColor(budget.spent_percentage)}`}>
                      {budget.spent_percentage.toFixed(1)}% used
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatCurrencyForUser(budget.spent_amount, user?.currency)} / {formatCurrencyForUser(budget.amount, user?.currency)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <span>Remaining:</span>
                  <span className={`font-medium ${
                    budget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrencyForUser(budget.remaining_amount, user?.currency)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>Period: {new Date(budget.start_date).toLocaleDateString()}</span>
                  <span>to {new Date(budget.end_date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditBudget(budget.id)}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(budget.id)}
                    className="flex-1 btn-danger text-sm py-2"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Budget
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this budget? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBudget(showDeleteConfirm)}
                className="flex-1 btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;

