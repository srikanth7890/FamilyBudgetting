import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  UserGroupIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { familyAPI } from '../services/api';
import { Family, FamilyMember } from '../types';

const Families: React.FC = () => {
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [familyMembers, setFamilyMembers] = useState<{ [key: number]: FamilyMember[] }>({});
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      const familiesData = await familyAPI.getFamilies();
      setFamilies(familiesData);
      
      // Load members for each family
      const membersData: { [key: number]: FamilyMember[] } = {};
      for (const family of familiesData) {
        try {
          const members = await familyAPI.getFamilyMembers(family.id);
          membersData[family.id] = members;
        } catch (error) {
          console.error(`Error loading members for family ${family.id}:`, error);
        }
      }
      setFamilyMembers(membersData);
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    try {
      setFormLoading(true);
      setError('');
      await familyAPI.createFamily({
        name: familyName.trim(),
        description: familyDescription.trim() || undefined,
      });
      
      // Reset form
      setFamilyName('');
      setFamilyDescription('');
      setShowInviteModal(false);
      setSelectedFamily(null);
      
      // Reload families
      loadFamilies();
    } catch (error: any) {
      console.error('Error creating family:', error);
      setError(error.response?.data?.error || 'Failed to create family. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily || !inviteEmail) return;

    try {
      setFormLoading(true);
      setError('');
      await familyAPI.inviteFamilyMember(selectedFamily, inviteEmail);
      setInviteEmail('');
      setShowInviteModal(false);
      setSelectedFamily(null);
      loadFamilies(); // Reload to show new member
    } catch (error: any) {
      console.error('Error inviting member:', error);
      setError(error.response?.data?.error || 'Failed to invite member. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditFamily = (family: Family) => {
    setEditingFamily(family);
    setFamilyName(family.name);
    setFamilyDescription(family.description || '');
    setShowInviteModal(true);
    setSelectedFamily(null);
    setError('');
  };

  const handleUpdateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFamily || !familyName.trim()) return;

    try {
      setFormLoading(true);
      setError('');
      await familyAPI.updateFamily(editingFamily.id, {
        name: familyName.trim(),
        description: familyDescription.trim() || undefined,
      });
      
      // Reset form
      setFamilyName('');
      setFamilyDescription('');
      setEditingFamily(null);
      setShowInviteModal(false);
      
      // Reload families
      loadFamilies();
    } catch (error: any) {
      console.error('Error updating family:', error);
      if (error.response?.status === 403) {
        setError('You do not have permission to update this family. Only family admins can update families.');
      } else if (error.response?.status === 404) {
        setError('Family not found. It may have been deleted.');
        // Reset form and close modal
        setFamilyName('');
        setFamilyDescription('');
        setEditingFamily(null);
        setShowInviteModal(false);
        loadFamilies();
      } else {
        setError(error.response?.data?.error || 'Failed to update family. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteFamily = async (familyId: number) => {
    try {
      setFormLoading(true);
      setError('');
      await familyAPI.deleteFamily(familyId);
      setShowDeleteConfirm(null);
      loadFamilies();
    } catch (error: any) {
      console.error('Error deleting family:', error);
      if (error.response?.status === 403) {
        setError('You do not have permission to delete this family. Only family admins can delete families.');
      } else if (error.response?.status === 404) {
        setError('Family not found. It may have already been deleted.');
        // Reload families to update the list
        loadFamilies();
      } else {
        setError(error.response?.data?.error || 'Failed to delete family. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
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
            Families
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your family groups and invite members.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Family
        </button>
      </div>

      {/* Families List */}
      {families.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <UserGroupIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No families</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first family group.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Family
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {families.map((family) => (
            <div key={family.id} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {family.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditFamily(family)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Edit family"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(family.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete family"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {family.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {family.description}
                  </p>
                )}
                
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span>{family.member_count} members</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created by {family.created_by.first_name} {family.created_by.last_name}
                  </div>
                </div>
                
                {/* Family Members */}
                {familyMembers[family.id] && familyMembers[family.id].length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Members
                    </h4>
                    <div className="space-y-1">
                      {familyMembers[family.id].slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {member.user.first_name} {member.user.last_name}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.role === 'admin' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                      ))}
                      {familyMembers[family.id].length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{familyMembers[family.id].length - 3} more members
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedFamily(family.id);
                      setShowInviteModal(true);
                    }}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Invite
                  </button>
                  <Link
                    to={`/families/${family.id}`}
                    className="flex-1 btn-primary text-sm py-2 text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {selectedFamily ? 'Invite Family Member' : editingFamily ? 'Edit Family' : 'Create New Family'}
              </h3>
              
              <form onSubmit={selectedFamily ? handleInviteMember : editingFamily ? handleUpdateFamily : handleCreateFamily}>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                {selectedFamily ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input-field mb-4"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Family Name
                    </label>
                    <input
                      type="text"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      className="input-field mb-4"
                      placeholder="Enter family name"
                      required
                    />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={familyDescription}
                      onChange={(e) => setFamilyDescription(e.target.value)}
                      className="input-field mb-4"
                      rows={3}
                      placeholder="Enter family description"
                    />
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setSelectedFamily(null);
                      setEditingFamily(null);
                      setInviteEmail('');
                      setFamilyName('');
                      setFamilyDescription('');
                      setError('');
                    }}
                    className="flex-1 btn-secondary"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {selectedFamily ? 'Sending...' : editingFamily ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      selectedFamily ? 'Send Invite' : editingFamily ? 'Update Family' : 'Create Family'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Family
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this family? This action cannot be undone and will remove all associated data.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(null);
                    setError('');
                  }}
                  className="flex-1 btn-secondary"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFamily(showDeleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Family'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Families;
