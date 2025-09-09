import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  UserIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { expenseAPI } from '../services/api';
import { Expense } from '../types';
import { formatCurrencyForUser } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadExpense = useCallback(async () => {
    try {
      setLoading(true);
      const expenseData = await expenseAPI.getExpense(Number(id));
      setExpense(expenseData);
    } catch (error) {
      console.error('Error loading expense:', error);
      setError('Failed to load expense details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadExpense();
  }, [loadExpense]);

  const handleDelete = async () => {
    if (!expense) return;

    try {
      setDeleting(true);
      await expenseAPI.deleteExpense(expense.id);
      navigate('/expenses');
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Failed to delete expense');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPaymentMethod = (method: string) => {
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error || 'Expense not found'}
        </p>
        <button
          onClick={() => navigate('/expenses')}
          className="btn-primary"
        >
          Back to Expenses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/expenses')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {expense.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Expense Details
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/expenses/${expense.id}/edit`)}
            className="btn-secondary flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Expense Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Basic Information
              </h3>
            </div>
            <div className="card-body space-y-4">
              {expense.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-900 dark:text-white">
                    {expense.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyForUser(expense.amount, user?.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {expense.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Family
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {expense.family}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Paid By
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {expense.paid_by}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Method
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {formatPaymentMethod(expense.payment_method)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {expense.tag_list && expense.tag_list.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <TagIcon className="h-5 w-5 mr-2" />
                  Tags
                </h3>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  {expense.tag_list.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Receipt Image */}
          {expense.receipt_image && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Receipt
                </h3>
              </div>
              <div className="card-body">
                <img
                  src={expense.receipt_image}
                  alt="Receipt"
                  className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Metadata
              </h3>
            </div>
            <div className="card-body space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Created
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(expense.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Updated
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(expense.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
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
                  Are you sure you want to delete "{expense.title}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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

export default ExpenseDetail;
