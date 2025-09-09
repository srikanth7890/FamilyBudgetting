import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { expenseAPI, categoryAPI, familyAPI } from '../services/api';
import { Expense, Category, Family } from '../types';

const EditExpense: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [expense, setExpense] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    family: '',
    date: '',
    payment_method: 'cash',
    tags: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load expense data
      const expenseData = await expenseAPI.getExpense(Number(id));
      setExpense(expenseData);
      
      // Set form data
      setFormData({
        title: expenseData.title,
        description: expenseData.description || '',
        amount: expenseData.amount.toString(),
        category: '', // Will be set after loading categories
        family: '', // Will be set after loading families
        date: expenseData.date,
        payment_method: expenseData.payment_method,
        tags: expenseData.tags || '',
      });

      // Load categories and families
      const [categoriesData, familiesData] = await Promise.all([
        categoryAPI.getCategories(),
        familyAPI.getFamilies(),
      ]);
      
      setCategories(categoriesData);
      setFamilies(familiesData);

      // Find matching category and family IDs
      const matchingCategory = categoriesData.find(cat => cat.name === expenseData.category);
      const matchingFamily = familiesData.find(fam => fam.name === expenseData.family);

      // Update form data with correct IDs
      setFormData(prev => ({
        ...prev,
        category: matchingCategory?.id.toString() || '',
        family: matchingFamily?.id.toString() || '',
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.category || !formData.family || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category),
        family_id: parseInt(formData.family),
        date: formData.date,
        payment_method: formData.payment_method as 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'other',
        tags: formData.tags,
      };

      await expenseAPI.updateExpense(Number(id), updateData as any);
      navigate('/expenses');
    } catch (error) {
      console.error('Error updating expense:', error);
      setError('Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Expense not found</p>
        <button
          onClick={() => navigate('/expenses')}
          className="btn-primary mt-4"
        >
          Back to Expenses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/expenses')}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Expense
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update expense details
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-body">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="input-field"
                  required
                />
              </div>


              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Family */}
              <div>
                <label htmlFor="family" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Family *
                </label>
                <select
                  id="family"
                  name="family"
                  value={formData.family}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a family</option>
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="digital_wallet">Digital Wallet</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas"
                  className="input-field"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/expenses')}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Update Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExpense;
