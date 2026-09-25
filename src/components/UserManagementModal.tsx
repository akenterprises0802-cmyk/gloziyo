import React, { useState } from 'react';
import { X, UserPlus, Shield, Trash2, Key, Check, AlertCircle, Phone, Edit2, Save, RotateCcw, Sliders, User } from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { ROLE_DEFINITIONS } from '../utils/authPermissions';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: UserAccount[];
  currentUserId: string;
  roleTitles?: Record<UserRole, string>;
  onUpdateRoleTitles?: (titles: Record<UserRole, string>) => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onAddUser: (account: Omit<UserAccount, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  onUpdateUser?: (userId: string, data: { name: string; mobile: string; email?: string }) => { success: boolean; message?: string };
  onDeleteUser: (userId: string) => void;
  onOpenChangePasswordForUser?: (account: UserAccount) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  accounts,
  currentUserId,
  roleTitles,
  onUpdateRoleTitles,
  onUpdateRole,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onOpenChangePasswordForUser,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('viewer');
  const [formError, setFormError] = useState('');

  // Role customization toggle & local state
  const [isCustomizingRoles, setIsCustomizingRoles] = useState(false);
  const [adminTitle, setAdminTitle] = useState(roleTitles?.admin || 'Administrator');
  const [hrTitle, setHrTitle] = useState(roleTitles?.hr_manager || 'HR Manager');
  const [viewerTitle, setViewerTitle] = useState(roleTitles?.viewer || 'Viewer');
  const [employeeTitle, setEmployeeTitle] = useState(roleTitles?.employee || 'Employee');
  const [roleCustomSuccess, setRoleCustomSuccess] = useState('');

  // Inline user editing
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (acc: UserAccount) => {
    setEditingUserId(acc.id);
    setEditName(acc.name);
    setEditMobile(acc.mobile || '');
    setEditEmail(acc.email || '');
    setEditError('');
  };

  const handleSaveEdit = (userId: string) => {
    if (!editName.trim()) {
      setEditError('User name cannot be empty.');
      return;
    }
    if (onUpdateUser) {
      const res = onUpdateUser(userId, {
        name: editName.trim(),
        mobile: editMobile.trim(),
        email: editEmail.trim(),
      });
      if (res && !res.success) {
        setEditError(res.message || 'Failed to update user.');
        return;
      }
    }
    setEditingUserId(null);
    setEditError('');
  };

  const handleSaveRoleTitles = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTitle.trim() || !hrTitle.trim() || !viewerTitle.trim() || !employeeTitle.trim()) {
      return;
    }
    if (onUpdateRoleTitles) {
      onUpdateRoleTitles({
        admin: adminTitle.trim(),
        hr_manager: hrTitle.trim(),
        viewer: viewerTitle.trim(),
        employee: employeeTitle.trim(),
      });
    }
    setRoleCustomSuccess('Role display names updated successfully!');
    setTimeout(() => {
      setRoleCustomSuccess('');
    }, 2500);
  };

  const handleResetRoleTitles = () => {
    const defaults = {
      admin: 'Administrator',
      hr_manager: 'HR Manager',
      viewer: 'Viewer',
      employee: 'Employee',
    };
    setAdminTitle(defaults.admin);
    setHrTitle(defaults.hr_manager);
    setViewerTitle(defaults.viewer);
    setEmployeeTitle(defaults.employee);
    if (onUpdateRoleTitles) {
      onUpdateRoleTitles(defaults);
    }
    setRoleCustomSuccess('Reset to default role names.');
    setTimeout(() => {
      setRoleCustomSuccess('');
    }, 2500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      setFormError('Please fill in username, password, and full name.');
      return;
    }

    if (!newMobile.trim()) {
      setFormError('Please enter user mobile number.');
      return;
    }

    const res = onAddUser({
      username: newUsername.trim().toLowerCase(),
      password: newPassword.trim(),
      name: newName.trim(),
      mobile: newMobile.trim(),
      email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@company.com`,
      role: newRole,
    });

    if (res.success) {
      setIsAdding(false);
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewMobile('');
      setNewEmail('');
      setNewRole('viewer');
    } else {
      setFormError(res.message || 'Failed to create user account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">User Accounts & Role Permissions</h2>
              <p className="text-xs text-slate-400">Manage user logins and assign access privileges</p>
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Permission matrix summary card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Role Capabilities & Names Matrix
              </h3>
              <button
                type="button"
                id="btnToggleCustomizeRoleNames"
                onClick={() => setIsCustomizingRoles(!isCustomizingRoles)}
                className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>{isCustomizingRoles ? 'Hide Role Renaming' : 'Option to Change Role Names'}</span>
              </button>
            </div>

            {/* Role Name Customization Drawer/Form */}
            {isCustomizingRoles && (
              <form onSubmit={handleSaveRoleTitles} className="mb-4 p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-purple-200/60">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-700" />
                    <h4 className="text-xs font-bold text-purple-950">Option to Change Name of Administrator, HR Manager, Viewer, and Employee</h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-200 text-purple-800">
                    Admin Only
                  </span>
                </div>

                {roleCustomSuccess && (
                  <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{roleCustomSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Administrator Name *
                    </label>
                    <input
                      type="text"
                      value={adminTitle}
                      onChange={(e) => setAdminTitle(e.target.value)}
                      placeholder="e.g. Administrator"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      HR Manager Name *
                    </label>
                    <input
                      type="text"
                      value={hrTitle}
                      onChange={(e) => setHrTitle(e.target.value)}
                      placeholder="e.g. HR Manager"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Viewer Name *
                    </label>
                    <input
                      type="text"
                      value={viewerTitle}
                      onChange={(e) => setViewerTitle(e.target.value)}
                      placeholder="e.g. Viewer"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      value={employeeTitle}
                      onChange={(e) => setEmployeeTitle(e.target.value)}
                      placeholder="e.g. Employee"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleResetRoleTitles}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="submit"
                    id="btnSaveRoleTitles"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Role Names</span>
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['admin', 'hr_manager', 'viewer', 'employee'] as UserRole[]).map((r) => {
                const def = ROLE_DEFINITIONS[r];
                const displayName = roleTitles?.[r] || def.name;
                return (
                  <div key={r} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${def.badgeBg} ${def.badgeText} ${def.badgeBorder}`}>
                        {displayName}
                      </span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1 mt-2">
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 ${def.permissions.canAdd ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span className={def.permissions.canAdd ? 'text-slate-800 font-semibold' : 'text-slate-400 line-through'}>Add Employees</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 ${def.permissions.canEdit ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span className={def.permissions.canEdit ? 'text-slate-800' : 'text-slate-400 line-through'}>Edit Records</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 ${def.permissions.canDelete ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span className={def.permissions.canDelete ? 'text-slate-800' : 'text-slate-400 line-through'}>Delete Records</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 ${def.permissions.canViewDetails ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span className={def.permissions.canViewDetails ? 'text-slate-800' : 'text-slate-400 line-through'}>View Employee Details</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 ${def.permissions.canExport ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span className={def.permissions.canExport ? 'text-slate-800' : 'text-slate-400 line-through'}>Export PDF/Excel</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 ${r !== 'employee' ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span className={r !== 'employee' ? 'text-slate-800' : 'text-slate-400 line-through'}>Form C & D Access</span>
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User List Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Configured Accounts ({accounts.length})
              </h3>
              {!isAdding && (
                <button
                  type="button"
                  id="btnShowAddUserForm"
                  onClick={() => setIsAdding(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New User</span>
                </button>
              )}
            </div>

            {/* Add User Form */}
            {isAdding && (
              <form onSubmit={handleCreateSubmit} className="mb-4 p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800">Create New System Account</h4>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>

                {formError && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Username (Login ID) *
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. mlin"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                      Assign Role *
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                    >
                      <option value="employee">{roleTitles?.employee || 'Employee'} (Add Employee Only)</option>
                      <option value="viewer">{roleTitles?.viewer || 'Viewer'} (Read-Only)</option>
                      <option value="hr_manager">{roleTitles?.hr_manager || 'HR Manager'} (Add & Edit)</option>
                      <option value="admin">{roleTitles?.admin || 'Admin'} (Full Access & Delete)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs"
                  >
                    Save User
                  </button>
                </div>
              </form>
            )}

            {/* Account rows */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
              {accounts.map((acc) => {
                const roleDef = ROLE_DEFINITIONS[acc.role] || ROLE_DEFINITIONS.viewer;
                const isCurrent = acc.id === currentUserId || acc.username === 'admin';
                const isEditingThisUser = editingUserId === acc.id;

                if (isEditingThisUser) {
                  return (
                    <div key={acc.id} className="p-3.5 bg-purple-50/40 border-l-4 border-l-purple-600 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-600" />
                          Edit User: {acc.name} (@{acc.username})
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">ID: {acc.id}</span>
                      </div>

                      {editError && (
                        <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
                          {editError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Full name"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            value={editMobile}
                            onChange={(e) => setEditMobile(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="user@company.com"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(acc.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Details</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={acc.id} className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {acc.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                          <span className="text-[11px] font-mono text-slate-500">(@{acc.username})</span>
                          {acc.id === currentUserId && (
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-sm">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-slate-500">
                          <span>{acc.email || `${acc.username}@company.com`}</span>
                          {acc.mobile && (
                            <span className="flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                              <Phone className="w-2.5 h-2.5 text-slate-500" />
                              {acc.mobile}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-500 font-medium">Role:</label>
                        <select
                          value={acc.role}
                          disabled={acc.username === 'admin'}
                          onChange={(e) => onUpdateRole(acc.id, e.target.value as UserRole)}
                          className={`text-xs font-semibold px-2 py-1 rounded-md border focus:outline-none transition-colors ${roleDef.badgeBg} ${roleDef.badgeText} ${roleDef.badgeBorder} ${acc.username === 'admin' ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                        >
                          <option value="admin">{roleTitles?.admin || 'Admin'}</option>
                          <option value="hr_manager">{roleTitles?.hr_manager || 'HR Manager'}</option>
                          <option value="viewer">{roleTitles?.viewer || 'Viewer'}</option>
                          <option value="employee">{roleTitles?.employee || 'Employee'}</option>
                        </select>
                      </div>

                      {/* Edit Name & Profile button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(acc)}
                        className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title={`Change name & contact for ${acc.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        <span className="hidden sm:inline text-[11px]">Edit</span>
                      </button>

                      {onOpenChangePasswordForUser && (
                        <button
                          type="button"
                          onClick={() => onOpenChangePasswordForUser(acc)}
                          className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title={`Admin: Change name, password & mobile number for ${acc.name} (@${acc.username})`}
                        >
                          <Key className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden md:inline text-[11px]">Edit Creds</span>
                        </button>
                      )}

                      {acc.username !== 'admin' && acc.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete user account "${acc.name}" (@${acc.username})?`)) {
                              onDeleteUser(acc.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
