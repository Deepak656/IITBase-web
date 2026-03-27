'use client';

import { useState } from 'react';
import { userApi } from '../lib/userApi';
import { authApi } from '../lib/authApi';

interface ProfileSettingsProps {
  userInfo: {
    email: string;
    role: string;
    activeSessions?: number;
  } | null;
  onUpdate: () => void;
}

export default function ProfileSettings({ userInfo, onUpdate }: ProfileSettingsProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Change Password State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await userApi.user.changePassword(passwordData);
      setSuccess('Password changed successfully. Please log in again.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmail !== userInfo?.email) {
      setError('Email confirmation does not match');
      return;
    }

    setLoading(true);
    try {
      await userApi.user.deleteAccount(deleteEmail);
      alert('Account deleted successfully');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('This will log you out from all devices. Continue?')) return;

    try {
      await authApi.auth.logoutAll();
      alert('Logged out from all devices');
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Failed to logout from all devices');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Basic Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Type
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-900 font-medium">
            {userInfo?.role === 'RECRUITER' ? 'Recruiter Account' : 
             userInfo?.role === 'ADMIN' ? 'Administrator Account' : 
             'Job Seeker Account'}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-900">{userInfo?.email || 'Loading...'}</p>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Active Sessions
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center">
          <p className="text-gray-900">
            {userInfo?.activeSessions || 0} active session(s)
          </p>
          <button
            onClick={handleLogoutAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Logout All Devices
          </button>
        </div>
      </div>
      {/* Change Password Section */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Security
        </h3>
        
        {!showPasswordChange ? (
          <button
            onClick={() => setShowPasswordChange(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Change Password
          </button>
        ) : (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Danger Zone
        </h3>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg space-y-4">
            <p className="text-sm text-red-800">
              This action cannot be undone. Please type your email to confirm:
            </p>
            <input
              type="email"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              className="w-full px-4 py-3 border border-red-300 rounded-lg"
              placeholder={userInfo?.email}
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading || deleteEmail !== userInfo?.email}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete My Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteEmail('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}