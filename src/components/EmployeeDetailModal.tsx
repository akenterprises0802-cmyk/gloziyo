import React from 'react';
import { 
  X, 
  FileText, 
  Edit3, 
  Trash2, 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  Briefcase, 
  Calendar, 
  Award,
  Building,
  Lock,
  Eye
} from 'lucide-react';
import { Employee, RolePermissions, AuthUser } from '../types';
import { exportSingleEmployeePDF } from '../utils/exportUtils';
import { ROLE_DEFINITIONS } from '../utils/authPermissions';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  permissions: RolePermissions;
  currentUser: AuthUser;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  permissions,
  currentUser,
}) => {
  if (!isOpen || !employee || currentUser.role === 'employee' || !permissions.canViewDetails) return null;

  const isExited = Boolean(employee.exitDate && employee.exitDate.trim());
  const roleDef = ROLE_DEFINITIONS[currentUser.role] || ROLE_DEFINITIONS.viewer;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-mono text-sm font-bold">
              {employee.empCode.replace('EMP-', '')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {employee.name} {employee.surname}
                </h2>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isExited
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isExited ? `Exited (${employee.exitDate})` : 'Active in Service'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {employee.empCode} • {employee.designation} ({employee.category})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canExport && (
              <button
                type="button"
                id="btnExportSinglePdf"
                onClick={() => exportSingleEmployeePDF(employee)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                title="Download official PDF dossier"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">PDF Dossier</span>
              </button>
            )}
            <button
              type="button"
              id="btnCloseDetailModal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Profile Card with Photo */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Passport Photo */}
            <div className="w-28 h-36 rounded-lg bg-white border border-slate-300 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
              {employee.photo ? (
                <img
                  src={employee.photo}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                  <User className="w-10 h-10 text-slate-300 mb-1" />
                  <span className="text-[10px] text-slate-400">Photo N/A</span>
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {employee.designation}
                </span>
                {employee.department && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    Dept: {employee.department}
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {employee.category}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {employee.employmentType}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Edu: {employee.education}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 mt-3">
                <div>
                  <span className="font-semibold text-slate-800">Father/Spouse: </span>
                  <span>{employee.guardian || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Date of Birth: </span>
                  <span>{employee.dob || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Gender / Nat: </span>
                  <span>{employee.gender} • {employee.nationality || 'Indian'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Date of Joining: </span>
                  <span>{employee.doj}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Department: </span>
                  <span>{employee.department || 'Engineering'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Work Location: </span>
                  <span>{employee.jobLocation || 'Main Plant'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Service Book No: </span>
                  <span>{employee.serviceBook || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Numbers Grid */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Statutory Compliance Numbers</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">UAN (PF)</span>
                <span className="font-mono font-bold text-slate-800">{employee.uan || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">ESIC IP No</span>
                <span className="font-mono font-bold text-slate-800">{employee.esic || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Aadhaar UID</span>
                <span className="font-mono font-bold text-slate-800">{employee.aadhar || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">PAN Card</span>
                <span className="font-mono font-bold text-slate-800">{employee.pan || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Banking & Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Banking */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Bank Account Details</span>
              </h3>
              <div className="text-xs space-y-1 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">Bank Name: </span>
                  <span>{employee.bank || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Account No: </span>
                  <span className="font-mono font-bold text-slate-900">{employee.bankAccount || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">IFSC Code: </span>
                  <span className="font-mono">{employee.ifsc || '—'}</span>
                </div>
              </div>
            </div>

            {/* Contact & ID */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Contact & Identity Mark</span>
              </h3>
              <div className="text-xs space-y-1 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">Mobile Phone: </span>
                  <span className="font-medium text-slate-900">{employee.mobile || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Identification Mark: </span>
                  <span>{employee.identification || 'None recorded'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Remarks: </span>
                  <span>{employee.remarks || 'Regular master record'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Present Address</span>
              <p className="text-xs text-slate-700 leading-relaxed">{employee.presentAddress || '—'}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Permanent Address</span>
              <p className="text-xs text-slate-700 leading-relaxed">{employee.permanentAddress || '—'}</p>
            </div>
          </div>

          {/* Specimen Signature Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Specimen Signature / Thumb Impression</span>
            <div className="w-full h-24 rounded-lg bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center overflow-hidden p-2">
              {employee.signature ? (
                <img
                  src={employee.signature}
                  alt="Signature"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[11px] text-slate-400 italic">No specimen signature recorded</span>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions with Role Permissions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {permissions.canDelete ? (
              <button
                type="button"
                id="btnDeleteDetailModal"
                onClick={() => onDelete(employee)}
                className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Permanently remove employee record (Admin only)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Delete restricted to Administrators</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {permissions.canEdit ? (
              <button
                type="button"
                id="btnEditDetailModal"
                onClick={() => onEdit(employee)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            ) : (
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-200/70 text-slate-600 font-medium flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Read-Only View</span>
              </span>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
