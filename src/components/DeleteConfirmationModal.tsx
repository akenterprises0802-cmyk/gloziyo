import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Employee } from '../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  employee,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          Delete Employee Record?
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Are you sure you want to permanently delete record for{' '}
          <strong className="text-slate-800">
            {employee.name} {employee.surname} ({employee.empCode})
          </strong>
          ? This action cannot be undone.
        </p>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 mb-5">
          <div className="flex justify-between">
            <span className="text-slate-500">Designation:</span>
            <span className="font-semibold text-slate-800">{employee.designation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">UAN:</span>
            <span className="font-mono text-slate-800">{employee.uan || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Aadhaar:</span>
            <span className="font-mono text-slate-800">{employee.aadhar || 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
