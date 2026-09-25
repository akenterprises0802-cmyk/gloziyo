import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, DollarSign, FileText, UserCheck, ShieldAlert } from 'lucide-react';
import { FormCRecord, FormCRecoveryType, Employee } from '../types';

interface FormCEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: FormCRecord) => void;
  recordToEdit: FormCRecord | null;
  employees: Employee[];
  nextSlNo: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 1,
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
  CURRENT_YEAR + 2,
];

export const FormCEntryModal: React.FC<FormCEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
  employees,
  nextSlNo,
}) => {
  const [slNo, setSlNo] = useState<number>(nextSlNo);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [empCode, setEmpCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [recoveryType, setRecoveryType] = useState<FormCRecoveryType>('Damage');
  const [particulars, setParticulars] = useState<string>('');
  const [dateOfDamageLoss, setDateOfDamageLoss] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [whetherShowCauseIssued, setWhetherShowCauseIssued] = useState<string>('Yes');
  const [showCauseNotes, setShowCauseNotes] = useState<string>('');
  const [explanationHeardInPresenceOf, setExplanationHeardInPresenceOf] = useState<string>('Ashraf Belal (Owner)');
  const [numberOfInstalments, setNumberOfInstalments] = useState<number>(1);
  
  const [firstMonth, setFirstMonth] = useState<string>('April');
  const [firstYear, setFirstYear] = useState<number>(CURRENT_YEAR);
  const [lastMonth, setLastMonth] = useState<string>('April');
  const [lastYear, setLastYear] = useState<number>(CURRENT_YEAR);
  
  const [dateOfCompleteRecovery, setDateOfCompleteRecovery] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (recordToEdit) {
      setSlNo(recordToEdit.slNo || nextSlNo);
      setEmpCode(recordToEdit.empCode);
      setName(recordToEdit.name);
      setRecoveryType(recordToEdit.recoveryType);
      setParticulars(recordToEdit.particulars);
      setDateOfDamageLoss(recordToEdit.dateOfDamageLoss);
      setAmount(recordToEdit.amount);

      if (recordToEdit.whetherShowCauseIssued.startsWith('Yes')) {
        setWhetherShowCauseIssued('Yes');
        setShowCauseNotes(recordToEdit.whetherShowCauseIssued.replace(/^Yes\s*\(?/, '').replace(/\)?$/, ''));
      } else if (recordToEdit.whetherShowCauseIssued.startsWith('No')) {
        setWhetherShowCauseIssued('No');
        setShowCauseNotes(recordToEdit.whetherShowCauseIssued.replace(/^No\s*\(?/, '').replace(/\)?$/, ''));
      } else {
        setWhetherShowCauseIssued('Yes');
        setShowCauseNotes(recordToEdit.whetherShowCauseIssued);
      }

      setExplanationHeardInPresenceOf(recordToEdit.explanationHeardInPresenceOf || 'Ashraf Belal (Owner)');
      setNumberOfInstalments(recordToEdit.numberOfInstalments || 1);

      // Parse firstMonthYear (e.g. "April 2024")
      if (recordToEdit.firstMonthYear) {
        const parts = recordToEdit.firstMonthYear.split(' ');
        if (parts[0] && MONTHS.includes(parts[0])) setFirstMonth(parts[0]);
        if (parts[1] && !isNaN(Number(parts[1]))) setFirstYear(Number(parts[1]));
      }

      // Parse lastMonthYear (e.g. "July 2024")
      if (recordToEdit.lastMonthYear) {
        const parts = recordToEdit.lastMonthYear.split(' ');
        if (parts[0] && MONTHS.includes(parts[0])) setLastMonth(parts[0]);
        if (parts[1] && !isNaN(Number(parts[1]))) setLastYear(Number(parts[1]));
      }

      setDateOfCompleteRecovery(recordToEdit.dateOfCompleteRecovery || '');
      setRemarks(recordToEdit.remarks || '');
      setError('');
    } else {
      setSlNo(nextSlNo);
      setSelectedEmpId('');
      setEmpCode('');
      setName('');
      setRecoveryType('Damage');
      setParticulars('');
      const today = new Date().toISOString().split('T')[0];
      setDateOfDamageLoss(today);
      setAmount('');
      setWhetherShowCauseIssued('Yes');
      setShowCauseNotes('Notice Issued on ' + today);
      setExplanationHeardInPresenceOf('Ashraf Belal (Owner)');
      setNumberOfInstalments(1);
      setFirstMonth('April');
      setFirstYear(CURRENT_YEAR);
      setLastMonth('April');
      setLastYear(CURRENT_YEAR);
      setDateOfCompleteRecovery('');
      setRemarks('');
      setError('');
    }
  }, [recordToEdit, nextSlNo, isOpen]);

  // When an employee is chosen from existing list
  const handleEmployeePick = (empId: string) => {
    setSelectedEmpId(empId);
    const found = employees.find((e) => e.id === empId);
    if (found) {
      setEmpCode(found.empCode);
      setName(`${found.name} ${found.surname}`.trim());
      // find index in employee register for Sl No
      const idx = employees.findIndex((e) => e.id === empId);
      if (idx !== -1 && !recordToEdit) {
        setSlNo(idx + 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empCode.trim()) {
      setError('Please provide or select an Employee Code.');
      return;
    }
    if (!name.trim()) {
      setError('Employee Name is required.');
      return;
    }
    if (!dateOfDamageLoss) {
      setError('Date of Damage/Loss* is required.');
      return;
    }
    if (amount === '' || Number(amount) < 0) {
      setError('Please enter a valid positive Amount (Rs.).');
      return;
    }
    if (!explanationHeardInPresenceOf.trim()) {
      setError('Explanation heard in presence of* is required.');
      return;
    }

    const fullShowCause = showCauseNotes.trim()
      ? `${whetherShowCauseIssued} (${showCauseNotes.trim()})`
      : whetherShowCauseIssued;

    const newRecord: FormCRecord = {
      id: recordToEdit ? recordToEdit.id : `form-c-${Date.now()}`,
      slNo: Number(slNo) || nextSlNo,
      empCode: empCode.trim(),
      name: name.trim(),
      recoveryType,
      particulars: particulars.trim() || `${recoveryType} recovery`,
      dateOfDamageLoss,
      amount: Number(amount),
      whetherShowCauseIssued: fullShowCause,
      explanationHeardInPresenceOf: explanationHeardInPresenceOf.trim(),
      numberOfInstalments: Number(numberOfInstalments) || 1,
      firstMonthYear: `${firstMonth} ${firstYear}`,
      lastMonthYear: `${lastMonth} ${lastYear}`,
      dateOfCompleteRecovery: dateOfCompleteRecovery.trim(),
      remarks: remarks.trim(),
      createdAt: recordToEdit?.createdAt || new Date().toISOString(),
    };

    onSave(newRecord);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-mono font-bold tracking-wider text-indigo-200 uppercase">
                Statutory Register
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {recordToEdit ? 'Edit FORM C Entry' : 'Add New FORM C Entry'}
              </h2>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              GLOZIYO SERVICES PRIVATE LIMITED • Owner: ASHRAF BELAL
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick autofill from Employee Register */}
          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="font-bold text-indigo-950 text-xs">Quick Autofill from Employee Register</span>
                <p className="text-[11px] text-indigo-700">Select an existing employee to populate code, name & register serial number</p>
              </div>
            </div>
            <select
              value={selectedEmpId}
              onChange={(e) => handleEmployeePick(e.target.value)}
              className="w-full sm:w-64 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose Employee (Optional) --</option>
              {employees.map((emp, i) => (
                <option key={emp.id} value={emp.id}>
                  #{i + 1} - {emp.empCode} - {emp.name} {emp.surname}
                </option>
              ))}
            </select>
          </div>

          {/* Section 1: Employee & Statutory Register Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                SI. No. in Employee register *
              </label>
              <input
                type="number"
                min="1"
                value={slNo}
                onChange={(e) => setSlNo(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Employee Code *
              </label>
              <input
                type="text"
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                placeholder="e.g. EMP-1001"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Section 2: Recovery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Heading Recovery Type *
              </label>
              <select
                value={recoveryType}
                onChange={(e) => setRecoveryType(e.target.value as FormCRecoveryType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-indigo-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="Damage">Damage</option>
                <option value="Loss">Loss</option>
                <option value="Fine">Fine</option>
                <option value="Advance">Advance</option>
                <option value="Loans">Loans</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Date of Damage/Loss*
              </label>
              <input
                type="date"
                value={dateOfDamageLoss}
                onChange={(e) => setDateOfDamageLoss(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Amount (₹)*
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  required
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Particulars Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Particulars (Nature of Damage / Loss / Fine reason / Advance purpose) *
            </label>
            <input
              type="text"
              value={particulars}
              onChange={(e) => setParticulars(e.target.value)}
              placeholder="e.g. Breakage of optical inspection gauge on assembly line #2"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Section 3: Show Cause & Inquiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Whether Show Cause issued*
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={whetherShowCauseIssued}
                  onChange={(e) => setWhetherShowCauseIssued(e.target.value)}
                  className="w-28 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="N/A">N/A</option>
                </select>
                <input
                  type="text"
                  value={showCauseNotes}
                  onChange={(e) => setShowCauseNotes(e.target.value)}
                  placeholder="Details / Ref No (e.g. SCN/2024/014)"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Explanation heard in presence of*
              </label>
              <input
                type="text"
                value={explanationHeardInPresenceOf}
                onChange={(e) => setExplanationHeardInPresenceOf(e.target.value)}
                placeholder="e.g. Ashraf Belal (Owner) / HR Head"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Section 4: Instalments & Periods */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Number of Instalments
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={numberOfInstalments}
                onChange={(e) => setNumberOfInstalments(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                First Month /Year *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={firstMonth}
                  onChange={(e) => setFirstMonth(e.target.value)}
                  className="px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={firstYear}
                  onChange={(e) => setFirstYear(Number(e.target.value))}
                  className="px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Last Month /Year *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={lastMonth}
                  onChange={(e) => setLastMonth(e.target.value)}
                  className="px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={lastYear}
                  onChange={(e) => setLastYear(Number(e.target.value))}
                  className="px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Date of Complete Recovery & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Date of Complete Recovery
              </label>
              <input
                type="date"
                value={dateOfCompleteRecovery}
                onChange={(e) => setDateOfCompleteRecovery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Leave blank if recovery is ongoing</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Deducted via monthly payroll; fully cleared"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{recordToEdit ? 'Update Record' : 'Save FORM C Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
