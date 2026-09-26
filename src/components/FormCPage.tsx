import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Search, 
  X, 
  Edit, 
  Trash2, 
  Filter, 
  Calendar, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  User,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers
} from 'lucide-react';
import { FormCRecord, FormCRecoveryType, Employee, AuthUser, RolePermissions } from '../types';
import { FormCEntryModal } from './FormCEntryModal';
import { exportFormCToExcel, exportFormCToPDF } from '../utils/formCExport';

interface FormCPageProps {
  records: FormCRecord[];
  employees: Employee[];
  currentUser: AuthUser;
  permissions: RolePermissions;
  onAddRecord: (record: FormCRecord) => void;
  onUpdateRecord: (record: FormCRecord) => void;
  onDeleteRecord: (id: string) => void;
  onResetFormCData: () => void;
  onBackToMaster?: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [
  CURRENT_YEAR - 3,
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 1,
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
];

const RECOVERY_TYPES: FormCRecoveryType[] = ['Damage', 'Loss', 'Fine', 'Advance', 'Loans'];

export const FormCPage: React.FC<FormCPageProps> = ({
  records,
  employees,
  currentUser,
  permissions,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onResetFormCData,
  onBackToMaster,
}) => {
  // Period From & To dropdown states as requested:
  // "For the Period From :- From       to"
  // "Month in Drop Down"
  const [fromMonth, setFromMonth] = useState<string>('April');
  const [fromYear, setFromYear] = useState<number>(CURRENT_YEAR - 1);
  const [toMonth, setToMonth] = useState<string>('March');
  const [toYear, setToYear] = useState<number>(CURRENT_YEAR);

  // Filters
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals & deletion state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<FormCRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<FormCRecord | null>(null);

  // Period string for statutory headers
  const periodString = useMemo(() => {
    return `From ${fromMonth} ${fromYear} to ${toMonth} ${toYear}`;
  }, [fromMonth, fromYear, toMonth, toYear]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Type filter
      if (selectedTypeFilter !== 'all' && rec.recoveryType !== selectedTypeFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesEmpCode = rec.empCode.toLowerCase().includes(query);
        const matchesName = rec.name.toLowerCase().includes(query);
        const matchesParticulars = rec.particulars.toLowerCase().includes(query);
        const matchesRemarks = rec.remarks.toLowerCase().includes(query);
        const matchesPresence = rec.explanationHeardInPresenceOf.toLowerCase().includes(query);
        if (!matchesEmpCode && !matchesName && !matchesParticulars && !matchesRemarks && !matchesPresence) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedTypeFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const totalAmount = records.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const damageLossCount = records.filter((r) => r.recoveryType === 'Damage' || r.recoveryType === 'Loss').length;
    const damageLossAmount = records
      .filter((r) => r.recoveryType === 'Damage' || r.recoveryType === 'Loss')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const advancesLoansAmount = records
      .filter((r) => r.recoveryType === 'Advance' || r.recoveryType === 'Loans')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const finesCount = records.filter((r) => r.recoveryType === 'Fine').length;
    const finesAmount = records
      .filter((r) => r.recoveryType === 'Fine')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return {
      totalCount: records.length,
      totalAmount,
      damageLossCount,
      damageLossAmount,
      advancesLoansAmount,
      finesCount,
      finesAmount,
    };
  }, [records]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsEntryModalOpen(true);
  };

  const handleOpenEdit = (rec: FormCRecord) => {
    setEditingRecord(rec);
    setIsEntryModalOpen(true);
  };

  const handleSave = (rec: FormCRecord) => {
    if (editingRecord) {
      onUpdateRecord(rec);
    } else {
      onAddRecord(rec);
    }
    setIsEntryModalOpen(false);
  };

  const handleExportExcel = () => {
    exportFormCToExcel(filteredRecords, periodString);
  };

  const handleExportPDF = () => {
    exportFormCToPDF(filteredRecords, periodString);
  };

  const handlePrint = () => {
    window.print();
  };

  const getRecoveryBadgeColor = (type: FormCRecoveryType) => {
    switch (type) {
      case 'Damage':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Loss':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Fine':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Advance':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Loans':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Statutory Header Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        
        {/* Top Dark Statutory Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4.5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-900">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-400/40 text-xs font-mono font-bold tracking-wider text-indigo-200 uppercase">
                FORM C
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">•</span>
              <span className="text-xs text-indigo-200 font-semibold tracking-wide">
                Register of Recovery / Damage / Loss / Fines / Advances / Loans
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                Administrator View
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
              Statutory Register under Labour Welfare & Wage Regulations
            </h1>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            <button
              type="button"
              id="btnFormCAddNew"
              onClick={handleOpenAdd}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Add New FORM C Recovery Entry"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>

            <button
              type="button"
              id="btnFormCExportExcel"
              onClick={handleExportExcel}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Form C Register to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              id="btnFormCExportPDF"
              onClick={handleExportPDF}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Form C Statutory Register to PDF (Legal Landscape 8.5 × 14 in)"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>PDF (Legal Landscape)</span>
            </button>

            <button
              type="button"
              id="btnFormCPrint"
              onClick={handlePrint}
              className="p-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Print Form C Table"
            >
              <Printer className="w-4 h-4 text-slate-300" />
            </button>

            {permissions.canResetData && (
              <button
                type="button"
                onClick={onResetFormCData}
                className="p-2 text-xs rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title="Reset Form C sample records"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Required Mandatory Heading Fields:
            - Heading Name of Establishment :- GLOZIYO SERVICES PRIVATE LIMITED,
            - Name of Owner : ASHRAF BELAL
            - For the Period From :- From [Month Drop Down] to [Month Drop Down]
        */}
        <div className="p-6 bg-slate-50/60 border-b border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Name of Establishment */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Name of Establishment :-</span>
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                GLOZIYO SERVICES PRIVATE LIMITED
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Corporate Compliance & Human Resource Operations Register
              </p>
            </div>

            {/* Name of Owner */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Name of Owner :</span>
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                ASHRAF BELAL
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Authorized Signatory & Principal Employer
              </p>
            </div>
          </div>

          {/* Period Selection:
              "For the Period From :- From       to"
              "Month in Drop Down"
          */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>For the Period From :-</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Select statutory assessment cycle (Month dropdowns for start and end period)
              </p>
            </div>

            {/* Interactive Month & Year Dropdowns */}
            <div className="flex items-center flex-wrap gap-2.5 text-xs">
              
              {/* FROM Section */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 px-1">From :</span>
                {/* Month dropdown */}
                <select
                  id="fromMonthDropdown"
                  value={fromMonth}
                  onChange={(e) => setFromMonth(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                {/* Year dropdown */}
                <select
                  id="fromYearDropdown"
                  value={fromYear}
                  onChange={(e) => setFromYear(Number(e.target.value))}
                  className="px-2 py-1.5 bg-white border border-slate-300 rounded-md font-mono font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* TO Section */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 px-1">to :</span>
                {/* Month dropdown */}
                <select
                  id="toMonthDropdown"
                  value={toMonth}
                  onChange={(e) => setToMonth(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                {/* Year dropdown */}
                <select
                  id="toYearDropdown"
                  value={toYear}
                  onChange={(e) => setToYear(Number(e.target.value))}
                  className="px-2 py-1.5 bg-white border border-slate-300 rounded-md font-mono font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Quick Period Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setFromMonth('April');
                    setFromYear(CURRENT_YEAR - 1);
                    setToMonth('March');
                    setToYear(CURRENT_YEAR);
                  }}
                  className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors"
                  title="Set to Financial Year (Apr - Mar)"
                >
                  FY {CURRENT_YEAR - 1}-{CURRENT_YEAR}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFromMonth('January');
                    setFromYear(CURRENT_YEAR);
                    setToMonth('December');
                    setToYear(CURRENT_YEAR);
                  }}
                  className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors"
                  title="Set to Calendar Year (Jan - Dec)"
                >
                  CY {CURRENT_YEAR}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stat Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border-b border-slate-200">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Recorded Recoveries
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              ₹ {stats.totalAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500">{records.length} total register entries</span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
              Damage & Loss Cases
            </span>
            <div className="text-xl font-extrabold text-amber-900 mt-1">
              ₹ {stats.damageLossAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-amber-700">{stats.damageLossCount} verified incidents</span>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              Advances & Loans
            </span>
            <div className="text-xl font-extrabold text-blue-900 mt-1">
              ₹ {stats.advancesLoansAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-blue-700">Scheduled EMI recoveries</span>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
              Statutory Fines
            </span>
            <div className="text-xl font-extrabold text-purple-900 mt-1">
              ₹ {stats.finesAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-purple-700">{stats.finesCount} disciplinary fines</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Recovery Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                selectedTypeFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              All Recoveries ({records.length})
            </button>
            {RECOVERY_TYPES.map((type) => {
              const count = records.filter((r) => r.recoveryType === type).length;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    selectedTypeFilter === type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code, name, particulars..."
              className="w-full pl-9 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Master Statutory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            {/* The exact Form Heading requested:
                SI. No. in Employee register, Employee Code, Name, Heading Recovery Type Damage, Loss, Fine, Advance, Loans, Particulars, Date of Damage/Loss*, Amount, Whether Show Cause issued*, Explanation heard in presence of*, Number of Instalments, First Month /Year, Last Month /Year, Date of Complete Recovery, Remarks
            */}
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3 text-center w-14">SI. No. in Employee register</th>
                <th className="py-3 px-3 text-left w-24">Employee Code</th>
                <th className="py-3 px-3.5 text-left w-36">Name</th>
                <th className="py-3 px-3 text-center w-28">Heading Recovery Type Damage, Loss, Fine, Advance, Loans</th>
                <th className="py-3 px-3 text-left min-w-[160px]">Particulars</th>
                <th className="py-3 px-3 text-center w-28">Date of Damage/Loss*</th>
                <th className="py-3 px-3 text-right w-24">Amount (₹)</th>
                <th className="py-3 px-3 text-left w-36">Whether Show Cause issued*</th>
                <th className="py-3 px-3 text-left min-w-[150px]">Explanation heard in presence of*</th>
                <th className="py-3 px-3 text-center w-20">Number of Instalments</th>
                <th className="py-3 px-3 text-center w-28">First Month /Year</th>
                <th className="py-3 px-3 text-center w-28">Last Month /Year</th>
                <th className="py-3 px-3 text-center w-28">Date of Complete Recovery</th>
                <th className="py-3 px-3 text-left min-w-[160px]">Remarks</th>
                <th className="py-3 px-3 text-center w-20 sticky right-0 bg-slate-900 shadow-l">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No Form C records found</p>
                      <p className="text-xs text-slate-500">
                        {searchTerm || selectedTypeFilter !== 'all'
                          ? 'Try clearing the search or category filters.'
                          : 'No recovery records entered yet. Click "Add Entry" to create the first Form C record.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="mt-2 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Entry Now</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => (
                  <tr 
                    key={rec.id} 
                    className="hover:bg-slate-50/80 transition-colors group text-[11px]"
                  >
                    {/* 1. SI. No. in Employee register */}
                    <td className="py-3 px-3 text-center font-bold text-slate-800 bg-slate-50/40">
                      {rec.slNo || index + 1}
                    </td>

                    {/* 2. Employee Code */}
                    <td className="py-3 px-3 font-mono font-bold text-indigo-900 whitespace-nowrap">
                      {rec.empCode}
                    </td>

                    {/* 3. Name */}
                    <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {rec.name}
                    </td>

                    {/* 4. Heading Recovery Type */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRecoveryBadgeColor(rec.recoveryType)}`}>
                        {rec.recoveryType}
                      </span>
                    </td>

                    {/* 5. Particulars */}
                    <td className="py-3 px-3 text-slate-700 max-w-xs break-words font-medium">
                      {rec.particulars}
                    </td>

                    {/* 6. Date of Damage/Loss* */}
                    <td className="py-3 px-3 text-center font-mono text-slate-800 whitespace-nowrap">
                      {rec.dateOfDamageLoss || '-'}
                    </td>

                    {/* 7. Amount */}
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                      ₹ {Number(rec.amount).toLocaleString('en-IN')}
                    </td>

                    {/* 8. Whether Show Cause issued* */}
                    <td className="py-3 px-3 text-slate-700">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        rec.whetherShowCauseIssued.toLowerCase().startsWith('yes')
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {rec.whetherShowCauseIssued}
                      </span>
                    </td>

                    {/* 9. Explanation heard in presence of* */}
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {rec.explanationHeardInPresenceOf || '-'}
                    </td>

                    {/* 10. Number of Instalments */}
                    <td className="py-3 px-3 text-center font-bold font-mono text-slate-800">
                      {rec.numberOfInstalments || 1}
                    </td>

                    {/* 11. First Month /Year */}
                    <td className="py-3 px-3 text-center font-medium text-slate-800 whitespace-nowrap">
                      {rec.firstMonthYear || '-'}
                    </td>

                    {/* 12. Last Month /Year */}
                    <td className="py-3 px-3 text-center font-medium text-slate-800 whitespace-nowrap">
                      {rec.lastMonthYear || '-'}
                    </td>

                    {/* 13. Date of Complete Recovery */}
                    <td className="py-3 px-3 text-center font-mono text-slate-700 whitespace-nowrap">
                      {rec.dateOfCompleteRecovery ? (
                        <span className="text-emerald-700 font-semibold">{rec.dateOfCompleteRecovery}</span>
                      ) : (
                        <span className="text-amber-600 italic">In Progress</span>
                      )}
                    </td>

                    {/* 14. Remarks */}
                    <td className="py-3 px-3 text-slate-600 max-w-xs break-words">
                      {rec.remarks || '-'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center sticky right-0 bg-white group-hover:bg-slate-50 transition-colors shadow-l">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                          title={`Edit Form C record for ${rec.name}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecordToDelete(rec)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title={`Delete record for ${rec.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> statutory recovery entries
          </span>
          <span className="text-[11px] text-slate-400">
            Establishment: GLOZIYO SERVICES PRIVATE LIMITED • Owner: ASHRAF BELAL
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Form C Record?</h3>
                <p className="text-xs text-slate-500">This action removes this recovery entry from the statutory register.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div><span className="font-semibold text-slate-700">Employee:</span> {recordToDelete.name} ({recordToDelete.empCode})</div>
              <div><span className="font-semibold text-slate-700">Recovery Type:</span> {recordToDelete.recoveryType}</div>
              <div><span className="font-semibold text-slate-700">Amount:</span> ₹ {Number(recordToDelete.amount).toLocaleString('en-IN')}</div>
              <div><span className="font-semibold text-slate-700">Particulars:</span> {recordToDelete.particulars}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRecord(recordToDelete.id);
                  setRecordToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form C Entry Modal */}
      <FormCEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSave}
        recordToEdit={editingRecord}
        employees={employees}
        nextSlNo={records.length + 1}
      />
    </div>
  );
};
