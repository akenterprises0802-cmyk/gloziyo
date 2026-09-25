import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, Building2, Shield, Eye, EyeOff, UserCheck, UserPlus } from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { getStoredAccounts, getStoredRoleTitles, ROLE_DEFINITIONS } from '../utils/authPermissions';

interface LoginFormProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const accounts = getStoredAccounts();
  const roleTitles = getStoredRoleTitles();

  const handlePresetSelect = (presetRole: UserRole) => {
    const acc = accounts.find((a) => a.role === presetRole);
    if (acc) {
      setUsername(acc.username);
      setPassword(acc.password);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both User ID and Password');
      return;
    }

    const trimmedUser = username.trim().toLowerCase();
    const found = accounts.find(
      (a) => a.username.toLowerCase() === trimmedUser && a.password === password.trim()
    );

    if (found) {
      setError('');
      const authUser: AuthUser = {
        id: found.id,
        username: found.username,
        name: found.name,
        role: found.role,
        email: found.email,
        lastLogin: new Date().toISOString(),
      };
      onLogin(authUser);
    } else {
      setError('Invalid username or password. Check role presets below.');
    }
  };

  const handleDirectDemoLogin = (presetRole: UserRole) => {
    const acc = accounts.find((a) => a.role === presetRole);
    if (acc) {
      onLogin({
        id: acc.id,
        username: acc.username,
        name: acc.name,
        role: acc.role,
        email: acc.email,
        lastLogin: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Branding */}
        <div className="bg-slate-900 text-white px-8 py-7 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 mb-3 shadow-inner">
            <Building2 className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Employee Management System</h1>
          <p className="text-slate-400 text-xs mt-1">Role-Based Access Control • Statutory Compliance</p>
        </div>

        {/* Form Body */}
        <div className="p-7">
          
          {/* Preset Role Quick Selectors */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Role to Test Login
              </span>
              <span className="text-[11px] text-slate-400">Click any card to load</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['admin', 'hr_manager', 'viewer', 'employee'] as UserRole[]).map((r) => {
                const def = ROLE_DEFINITIONS[r];
                const expectedUsername = r === 'admin' ? 'admin' : r === 'hr_manager' ? 'hrmanager' : r === 'viewer' ? 'viewer' : 'employee';
                const isSelected = username.toLowerCase() === expectedUsername.toLowerCase();
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handlePresetSelect(r)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {r === 'admin' && <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                        {r === 'hr_manager' && <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        {r === 'viewer' && <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                        {r === 'employee' && <UserPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        <span className="text-xs font-bold text-slate-800 leading-tight truncate">
                          {roleTitles?.[r] || def.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                        {r === 'admin' && 'Full edit & delete'}
                        {r === 'hr_manager' && 'Add & edit only'}
                        {r === 'viewer' && 'View & export only'}
                        {r === 'employee' && 'Add employee only'}
                      </p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>@{expectedUsername}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form id="loginForm" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <span className="font-semibold">Authentication Error:</span> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="loginUser">
                User ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="loginUser"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / hrmanager / viewer / employee"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="loginPass">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="loginPass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btnLoginSubmit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Sign In as {username || 'User'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick 1-Click Launch Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-center mb-2">
              <span className="text-[11px] text-slate-400">Or instant 1-click test sign-in:</span>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleDirectDemoLogin('admin')}
                className="text-xs px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-medium transition-colors"
              >
                Launch {roleTitles?.admin || 'Admin'}
              </button>
              <button
                type="button"
                onClick={() => handleDirectDemoLogin('hr_manager')}
                className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-medium transition-colors"
              >
                Launch {roleTitles?.hr_manager || 'HR Manager'}
              </button>
              <button
                type="button"
                onClick={() => handleDirectDemoLogin('viewer')}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 font-medium transition-colors"
              >
                Launch {roleTitles?.viewer || 'Viewer'}
              </button>
              <button
                type="button"
                onClick={() => handleDirectDemoLogin('employee')}
                className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-medium transition-colors"
              >
                Launch {roleTitles?.employee || 'Employee'}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Restricted edit & delete capabilities enforced per role</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
