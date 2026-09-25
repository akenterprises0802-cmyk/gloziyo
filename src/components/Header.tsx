import React, { useState } from 'react';
import { 
  Building2, 
  UserPlus, 
  FileSpreadsheet, 
  FileText, 
  LogOut, 
  Search, 
  X,
  RotateCcw,
  Shield,
  Lock,
  ChevronDown,
  UserCheck,
  Eye,
  Users,
  Key,
  ShieldAlert,
  Scale,
  ClipboardList,
  ClipboardCheck,
  Database,
  Globe
} from 'lucide-react';
import { AuthUser, RolePermissions, UserRole, ActiveView } from '../types';
import { ROLE_DEFINITIONS } from '../utils/authPermissions';

interface HeaderProps {
  currentUser: AuthUser;
  permissions: RolePermissions;
  roleTitles?: Record<UserRole, string>;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  formCCount?: number;
  formDCount?: number;
  onLogout: () => void;
  onSwitchRole: (newRole: UserRole) => void;
  onOpenAddModal: () => void;
  onOpenUserManagement?: () => void;
  onOpenChangePassword: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onResetData: () => void;
  totalEmployees: number;
  onOpenDatabaseStatus?: () => void;
  dbConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  permissions,
  roleTitles,
  activeView,
  onViewChange,
  formCCount = 0,
  formDCount = 0,
  onLogout,
  onSwitchRole,
  onOpenAddModal,
  onOpenUserManagement,
  onOpenChangePassword,
  onExportExcel,
  onExportPDF,
  searchTerm,
  onSearchChange,
  onResetData,
  totalEmployees,
  onOpenDatabaseStatus,
  dbConnected,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const currentRoleDef = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.viewer;
  const currentRoleDisplayName = roleTitles?.[currentUser.role] || currentRoleDef.name;
  const currentRoleDisplayLabel = roleTitles?.[currentUser.role] || currentRoleDef.label;

  const renderRoleDropdownContent = () => (
    <div className="w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-900 z-50 animate-in fade-in zoom-in-95 duration-100">
      <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Switch Active Role
        </div>
        <div className="text-xs font-medium text-slate-700 truncate">
          {currentUser.name} (@{currentUser.username})
        </div>
      </div>

      <div className="space-y-1">
        {(['admin', 'hr_manager', 'viewer', 'employee'] as UserRole[]).map((r) => {
          const def = ROLE_DEFINITIONS[r];
          const isCurrent = currentUser.role === r;
          const roleName = roleTitles?.[r] || def.name;

          // Check if this option is disabled based on current logged in user:
          // When Viewer is logged in: Admin and HR Manager options are disabled
          // When Employee is logged in: Admin and HR Manager options are disabled
          // When HR Manager is logged in: Admin option is disabled
          const isRoleDisabled = 
            (currentUser.role === 'viewer' && (r === 'admin' || r === 'hr_manager')) ||
            (currentUser.role === 'employee' && (r === 'admin' || r === 'hr_manager')) ||
            (currentUser.role === 'hr_manager' && r === 'admin');

          if (isRoleDisabled) {
            const disabledReason = 
              currentUser.role === 'viewer'
                ? `${roleName} option is disabled for Viewer`
                : currentUser.role === 'employee'
                ? `${roleName} option disabled for Employee`
                : `Admin access disabled for HR Manager`;

            return (
              <div
                key={r}
                id={`btnRoleOption-${r}-disabled`}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between bg-slate-50 border border-slate-200/80 opacity-60 cursor-not-allowed select-none transition-all"
                title={disabledReason}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {r === 'admin' && <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  {r === 'hr_manager' && <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <span>{roleName}</span>
                      <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Disabled
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal truncate">
                      {disabledReason}
                    </div>
                  </div>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </div>
            );
          }

          return (
            <button
              key={r}
              type="button"
              id={`btnRoleOption-${r}`}
              onClick={() => {
                onSwitchRole(r);
                setIsRoleDropdownOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-slate-100 font-bold text-slate-900'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {r === 'admin' && <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                {r === 'hr_manager' && <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                {r === 'viewer' && <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                {r === 'employee' && <UserPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                <div>
                  <div className="font-semibold text-slate-800">{roleName}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {r === 'admin' && 'Add, Edit, Delete'}
                    {r === 'hr_manager' && 'Add & Edit only'}
                    {r === 'viewer' && 'Read-only view'}
                    {r === 'employee' && 'Add employee only'}
                  </div>
                </div>
              </div>
              {isCurrent && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Account Security Option */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        {currentUser.role === 'admin' ? (
          <button
            type="button"
            id="btnDropdownChangePassword"
            onClick={() => {
              setIsRoleDropdownOpen(false);
              onOpenChangePassword();
            }}
            className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Admin: Change Password & Mobile</span>
          </button>
        ) : (
          <div className="px-2.5 py-1.5 text-[11px] text-slate-400 flex items-center gap-1.5 leading-tight">
            <ShieldAlert className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Password & mobile managed by Admin</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between py-3 gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Employee Management System</span>
                  {currentUser.role !== 'employee' ? (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {totalEmployees} records
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Add Employee Only
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Statutory Register • ESIC • PF • Banking • Specimen Signatures
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={onOpenChangePassword}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Admin: Change Password & Mobile Number"
                >
                  <Key className="w-4 h-4 text-emerald-400" />
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  id="btnRoleDropdownMobile"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 ${currentRoleDef.badgeBg} ${currentRoleDef.badgeText} ${currentRoleDef.badgeBorder}`}
                >
                  <span>{currentRoleDisplayLabel}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isRoleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsRoleDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 z-50">
                      {renderRoleDropdownContent()}
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar or Employee Role Status */}
          <div className="flex-1 max-w-md mx-0 md:mx-4">
            {currentUser.role !== 'employee' ? (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  id="mainSearchInput"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search by Code, Name, UAN, ESIC, Aadhar..."
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    id="btnClearSearch"
                    onClick={() => onSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 py-2 px-3.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Employee Role: Authorized to Add Employee Details Only</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 justify-end">
            
            {/* Add Employee Button (Permission restricted) */}
            {permissions.canAdd ? (
              <button
                type="button"
                id="btnAddNewEmployee"
                onClick={onOpenAddModal}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                title="Add new employee record"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            ) : (
              <div 
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center gap-1.5 cursor-not-allowed opacity-80"
                title="Add restricted: Viewers have read-only access"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Add (Locked)</span>
              </div>
            )}

            {/* Export Excel */}
            {permissions.canExport && (
              <button
                type="button"
                id="btnExportExcelTop"
                onClick={onExportExcel}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Export all records to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            )}

            {/* Export PDF */}
            {permissions.canExport && (
              <button
                type="button"
                id="btnExportPDFTop"
                onClick={onExportPDF}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Export master register to PDF"
              >
                <FileText className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}

            {/* FORM C Direct Access Button for Administrator */}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                id="btnOpenFormCTop"
                onClick={() => onViewChange(activeView === 'form_c' ? 'employees' : 'form_c')}
                className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'form_c'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 border-indigo-700/60'
                }`}
                title="Page: FORM C - Register of Recovery / Damage / Loss / Fines (GLOZIYO SERVICES PVT LTD)"
              >
                <Scale className="w-4 h-4 text-indigo-300" />
                <span>FORM C</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/40 text-white font-mono font-bold">
                  {formCCount}
                </span>
              </button>
            )}

            {/* FORM D Direct Access Button for Administrator */}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                id="btnOpenFormDTop"
                onClick={() => onViewChange(activeView === 'form_d' ? 'employees' : 'form_d')}
                className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'form_d'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-blue-950/70 hover:bg-blue-900/90 text-blue-200 border-blue-700/60'
                }`}
                title="Page: FORM D - Muster Roll & Attendance Register (GLOZIYO SERVICES PVT LTD)"
              >
                <ClipboardCheck className="w-4 h-4 text-blue-300" />
                <span>FORM D</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/40 text-white font-mono font-bold">
                  {formDCount}
                </span>
              </button>
            )}

            {/* Database Status Button */}
            {onOpenDatabaseStatus && (
              <button
                type="button"
                id="btnOpenDatabaseStatus"
                onClick={onOpenDatabaseStatus}
                className={`px-2.5 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dbConnected
                    ? 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border-emerald-800/80'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Hostinger MySQL Database Integration (gloziyofire.com)"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">
                  {dbConnected ? 'Hostinger (Connected)' : 'Host on gloziyoemp.org'}
                </span>
                <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-400'}`} />
              </button>
            )}

            {/* Admin User Management Button */}
            {permissions.canManageUsers && onOpenUserManagement && (
              <button
                type="button"
                id="btnOpenUserManagement"
                onClick={onOpenUserManagement}
                className="px-2.5 py-2 text-xs font-medium rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Manage user logins & role permissions"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span className="hidden lg:inline">Manage Roles</span>
              </button>
            )}

            {/* Reset Data (Admin only) */}
            {permissions.canResetData && (
              <button
                type="button"
                id="btnResetData"
                onClick={onResetData}
                className="p-2 text-xs rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
                title="Reset to sample dataset (Admin only)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* User Profile & Role Switcher */}
            <div className="hidden md:flex items-center pl-2 border-l border-slate-700 gap-2 relative">
              <div className="relative">
                <button
                  type="button"
                  id="btnRoleDropdown"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${currentRoleDef.badgeBg} ${currentRoleDef.badgeText} ${currentRoleDef.badgeBorder} shadow-2xs hover:opacity-90`}
                  title="Switch current testing role"
                >
                  {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-purple-600" />}
                  {currentUser.role === 'hr_manager' && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                  {currentUser.role === 'viewer' && <Eye className="w-3.5 h-3.5 text-slate-600" />}
                  {currentUser.role === 'employee' && <UserPlus className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{currentRoleDisplayLabel}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {/* Dropdown Menu for Switching Roles */}
                {isRoleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsRoleDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 z-50">
                      {renderRoleDropdownContent()}
                    </div>
                  </>
                )}
              </div>

              {/* Quick Change Password Button (Admin Only) */}
              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  id="btnHeaderChangePasswordDesktop"
                  onClick={onOpenChangePassword}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Admin: Change Password & Mobile Number"
                >
                  <Key className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                id="btnHeaderLogoutDesktop"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Sign out of system"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Statutory Register Switcher Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800/90 pt-2.5 pb-2 overflow-x-auto text-xs">
          <button
            type="button"
            id="tabNavEmployees"
            onClick={() => onViewChange('employees')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'employees'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{currentUser.role === 'employee' ? 'Employee Intake Portal' : 'Employee Master Register'}</span>
            {currentUser.role !== 'employee' && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeView === 'employees' ? 'bg-black/20 text-emerald-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {totalEmployees}
              </span>
            )}
          </button>

          {/* FORM C Navigation Tab (Hidden for Employee role) */}
          {currentUser.role !== 'employee' && (
            <button
              type="button"
              id="tabNavFormC"
              onClick={() => onViewChange('form_c')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'form_c'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-indigo-300" />
              <span>FORM C (GLOZIYO SERVICES PVT LTD)</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeView === 'form_c' ? 'bg-black/20 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {formCCount}
              </span>
              {currentUser.role === 'admin' ? (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 uppercase tracking-wider">
                  Admin Page
                </span>
              ) : (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Statutory
                </span>
              )}
            </button>
          )}

          {/* FORM D Navigation Tab (Hidden for Employee role) */}
          {currentUser.role !== 'employee' && (
            <button
              type="button"
              id="tabNavFormD"
              onClick={() => onViewChange('form_d')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'form_d'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>FORM D (GLOZIYO SERVICES PVT LTD)</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeView === 'form_d' ? 'bg-black/20 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {formDCount}
              </span>
              {currentUser.role === 'admin' ? (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 uppercase tracking-wider">
                  Admin Page
                </span>
              ) : (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Statutory
                </span>
              )}
            </button>
          )}

          {/* Employee Role Notice Banner */}
          {currentUser.role === 'employee' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Employee Role: Add Employee Details Only (Form C & Form D Removed)</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
