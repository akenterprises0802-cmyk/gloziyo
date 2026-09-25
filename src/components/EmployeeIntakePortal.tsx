import React from 'react';
import { 
  UserPlus, 
  ShieldAlert, 
  CheckCircle2, 
  FileCheck, 
  Building2, 
  CreditCard, 
  FileText, 
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { Employee, AuthUser } from '../types';

interface EmployeeIntakePortalProps {
  currentUser: AuthUser;
  onOpenAddModal: () => void;
  sessionAddedEmployees: Employee[];
}

export const EmployeeIntakePortal: React.FC<EmployeeIntakePortalProps> = ({
  currentUser,
  onOpenAddModal,
  sessionAddedEmployees,
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Privacy & Restriction Alert Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-bold text-amber-950 text-sm mb-0.5">
            Role Permission Policy: Add Employee Details Only
          </p>
          <p>
            You are signed in under the <strong>Employee</strong> role (<span className="font-mono font-semibold">{currentUser.username}</span>). You have authorization to <strong>input and register new employee details only</strong>. For statutory confidentiality and data security, browsing existing employee dossiers, salary/banking records, and Form C/D registers is strictly restricted.
          </p>
        </div>
      </div>

      {/* Main Registration Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Top Decorative accent bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
        
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-4 shadow-xs">
          <UserPlus className="w-8 h-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Employee Registration Desk
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1.5">
          GLOZIYO SERVICES PRIVATE LIMITED • Central Statutory Intake Portal
        </p>

        <p className="text-xs text-slate-600 max-w-lg mx-auto mt-3">
          Click the button below to open the complete official registration form and enter a new employee's statutory, KYC, banking, and designation details.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            id="btnIntakeAddEmployee"
            onClick={onOpenAddModal}
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" />
            <span>+ Add New Employee Details</span>
          </button>
        </div>

        {/* Quick status indicator */}
        <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ready for entry • Generated codes EMP-XXXX are automatically sequenced</span>
        </div>
      </div>

      {/* Submission Session Activity */}
      {sessionAddedEmployees.length > 0 && (
        <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 border-b border-emerald-100 pb-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Successfully Submitted During This Session ({sessionAddedEmployees.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Saved to Database
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {sessionAddedEmployees.map((emp, index) => (
              <div key={emp.id || index} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{emp.empCode}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="font-medium text-slate-700">{emp.name} {emp.surname}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    {emp.designation}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Registered</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>+ Register Another Employee</span>
            </button>
          </div>
        </div>
      )}

      {/* Statutory Checklist Guidance Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Information Required for Complete Statutory Registration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
              <Building2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">1. Personal & KYC</h4>
            <ul className="text-[11px] text-slate-500 space-y-1">
              <li>• Full Name & Surname</li>
              <li>• Father's / Spouse Name</li>
              <li>• Date of Birth & Gender</li>
              <li>• Present & Permanent Address</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">2. Job & Designation</h4>
            <ul className="text-[11px] text-slate-500 space-y-1">
              <li>• Date of Joining (DOJ)</li>
              <li>• Designation (DEO, Helper, etc.)</li>
              <li>• Category (Skilled/Unskilled)</li>
              <li>• Job Location / Plant</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <CreditCard className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">3. Bank & Compliance</h4>
            <ul className="text-[11px] text-slate-500 space-y-1">
              <li>• Bank Account & IFSC</li>
              <li>• UAN & PF Account Number</li>
              <li>• ESIC & LWF Number</li>
              <li>• PAN & Aadhar Number</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
              <FileCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">4. Verification</h4>
            <ul className="text-[11px] text-slate-500 space-y-1">
              <li>• Employee Mobile Number</li>
              <li>• Specimen Signature Upload</li>
              <li>• Identification Mark</li>
              <li>• Candidate Photo (optional)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security note card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Records submitted here are instantly integrated into the Master Register and secured under Admin & HR oversight.
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">Security Clearance: LEVEL-EMP-ENTRY</span>
      </div>

    </div>
  );
};
