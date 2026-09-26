import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  User, 
  Filter, 
  ArrowUpDown,
  Building2,
  Phone,
  Lock,
  Shield,
  UserCheck
} from 'lucide-react';
import { Employee, TabType, RolePermissions, AuthUser } from '../types';
import { exportSingleEmployeePDF } from '../utils/exportUtils';
import { ROLE_DEFINITIONS } from '../utils/authPermissions';

interface EmployeeTableProps {
  employees: Employee[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onViewEmployee: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (emp: Employee) => void;
  onAddNew: () => void;
  permissions: RolePermissions;
  currentUser: AuthUser;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onAddNew,
  permissions,
  currentUser,
}) => {
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Employee>('empCode');
  const [sortAsc, setSortAsc] = useState(true);

  const roleDef = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.viewer;

  // Available designations in current dataset
  const uniqueDesignations = Array.from(
    new Set(employees.map(e => e.designation).filter(Boolean))
  ).sort();

  // Filter logic
  const filteredEmployees = employees.filter((emp) => {
    // 1. Tab filter
    if (activeTab === 'skilled' && emp.category !== 'Skilled') return false;
    if (activeTab === 'semi-skilled' && emp.category !== 'Semi-Skilled') return false;
    if (activeTab === 'unskilled' && emp.category !== 'Un Skilled') return false;
    if (activeTab === 'exited' && (!emp.exitDate || !emp.exitDate.trim())) return false;

    // 2. Designation dropdown
    if (selectedDesignation !== 'all' && emp.designation !== selectedDesignation) return false;

    // 3. Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const combined = `${emp.empCode} ${emp.name} ${emp.surname} ${emp.mobile} ${emp.uan} ${emp.esic} ${emp.aadhar} ${emp.pan} ${emp.department || ''} ${emp.designation} ${emp.category} ${emp.jobLocation} ${emp.bank}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }

    return true;
  });

  // Sort logic
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const valA = (a[sortField] || '').toString().toLowerCase();
    const valB = (b[sortField] || '').toString().toLowerCase();
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      
      {/* Role permission indicator banner (if restricted) */}
      {currentUser.role === 'viewer' && (
        <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Read-Only Mode:</strong> You are logged in as <strong>{currentUser.name} (Viewer)</strong>. Adding, editing, and deleting records are restricted.
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
            Viewing & Exporting enabled
          </span>
        </div>
      )}

      {currentUser.role === 'hr_manager' && (
        <div className="px-4 py-2 bg-blue-50/70 border-b border-blue-100 text-xs text-blue-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>HR Management Mode:</strong> Logged in as <strong>{currentUser.name}</strong>. Add & Edit enabled. Permanent deletion is restricted to Administrators.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 hidden sm:inline">
            Delete Restricted
          </span>
        </div>
      )}

      {currentUser.role === 'employee' && (
        <div className="px-4 py-2.5 bg-emerald-50/95 border-b border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Employee Mode (Add Only):</strong> Logged in as <strong>{currentUser.name}</strong>. You can <strong>only add employee details</strong>. Form C, Form D, editing, deleting, and exports are removed.
            </span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
              Add Only Mode
            </span>
            <button
              type="button"
              id="btnBannerAddNewEmployee"
              onClick={onAddNew}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>+ Add Employee</span>
            </button>
          </div>
        </div>
      )}

      {currentUser.role === 'admin' && (
        <div className="px-4 py-1.5 bg-purple-50/50 border-b border-purple-100 text-[11px] text-purple-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>
              Logged in as <strong>{currentUser.name} (Administrator)</strong> • Full Edit, Delete & User Management privileges active.
            </span>
          </div>
        </div>
      )}

      {/* Table Toolbar / Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'skilled', 'semi-skilled', 'unskilled', 'exited'] as TabType[]).map((tab) => {
            const labels: Record<TabType, string> = {
              all: 'All Employees',
              skilled: 'Skilled',
              'semi-skilled': 'Semi-Skilled',
              unskilled: 'Un-Skilled',
              exited: 'Exited'
            };
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Filter by Designation & Count */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="all">All Designations</option>
              {uniqueDesignations.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-medium text-slate-500 pl-2 border-l border-slate-200">
            Showing <strong className="text-slate-800">{sortedEmployees.length}</strong> of {employees.length}
          </span>
        </div>

      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-3 w-12 text-center">Photo</th>
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                onClick={() => handleSort('empCode')}
              >
                <div className="flex items-center gap-1">
                  <span>Code & Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                onClick={() => handleSort('designation')}
              >
                <div className="flex items-center gap-1">
                  <span>Designation & Category</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">Statutory (UAN / ESIC / Aadhaar)</th>
              <th className="py-3 px-3">Contact & Location</th>
              <th className="py-3 px-3">Bank & A/C</th>
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors text-center"
                onClick={() => handleSort('exitDate')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-600">
            {sortedEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <User className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No employee records found</p>
                    <p className="text-xs text-slate-400">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No records currently listed in this category.'}
                    </p>
                    {permissions.canAdd ? (
                      <button
                        type="button"
                        onClick={onAddNew}
                        className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        + Add Employee
                      </button>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        (Contact an Administrator or HR Manager to add records)
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedEmployees.map((emp) => {
                const isExited = Boolean(emp.exitDate && emp.exitDate.trim());
                return (
                  <tr 
                    key={emp.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-default"
                  >
                    {/* Photo thumbnail */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="w-9 h-11 mx-auto rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-2xs">
                        {emp.photo ? (
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>

                    {/* Emp Code & Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {emp.empCode}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {emp.name} {emp.surname}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          DOJ: {emp.doj || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Designation & Category */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-slate-800">
                            {emp.designation}
                          </span>
                          {emp.department && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded font-medium">
                              {emp.department}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              emp.category === 'Skilled'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : emp.category === 'Semi-Skilled'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {emp.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {emp.employmentType || 'Permanent'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Statutory compliance numbers */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-400">UAN: </span>
                          <span className="font-medium text-slate-700">{emp.uan || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">ESIC: </span>
                          <span className="font-medium text-slate-700">{emp.esic || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">PAN: </span>
                          <span className="font-medium text-slate-700">{emp.pan || '—'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Location */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{emp.mobile || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{emp.jobLocation || 'Main Plant'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Banking */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col text-[11px]">
                        <span className="font-medium text-slate-800">{emp.bank || '—'}</span>
                        <span className="font-mono text-slate-500">{emp.bankAccount || '—'}</span>
                        <span className="font-mono text-[10px] text-slate-400">{emp.ifsc || ''}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      {isExited ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Exited
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 font-mono">{emp.exitDate}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Action (Restricted based on role) */}
                        {permissions.canViewDetails && currentUser.role !== 'employee' ? (
                          <button
                            type="button"
                            onClick={() => onViewEmployee(emp)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="View complete record & signature"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span 
                            className="p-1.5 text-slate-300 cursor-not-allowed inline-flex items-center" 
                            title="View restricted: Employee role cannot see employee details"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-300" />
                          </span>
                        )}

                        {/* Edit Action (Restricted based on role) */}
                        {permissions.canEdit ? (
                          <button
                            type="button"
                            onClick={() => onEditEmployee(emp)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Edit employee record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        ) : (
                          <span 
                            className="p-1.5 text-slate-300 cursor-not-allowed inline-flex items-center" 
                            title={currentUser.role === 'employee' ? 'Editing restricted: Employee role can only add new employee details' : 'Editing restricted: Viewers cannot modify employee records'}
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-300" />
                          </span>
                        )}

                        {/* PDF Export (Restricted based on role) */}
                        {permissions.canExport ? (
                          <button
                            type="button"
                            onClick={() => exportSingleEmployeePDF(emp)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Export single dossier PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        ) : (
                          <span 
                            className="p-1.5 text-slate-200 cursor-not-allowed inline-flex items-center" 
                            title="Export restricted: Employee role can add records only"
                          >
                            <FileText className="w-4 h-4 text-slate-200 opacity-40" />
                          </span>
                        )}

                        {/* Delete Action (Restricted based on role) */}
                        {permissions.canDelete ? (
                          <button
                            type="button"
                            onClick={() => onDeleteEmployee(emp)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete employee record (Admin only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span 
                            className="p-1.5 text-slate-200 cursor-not-allowed inline-flex items-center" 
                            title={currentUser.role === 'employee' ? 'Deletion restricted: Employee role can only add employee details' : 'Deletion restricted: Only Administrators can delete employee records'}
                          >
                            <Trash2 className="w-4 h-4 text-slate-200 opacity-50" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
