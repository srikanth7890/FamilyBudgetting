import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { expenseAPI } from '../services/api';
import { Expense } from '../types';
import { formatCurrencyForUser } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load expenses
      const expensesData = await expenseAPI.getExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async (expenseId: number) => {
    try {
      setDeleting(true);
      await expenseAPI.deleteExpense(expenseId);
      // Reload expenses after deletion
      await loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleViewExpense = (expenseId: number) => {
    navigate(`/expenses/${expenseId}`);
  };

  const handleEditExpense = (expenseId: number) => {
    navigate(`/expenses/${expenseId}/edit`);
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
            Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your family expenses.
          </p>
        </div>
        <Link
          to="/expenses/new"
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Expense
        </Link>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Expenses
          </h3>
        </div>
        <div className="card-body">
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No expenses found. Start by adding your first expense.
              </p>
              <Link
                to="/expenses/new"
                className="btn-primary"
              >
                Add Your First Expense
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Expense
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {expense.title}
                          </div>
                          {expense.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {expense.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2 bg-primary-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {expense.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrencyForUser(expense.amount, user?.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewExpense(expense.id)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400"
                            title="View expense details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditExpense(expense.id)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                            title="Edit expense"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(expense.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                            title="Delete expense"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                Delete Expense
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this expense? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-secondary"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="btn-danger"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;

