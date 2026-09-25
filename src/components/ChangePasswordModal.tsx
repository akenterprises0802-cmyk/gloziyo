import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, Check, AlertCircle, ShieldAlert, Phone, ShieldCheck, User } from 'lucide-react';
import { AuthUser, UserAccount, UserRole } from '../types';
import { ROLE_DEFINITIONS } from '../utils/authPermissions';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: AuthUser | UserAccount | null;
  accounts: UserAccount[];
  currentUserRole: string;
  roleTitles?: Record<UserRole, string>;
  onUpdateUserCredentials: (
    userId: string,
    data: { name?: string; newPassword?: string; mobile?: string }
  ) => { success: boolean; message?: string };
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  accounts,
  currentUserRole,
  roleTitles,
  onUpdateUserCredentials,
}) => {
  const isAdmin = currentUserRole === 'admin';

  // Selected user ID (Admin can switch between accounts)
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Active user being modified
  const activeAccount = accounts.find((a) => a.id === selectedUserId) || 
    (targetUser ? accounts.find((a) => a.id === targetUser.id) : null) || 
    accounts[0];

  useEffect(() => {
    if (isOpen) {
      const initialId = targetUser?.id || (accounts.length > 0 ? accounts[0].id : '');
      setSelectedUserId(initialId);
      const acc = accounts.find((a) => a.id === initialId);
      setFullName(acc?.name || '');
      setMobileNumber(acc?.mobile || '');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setSuccessMessage('');
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen, targetUser, accounts]);

  // When user switches selected target in the dropdown
  const handleUserChange = (newId: string) => {
    setSelectedUserId(newId);
    const acc = accounts.find((a) => a.id === newId);
    setFullName(acc?.name || '');
    setMobileNumber(acc?.mobile || '');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  if (!isOpen) return null;

  // If user is not Admin, show restriction alert
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold">Access Restricted</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Administrator Privilege Required</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Only system <strong>Administrators</strong> have the security clearance to change user names, passwords, and update registered mobile numbers.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-left space-y-1">
              <p className="font-semibold text-slate-700">Need to update your details?</p>
              <p>Please contact your System Administrator (<span className="font-mono text-slate-700">@admin</span>) to request a name, mobile, or password update.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!activeAccount) {
      setErrorMessage('Please select a valid user account.');
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage('User full name cannot be empty.');
      return;
    }

    const trimmedMobile = mobileNumber.trim();
    if (!trimmedMobile) {
      setErrorMessage('Mobile number cannot be empty.');
      return;
    }

    // Optional password change check
    const trimmedPass = newPassword.trim();
    if (trimmedPass) {
      if (trimmedPass.length < 4) {
        setErrorMessage('New password must be at least 4 characters long.');
        return;
      }
      if (trimmedPass !== confirmPassword.trim()) {
        setErrorMessage('New password and confirmation do not match.');
        return;
      }
    }

    const result = onUpdateUserCredentials(activeAccount.id, {
      name: trimmedName,
      mobile: trimmedMobile,
      newPassword: trimmedPass || undefined,
    });

    if (result.success) {
      setSuccessMessage(
        trimmedPass 
          ? `Name, password, and mobile number successfully updated for ${trimmedName}.`
          : `Name and mobile number successfully updated for ${trimmedName}.`
      );
      setTimeout(() => {
        onClose();
      }, 1300);
    } else {
      setErrorMessage(result.message || 'Failed to update user details.');
    }
  };

  const roleDef = activeAccount ? ROLE_DEFINITIONS[activeAccount.role] : null;
  const activeRoleName = roleTitles?.[activeAccount?.role] || roleDef?.name || 'User';
  const isPasswordEntered = newPassword.length > 0;
  const isLengthValid = newPassword.length >= 4;
  const isMatchValid = isPasswordEntered && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with Admin Badge */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Admin: Change Name, Mobile & Password</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-400/30">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Option to change the name, mobile number, and password of Administrator, HR Manager, and Viewer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Select User Account */}
          <div>
            <label 
              htmlFor="targetUserSelect" 
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Select User Account to Change *
            </label>
            <div className="relative">
              <select
                id="targetUserSelect"
                value={selectedUserId}
                onChange={(e) => handleUserChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
              >
                {accounts.map((acc) => {
                  const accRoleName = roleTitles?.[acc.role] || ROLE_DEFINITIONS[acc.role]?.name || acc.role;
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (@{acc.username}) — {accRoleName}
                    </option>
                  );
                })}
              </select>
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {activeAccount && roleDef && (
              <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{activeAccount.name}</span>
                  <span className="text-slate-400 font-mono">(@{activeAccount.username})</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleDef.badgeBg} ${roleDef.badgeText} ${roleDef.badgeBorder}`}>
                  {activeRoleName}
                </span>
              </div>
            )}
          </div>

          {/* Option to Change Full Name of Administrator, HR Manager, Viewer */}
          <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1.5">
            <label 
              htmlFor="userFullNameInput" 
              className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                Change Name of {activeRoleName} *
              </span>
              <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">
                Change Name
              </span>
            </label>
            <div className="relative">
              <input
                id="userFullNameInput"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name for this role"
                className="w-full pl-3 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all font-semibold text-slate-900"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Change the display name of Administrator, HR Manager, or Viewer.
            </p>
          </div>

          {/* Mobile Number Field */}
          <div>
            <label 
              htmlFor="userMobileInput" 
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between"
            >
              <span>User Mobile Number *</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">e.g. +91 98765 43210</span>
            </label>
            <div className="relative">
              <input
                id="userMobileInput"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                required
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Registered contact number used for authentication and administrative notifications.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>Change / Reset User Password</span>
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Leave blank to keep the existing password, or enter a new password below to reset.
            </p>

            {/* New Password */}
            <div className="space-y-3">
              <div>
                <label 
                  htmlFor="newPasswordAdminInput" 
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPasswordAdminInput"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 4 chars)"
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    title={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label 
                  htmlFor="confirmPasswordAdminInput" 
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPasswordAdminInput"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    title={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Match / Length indicators when typing */}
              {isPasswordEntered && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      isLengthValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isLengthValid ? '✓' : '•'}
                    </span>
                    <span className={isLengthValid ? 'text-slate-800 font-medium' : 'text-rose-600 font-medium'}>
                      Minimum 4 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      isMatchValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isMatchValid ? '✓' : '•'}
                    </span>
                    <span className={isMatchValid ? 'text-slate-800 font-medium' : 'text-rose-600 font-medium'}>
                      Passwords match
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btnSubmitAdminUserUpdate"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
