import React, { useState, useEffect, useMemo } from 'react';
import { Employee, TabType, AuthUser, UserRole, UserAccount, ActiveView, FormCRecord, FormDRecord } from './types';
import { INITIAL_EMPLOYEES } from './data/initialEmployees';
import { INITIAL_FORM_C_RECORDS } from './data/initialFormC';
import { generateInitialFormDList } from './data/initialFormD';
import { exportToExcel, exportTablePDF } from './utils/exportUtils';
import { 
  getStoredAccounts, 
  saveStoredAccounts, 
  getStoredRoleTitles,
  saveStoredRoleTitles,
  getPermissions, 
  ROLE_DEFINITIONS 
} from './utils/authPermissions';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { EmployeeTable } from './components/EmployeeTable';
import { FormCPage } from './components/FormCPage';
import { FormDPage } from './components/FormDPage';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { UserManagementModal } from './components/UserManagementModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { EmployeeIntakePortal } from './components/EmployeeIntakePortal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { fetchDbStatus, saveRemoteEmployee, deleteRemoteEmployee, fetchRemoteEmployees } from './utils/dbSync';
import { CheckCircle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'ems_employee_records_v1';
const AUTH_KEY = 'ems_auth_user_v2';
const FORM_C_STORAGE_KEY = 'ems_form_c_records_v1';
const FORM_D_STORAGE_KEY = 'ems_form_d_records_v1';

export default function App() {
  // Accounts State
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    return getStoredAccounts();
  });

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Employee Dataset
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_EMPLOYEES;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeView, setActiveView] = useState<ActiveView>('employees');

  // Statutory FORM C Dataset
  const [formCRecords, setFormCRecords] = useState<FormCRecord[]>(() => {
    try {
      const saved = localStorage.getItem(FORM_C_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_FORM_C_RECORDS;
  });

  // Statutory FORM D (Muster Roll / Attendance Sheet) Dataset
  const [formDRecords, setFormDRecords] = useState<FormDRecord[]>(() => {
    try {
      const saved = localStorage.getItem(FORM_D_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return generateInitialFormDList(INITIAL_EMPLOYEES, 'September', 2024);
  });

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // Change Password Modal state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<AuthUser | UserAccount | null>(null);

  // Role titles configuration state
  const [roleTitles, setRoleTitles] = useState<Record<UserRole, string>>(() => getStoredRoleTitles());

  // Track employees added in current session (useful for Employee intake portal feedback)
  const [sessionAddedEmployees, setSessionAddedEmployees] = useState<Employee[]>([]);

  // Hostinger MySQL Database status & modal
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Probe MySQL status on mount
  useEffect(() => {
    fetchDbStatus().then((status) => {
      setIsDbConnected(status.connected);
      if (status.connected) {
        fetchRemoteEmployees().then((remoteList) => {
          if (remoteList && remoteList.length > 0) {
            setEmployees(remoteList);
          }
        });
      }
    });
  }, []);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    saveStoredAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveStoredRoleTitles(roleTitles);
  }, [roleTitles]);

  useEffect(() => {
    localStorage.setItem(FORM_C_STORAGE_KEY, JSON.stringify(formCRecords));
  }, [formCRecords]);

  useEffect(() => {
    localStorage.setItem(FORM_D_STORAGE_KEY, JSON.stringify(formDRecords));
  }, [formDRecords]);

  // Guard activeView: Employee role cannot access Form C or Form D
  useEffect(() => {
    if (currentUser?.role === 'employee' && activeView !== 'employees') {
      setActiveView('employees');
    }
  }, [currentUser?.role, activeView]);

  // Derived permissions
  const permissions = useMemo(() => {
    if (!currentUser) {
      return getPermissions('viewer');
    }
    return getPermissions(currentUser.role);
  }, [currentUser]);

  // Handle Login
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    const roleDef = ROLE_DEFINITIONS[user.role];
    const roleName = roleTitles[user.role] || roleDef.name;
    showToast(`Logged in as ${user.name} (${roleName})`);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
    showToast('Signed out successfully', 'info');
  };

  // Role Switcher with strict security restrictions:
  // - When Viewer is logged in: Admin and HR Manager options are disabled
  // - When Employee is logged in: Admin and HR Manager options are disabled
  // - When HR Manager is logged in: Admin option is disabled
  const handleSwitchRole = (newRole: UserRole) => {
    if (!currentUser) return;

    if (currentUser.role === 'viewer' && (newRole === 'admin' || newRole === 'hr_manager')) {
      const targetRoleName = roleTitles[newRole] || ROLE_DEFINITIONS[newRole].name;
      showToast(`${targetRoleName} option is disabled for Viewer.`, 'error');
      return;
    }

    if (currentUser.role === 'employee' && (newRole === 'admin' || newRole === 'hr_manager' || newRole === 'viewer')) {
      const targetRoleName = roleTitles[newRole] || ROLE_DEFINITIONS[newRole].name;
      showToast(`${targetRoleName} option is disabled for Employee role.`, 'error');
      return;
    }

    if (currentUser.role === 'hr_manager' && newRole === 'admin') {
      showToast('Admin option is disabled for HR Manager.', 'error');
      return;
    }

    const matchingAcc = accounts.find(a => a.role === newRole);
    const updatedUser: AuthUser = {
      id: matchingAcc ? matchingAcc.id : currentUser.id,
      username: matchingAcc ? matchingAcc.username : currentUser.username,
      name: matchingAcc ? matchingAcc.name : currentUser.name,
      role: newRole,
      email: matchingAcc ? matchingAcc.email : currentUser.email,
      mobile: matchingAcc?.mobile || currentUser.mobile,
      lastLogin: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    const roleDef = ROLE_DEFINITIONS[newRole];
    const roleName = roleTitles[newRole] || roleDef.name;
    showToast(`Switched active role to: ${roleName}`);
  };

  // User Management Handlers (Admin only)
  const handleUpdateRoleTitles = (newTitles: Record<UserRole, string>) => {
    if (currentUser?.role !== 'admin') {
      showToast('Access denied: Only Administrators can customize role names.', 'error');
      return;
    }
    setRoleTitles(newTitles);
    saveStoredRoleTitles(newTitles);
    showToast('Role display names updated successfully!');
  };

  const handleUpdateUserDetails = (
    userId: string,
    data: { name: string; mobile: string; email?: string }
  ): { success: boolean; message?: string } => {
    if (currentUser?.role !== 'admin') {
      showToast('Access denied: Only Administrators can edit user accounts.', 'error');
      return { success: false, message: 'Only Administrators can edit user accounts.' };
    }
    if (!data.name.trim()) {
      return { success: false, message: 'Name cannot be empty.' };
    }
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === userId
          ? {
              ...a,
              name: data.name.trim(),
              mobile: data.mobile.trim(),
              email: data.email?.trim() || a.email,
            }
          : a
      )
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          name: data.name.trim(),
          mobile: data.mobile.trim(),
          email: data.email?.trim() || prev.email,
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
        return updated;
      });
    }
    showToast(`Updated user account for ${data.name.trim()}`);
    return { success: true };
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setAccounts(prev => {
      const updated = prev.map(a => a.id === userId ? { ...a, role: newRole } : a);
      return updated;
    });

    // If current logged-in user role was changed, update current user too
    if (currentUser && currentUser.id === userId) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    }
    showToast('User role updated successfully');
  };

  const handleAddUser = (accountData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const exists = accounts.some(a => a.username.toLowerCase() === accountData.username.toLowerCase());
    if (exists) {
      return { success: false, message: `Username "${accountData.username}" is already taken.` };
    }

    const newAcc: UserAccount = {
      ...accountData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAccounts(prev => [...prev, newAcc]);
    showToast(`Created new account for ${newAcc.name} (${newAcc.role})`);
    return { success: true };
  };

  const handleDeleteUser = (userId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== userId));
    showToast('User account removed', 'info');
  };

  // Open Change Password for Current Logged-in User (Admin only)
  const handleOpenChangePasswordSelf = () => {
    if (!currentUser) return;
    if (currentUser.role !== 'admin') {
      showToast('Access denied: Only Administrators can update user credentials.', 'error');
      return;
    }
    setPasswordTargetUser(currentUser);
    setIsChangePasswordOpen(true);
  };

  // Open Change / Reset Password, Mobile & Name for a specific account (Admin only)
  const handleOpenChangePasswordForUser = (targetAcc: UserAccount) => {
    if (currentUser?.role !== 'admin') {
      showToast('Access denied: Only Administrators can update user credentials.', 'error');
      return;
    }
    setPasswordTargetUser(targetAcc);
    setIsChangePasswordOpen(true);
  };

  // Process Admin Name, Password & Mobile Update
  const handleUpdateUserCredentials = (
    userId: string,
    data: { name?: string; newPassword?: string; mobile?: string }
  ): { success: boolean; message?: string } => {
    if (currentUser?.role !== 'admin') {
      showToast('Access denied: Only Administrators can modify names, passwords or mobile numbers.', 'error');
      return { success: false, message: 'Only Administrators have permission to modify names, passwords or mobile numbers.' };
    }

    const userAcc = accounts.find((a) => a.id === userId);
    if (!userAcc) {
      return { success: false, message: 'Account not found in system.' };
    }

    if (data.newPassword && data.newPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    setAccounts((prev) => {
      const updated = prev.map((a) => {
        if (a.id === userId) {
          return {
            ...a,
            ...(data.name ? { name: data.name.trim() } : {}),
            ...(data.mobile ? { mobile: data.mobile.trim() } : {}),
            ...(data.newPassword ? { password: data.newPassword } : {}),
          };
        }
        return a;
      });
      return updated;
    });

    if (currentUser.id === userId) {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          ...(data.name ? { name: data.name.trim() } : {}),
          ...(data.mobile ? { mobile: data.mobile.trim() } : {}),
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
        return updated;
      });
    }

    const updatedParts: string[] = [];
    if (data.name) updatedParts.push('name');
    if (data.newPassword) updatedParts.push('password');
    if (data.mobile) updatedParts.push('mobile number');

    const finalName = data.name?.trim() || userAcc.name;
    showToast(`Admin updated ${updatedParts.join(' and ') || 'credentials'} for ${finalName} (@${userAcc.username})`);
    return { success: true };
  };

  // Reset to initial sample data (Admin only)
  const handleResetData = () => {
    if (!permissions.canResetData) {
      showToast('Access denied: Only Administrators can reset the database.', 'error');
      return;
    }

    if (window.confirm('Reset all employee records to the default sample dataset?')) {
      setEmployees(INITIAL_EMPLOYEES);
      showToast('Reset to default sample data', 'info');
    }
  };

  // Save / Update Employee with role verification
  const handleSaveEmployee = (savedEmp: Employee) => {
    const existsIndex = employees.findIndex((e) => e.id === savedEmp.id);
    const isNew = existsIndex < 0;

    if (currentUser?.role === 'employee' && !isNew) {
      showToast('Access denied: Employee role can only add new employee details.', 'error');
      return;
    }

    if (isNew && !permissions.canAdd) {
      showToast('Access denied: Your role does not have permission to add employees.', 'error');
      return;
    }

    if (!isNew && !permissions.canEdit) {
      showToast('Access denied: Your role does not have permission to edit records.', 'error');
      return;
    }

    setEmployees((prev) => {
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedEmp;
        showToast(`Updated record for ${savedEmp.name} ${savedEmp.surname} (${savedEmp.empCode})`);
        return updated;
      } else {
        showToast(`Added new employee: ${savedEmp.name} ${savedEmp.surname} (${savedEmp.empCode})`);
        setSessionAddedEmployees((s) => [savedEmp, ...s]);
        return [savedEmp, ...prev];
      }
    });

    setIsFormModalOpen(false);
    setEmployeeToEdit(null);

    // Sync to Hostinger MySQL in background
    saveRemoteEmployee(savedEmp).then((ok) => {
      if (ok) setIsDbConnected(true);
    });

    if (selectedEmployee && selectedEmployee.id === savedEmp.id) {
      setSelectedEmployee(savedEmp);
    }
  };

  // Open Edit with permission check
  const handleOpenEdit = (emp: Employee) => {
    if (currentUser?.role === 'employee') {
      showToast('Access restricted: Employee role can only add employee details.', 'error');
      return;
    }
    if (!permissions.canEdit) {
      showToast('Access denied: Viewers cannot edit records.', 'error');
      return;
    }
    setEmployeeToEdit(emp);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  // Open View Details
  const handleOpenView = (emp: Employee) => {
    if (currentUser?.role === 'employee' || !permissions.canViewDetails) {
      showToast('Access restricted: Employee role cannot see employee details.', 'error');
      return;
    }
    setSelectedEmployee(emp);
    setIsDetailModalOpen(true);
  };

  // Trigger Delete with permission check
  const handlePromptDelete = (emp: Employee) => {
    if (currentUser?.role === 'employee') {
      showToast('Access restricted: Employee role can only add employee details.', 'error');
      return;
    }
    if (!permissions.canDelete) {
      showToast('Access denied: Only Administrators have permission to delete records.', 'error');
      return;
    }
    setEmployeeToDelete(emp);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete with permission check
  const handleConfirmDelete = () => {
    if (!permissions.canDelete) {
      showToast('Access denied: Only Administrators can delete records.', 'error');
      setIsDeleteModalOpen(false);
      return;
    }
    if (!employeeToDelete) return;
    const deletedId = employeeToDelete.id;
    setEmployees((prev) => prev.filter((e) => e.id !== deletedId));
    deleteRemoteEmployee(deletedId);
    showToast(`Permanently deleted employee ${employeeToDelete.empCode}`, 'info');
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
    if (selectedEmployee && selectedEmployee.id === employeeToDelete.id) {
      setIsDetailModalOpen(false);
      setSelectedEmployee(null);
    }
  };

  // Exports
  const handleExportExcel = () => {
    try {
      exportToExcel(employees);
      showToast(`Exported ${employees.length} records to Excel (.xlsx)`);
    } catch {
      showToast('Failed to export Excel file', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      exportTablePDF(employees);
      showToast(`Generated PDF master register with ${employees.length} records`);
    } catch {
      showToast('Failed to generate PDF file', 'error');
    }
  };

  // Form C Handlers (Statutory Register for GLOZIYO SERVICES PRIVATE LIMITED)
  const handleAddFormCRecord = (record: FormCRecord) => {
    if (currentUser?.role !== 'admin') {
      showToast('Access restricted: Only Administrators can add Form C records.', 'error');
      return;
    }
    setFormCRecords((prev) => [record, ...prev]);
    showToast(`Added Form C recovery entry for ${record.name} (${record.empCode})`);
  };

  const handleUpdateFormCRecord = (updated: FormCRecord) => {
    if (currentUser?.role !== 'admin') {
      showToast('Access restricted: Only Administrators can edit Form C records.', 'error');
      return;
    }
    setFormCRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`Updated Form C record for ${updated.name}`);
  };

  const handleDeleteFormCRecord = (id: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Access restricted: Only Administrators can delete Form C records.', 'error');
      return;
    }
    setFormCRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('Form C recovery entry deleted.', 'info');
  };

  const handleResetFormCData = () => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Administrators can reset statutory data.', 'error');
      return;
    }
    setFormCRecords(INITIAL_FORM_C_RECORDS);
    showToast('Reset Form C register to standard sample dataset.');
  };

  // Form D Handlers (Statutory Attendance Register / Muster Roll)
  const handleUpdateFormDRecord = (updated: FormDRecord) => {
    if (currentUser?.role !== 'admin') {
      showToast('Access restricted: Only Administrators can edit Form D attendance.', 'error');
      return;
    }
    setFormDRecords((prev) => {
      const exists = prev.some((r) => r.id === updated.id);
      if (exists) {
        return prev.map((r) => (r.id === updated.id ? updated : r));
      }
      return [updated, ...prev];
    });
    showToast(`Updated Form D attendance for ${updated.name}`);
  };

  const handleUpdateAllFormDRecords = (updatedList: FormDRecord[]) => {
    if (currentUser?.role !== 'admin') {
      showToast('Access restricted: Only Administrators can update muster roll.', 'error');
      return;
    }
    setFormDRecords((prev) => {
      const updatedMap = new Map(updatedList.map((r) => [r.id, r]));
      // Keep untouched records and update modified ones
      const result = prev.map((r) => updatedMap.get(r.id) || r);
      // Add any new ones that weren't in prev
      updatedList.forEach((r) => {
        if (!prev.some((p) => p.id === r.id)) {
          result.push(r);
        }
      });
      return result;
    });
    showToast(`Updated attendance muster roll for ${updatedList.length} employees`);
  };

  const handleResetFormDData = (month: string, year: number) => {
    if (currentUser?.role !== 'admin') {
      showToast('Only Administrators can reset statutory data.', 'error');
      return;
    }
    const freshList = generateInitialFormDList(employees, month, year);
    setFormDRecords((prev) => {
      const otherMonths = prev.filter((r) => !(r.month === month && r.year === year));
      return [...otherMonths, ...freshList];
    });
    showToast(`Reset Form D attendance register for ${month} ${year}.`);
  };

  // If not authenticated, render Login Form with role selection
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-800'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-800'
                : 'bg-slate-900 text-slate-100 border-slate-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header with Role Details & Switcher */}
      <Header
        currentUser={currentUser}
        permissions={permissions}
        roleTitles={roleTitles}
        activeView={activeView}
        onViewChange={(view) => {
          if (currentUser.role === 'employee' && view !== 'employees') {
            showToast('Access restricted: Form C and Form D are removed for Employee role. You can only add employee details.', 'error');
            return;
          }
          setActiveView(view);
        }}
        formCCount={formCRecords.length}
        formDCount={formDRecords.length}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        onOpenAddModal={() => {
          if (!permissions.canAdd) {
            showToast('Access denied: Your role does not have permission to add records.', 'error');
            return;
          }
          setEmployeeToEdit(null);
          setIsFormModalOpen(true);
        }}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenChangePassword={handleOpenChangePasswordSelf}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onResetData={handleResetData}
        totalEmployees={employees.length}
        onOpenDatabaseStatus={() => setIsDbModalOpen(true)}
        dbConnected={isDbConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'form_c' && currentUser.role !== 'employee' ? (
          <FormCPage
            records={formCRecords}
            employees={employees}
            currentUser={currentUser}
            permissions={permissions}
            onAddRecord={handleAddFormCRecord}
            onUpdateRecord={handleUpdateFormCRecord}
            onDeleteRecord={handleDeleteFormCRecord}
            onResetFormCData={handleResetFormCData}
            onBackToMaster={() => setActiveView('employees')}
          />
        ) : activeView === 'form_d' && currentUser.role !== 'employee' ? (
          <FormDPage
            records={formDRecords}
            employees={employees}
            currentUser={currentUser}
            permissions={permissions}
            onUpdateRecord={handleUpdateFormDRecord}
            onUpdateAllRecords={handleUpdateAllFormDRecords}
            onResetFormDData={handleResetFormDData}
            onBackToMaster={() => setActiveView('employees')}
          />
        ) : currentUser.role === 'employee' ? (
          <EmployeeIntakePortal
            currentUser={currentUser}
            onOpenAddModal={() => {
              setEmployeeToEdit(null);
              setIsFormModalOpen(true);
            }}
            sessionAddedEmployees={sessionAddedEmployees}
          />
        ) : (
          <>
            {/* Metric / Category Cards */}
            <StatCards
              employees={employees}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Master Employee Table */}
            <EmployeeTable
              employees={employees}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onViewEmployee={handleOpenView}
              onEditEmployee={handleOpenEdit}
              onDeleteEmployee={handlePromptDelete}
              onAddNew={() => {
                if (!permissions.canAdd) {
                  showToast('Access denied: Your role does not have permission to add records.', 'error');
                  return;
                }
                setEmployeeToEdit(null);
                setIsFormModalOpen(true);
              }}
              permissions={permissions}
              currentUser={currentUser}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>Employee Management System • Statutory HR & Compliance Register • Active Session: {currentUser.name} ({currentUser.role})</p>
      </footer>

      {/* Form Modal (Add / Edit) */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEmployeeToEdit(null);
        }}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
        existingCount={employees.length}
      />

      {/* Detail Dossier Modal */}
      <EmployeeDetailModal
        isOpen={isDetailModalOpen}
        employee={selectedEmployee}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEmployee(null);
        }}
        onEdit={(emp) => handleOpenEdit(emp)}
        onDelete={(emp) => handlePromptDelete(emp)}
        permissions={permissions}
        currentUser={currentUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        employee={employeeToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setEmployeeToDelete(null);
        }}
      />

      {/* User Management Modal (Admin only) */}
      {permissions.canManageUsers && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          accounts={accounts}
          currentUserId={currentUser.id}
          roleTitles={roleTitles}
          onUpdateRoleTitles={handleUpdateRoleTitles}
          onUpdateRole={handleUpdateUserRole}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUserDetails}
          onDeleteUser={handleDeleteUser}
          onOpenChangePasswordForUser={handleOpenChangePasswordForUser}
        />
      )}

      {/* Change / Reset Password, Mobile & Name Modal (Admin Only) */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => {
          setIsChangePasswordOpen(false);
          setPasswordTargetUser(null);
        }}
        targetUser={passwordTargetUser}
        accounts={accounts}
        currentUserRole={currentUser.role}
        roleTitles={roleTitles}
        onUpdateUserCredentials={handleUpdateUserCredentials}
      />

      {/* Hostinger MySQL Database Integration Modal */}
      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        employees={employees}
      />
    </div>
  );
}
