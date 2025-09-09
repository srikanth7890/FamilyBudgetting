import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { expenseAPI, categoryAPI, familyAPI } from '../services/api';
import { Category, Family } from '../types';

const CreateExpense: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    family: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    tags: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [familiesData, categoriesData] = await Promise.all([
        familyAPI.getFamilies(),
        categoryAPI.getCategories()
      ]);
      setFamilies(familiesData);
      setCategories(categoriesData);
      
      // Set default family if only one exists
      if (familiesData.length === 1) {
        setFormData(prev => ({ ...prev, family: familiesData[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load required data. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.amount || !formData.category || !formData.family) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await expenseAPI.createExpense({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        amount: parseFloat(formData.amount),
        category: parseInt(formData.category),
        family: parseInt(formData.family),
        date: formData.date,
        payment_method: formData.payment_method as any,
        tags: formData.tags.trim() || undefined,
      });

      navigate('/expenses');
    } catch (error: any) {
      console.error('Error creating expense:', error);
      setError(error.response?.data?.error || 'Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryFormData.name.trim() || !formData.family) {
      setError('Please fill in category name and select a family first.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const newCategory = await categoryAPI.createCategory({
        name: categoryFormData.name.trim(),
        description: categoryFormData.description.trim() || undefined,
        color: categoryFormData.color,
        family: parseInt(formData.family),
      });

      // Add the new category to the list
      setCategories(prev => [...prev, newCategory]);
      
      // Set the new category as selected
      setFormData(prev => ({ ...prev, category: newCategory.id.toString() }));
      
      // Reset category form and close modal
      setCategoryFormData({ name: '', description: '', color: '#3B82F6' });
      setShowCreateCategory(false);
    } catch (error: any) {
      console.error('Error creating category:', error);
      setError(error.response?.data?.error || 'Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/expenses')}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Expense
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Record a new expense for your family.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter expense title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                rows={3}
                placeholder="Enter expense description (optional)"
              />
            </div>

            {/* Amount and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCreateCategory(true)}
                    className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400"
                  >
                    + Create New
                  </button>
                </div>
                <select
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

            {/* Family and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Family *
                </label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Payment Method and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method *
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="digital_wallet">Digital Wallet</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter tags (comma separated)"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/expenses')}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Expense'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create New Category
              </h3>
              
              <form onSubmit={handleCreateCategory}>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      className="input-field"
                      placeholder="Enter category name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={categoryFormData.description}
                      onChange={handleCategoryInputChange}
                      className="input-field"
                      rows={2}
                      placeholder="Enter category description (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        name="color"
                        value={categoryFormData.color}
                        onChange={handleCategoryInputChange}
                        className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        name="color"
                        value={categoryFormData.color}
                        onChange={handleCategoryInputChange}
                        className="input-field flex-1"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCategory(false);
                      setCategoryFormData({ name: '', description: '', color: '#3B82F6' });
                      setError('');
                    }}
                    className="flex-1 btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExpense;
