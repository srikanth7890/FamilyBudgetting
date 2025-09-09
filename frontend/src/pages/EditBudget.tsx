import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { budgetAPI, categoryAPI, familyAPI } from '../services/api';
import { Budget, Category, Family } from '../types';

const EditBudget: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    category: '',
    family: '',
    period: 'monthly',
    start_date: '',
    end_date: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load budget data
      const budgetData = await budgetAPI.getBudget(Number(id));
      setBudget(budgetData);
      
      // Set form data
      setFormData({
        name: budgetData.name,
        description: budgetData.description || '',
        amount: budgetData.amount.toString(),
        category: '', // Will be set after loading categories
        family: '', // Will be set after loading families
        period: budgetData.period,
        start_date: budgetData.start_date,
        end_date: budgetData.end_date,
      });

      // Load categories and families
      const [categoriesData, familiesData] = await Promise.all([
        categoryAPI.getCategories(),
        familyAPI.getFamilies(),
      ]);
      
      setCategories(categoriesData);
      setFamilies(familiesData);

      // Find and set the correct category and family IDs
      const category = categoriesData.find(cat => cat.id === budgetData.category.id);
      const family = familiesData.find(fam => fam.id === budgetData.family);
      
      if (category) {
        setFormData(prev => ({ ...prev, category: category.id.toString() }));
      }
      if (family) {
        setFormData(prev => ({ ...prev, family: family.id.toString() }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateEndDate = () => {
    if (!formData.start_date || !formData.period) return;
    
    const startDate = new Date(formData.start_date);
    let endDate = new Date(startDate);
    
    switch (formData.period) {
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(startDate.getMonth() + 1);
    }
    
    setFormData(prev => ({
      ...prev,
      end_date: endDate.toISOString().split('T')[0]
    }));
  };

  useEffect(() => {
    calculateEndDate();
  }, [formData.period, formData.start_date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budget) return;

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category),
        family_id: parseInt(formData.family),
        period: formData.period,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      await budgetAPI.updateBudget(Number(id), updateData as any);
      navigate('/budgets');
    } catch (error) {
      console.error('Error updating budget:', error);
      setError('Failed to update budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Budget Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The budget you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => navigate('/budgets')}
          className="btn-primary"
        >
          Back to Budgets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/budgets')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Budget
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your budget details and settings.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Description */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter budget name"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field"
                  rows={3}
                  placeholder="Enter budget description (optional)"
                />
              </div>
            </div>

            {/* Amount and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

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
            </div>

            {/* Family and Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Period *
                </label>
                <select
                  id="period"
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Start and End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/budgets')}
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
                {saving ? 'Updating...' : 'Update Budget'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBudget;
