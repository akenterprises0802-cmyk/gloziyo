import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  User, 
  Briefcase, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Save, 
  Trash2,
  PenTool,
  Check,
  AlertCircle
} from 'lucide-react';
import { Employee } from '../types';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employeeToEdit?: Employee | null;
  existingCount: number;
}

const DESIGNATION_OPTIONS = [
  'DEO',
  'Helper',
  'Fitter',
  'Welder',
  'Supervisor',
  'Project Manager',
  'Trainee',
  'Office Boy',
  'Electrician',
  'Quality Inspector',
  'Site Engineer',
  'Accountant',
  'HR Executive',
  'Driver',
  'Security Guard'
];

const EDUCATION_OPTIONS = [
  '10th',
  '12th',
  'Graduate',
  'Post Graduate',
  'Diploma',
  'ITI',
  'B.Tech / B.E.',
  'Other'
];

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  existingCount,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'job' | 'statutory' | 'bank_address' | 'docs_exit'>('basic');

  const [formData, setFormData] = useState<Partial<Employee>>({
    empCode: '',
    name: '',
    surname: '',
    gender: 'Male',
    guardian: '',
    dob: '',
    nationality: 'Indian',
    education: '12th',
    doj: new Date().toISOString().split('T')[0],
    designation: 'DEO',
    category: 'Skilled',
    employmentType: 'Permanent',
    mobile: '',
    uan: '',
    pan: '',
    esic: '',
    lwf: '',
    aadhar: '',
    bankAccount: '',
    bank: '',
    ifsc: '',
    presentAddress: '',
    permanentAddress: '',
    serviceBook: '',
    exitDate: '',
    exitReason: '',
    identification: '',
    photo: '',
    signature: '',
    remarks: '',
    jobLocation: 'Main Plant',
  });

  const [sameAddress, setSameAddress] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const photoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form
  useEffect(() => {
    if (employeeToEdit) {
      setFormData(employeeToEdit);
      setSameAddress(
        Boolean(
          employeeToEdit.presentAddress &&
          employeeToEdit.presentAddress === employeeToEdit.permanentAddress
        )
      );
    } else {
      const generatedCode = `EMP-${1000 + existingCount + 1}`;
      setFormData({
        empCode: generatedCode,
        name: '',
        surname: '',
        gender: 'Male',
        guardian: '',
        dob: '1995-01-01',
        nationality: 'Indian',
        education: 'Graduate',
        doj: new Date().toISOString().split('T')[0],
        designation: 'Fitter',
        category: 'Skilled',
        employmentType: 'Permanent',
        mobile: '',
        uan: '',
        pan: '',
        esic: '',
        lwf: '',
        aadhar: '',
        bankAccount: '',
        bank: 'State Bank of India',
        ifsc: '',
        presentAddress: '',
        permanentAddress: '',
        serviceBook: `SB/${new Date().getFullYear()}/${String(existingCount + 1).padStart(3, '0')}`,
        exitDate: '',
        exitReason: '',
        identification: '',
        photo: '',
        signature: '',
        remarks: '',
        jobLocation: 'Workshop Unit 1',
      });
      setSameAddress(false);
    }
    setActiveTab('basic');
    setErrors({});
  }, [employeeToEdit, existingCount, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'presentAddress' && sameAddress) {
        updated.permanentAddress = value;
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, permanentAddress: prev.presentAddress || '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'signature') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.empCode?.trim()) newErrors.empCode = 'Employee code is required';
    if (!formData.name?.trim()) newErrors.name = 'First name is required';
    if (!formData.surname?.trim()) newErrors.surname = 'Surname is required';
    if (!formData.mobile?.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\s+/g, ''))) {
      newErrors.mobile = 'Must be a valid 10-digit number';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.empCode || newErrors.name || newErrors.surname) {
        setActiveTab('basic');
      } else if (newErrors.mobile) {
        setActiveTab('statutory');
      }
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalizedEmployee: Employee = {
      id: employeeToEdit ? employeeToEdit.id : `emp-${Date.now()}`,
      empCode: formData.empCode?.trim() || '',
      name: formData.name?.trim() || '',
      surname: formData.surname?.trim() || '',
      gender: formData.gender || 'Male',
      guardian: formData.guardian?.trim() || '',
      dob: formData.dob || '',
      nationality: formData.nationality || 'Indian',
      education: formData.education || 'Graduate',
      doj: formData.doj || '',
      designation: formData.designation || 'DEO',
      category: formData.category || 'Skilled',
      employmentType: formData.employmentType || 'Permanent',
      mobile: formData.mobile?.trim() || '',
      uan: formData.uan?.trim() || '',
      pan: formData.pan?.trim().toUpperCase() || '',
      esic: formData.esic?.trim() || '',
      lwf: formData.lwf?.trim() || '',
      aadhar: formData.aadhar?.trim() || '',
      bankAccount: formData.bankAccount?.trim() || '',
      bank: formData.bank?.trim() || '',
      ifsc: formData.ifsc?.trim().toUpperCase() || '',
      presentAddress: formData.presentAddress?.trim() || '',
      permanentAddress: formData.permanentAddress?.trim() || '',
      serviceBook: formData.serviceBook?.trim() || '',
      exitDate: formData.exitDate?.trim() || '',
      exitReason: formData.exitReason?.trim() || '',
      identification: formData.identification?.trim() || '',
      photo: formData.photo || '',
      signature: formData.signature || '',
      remarks: formData.remarks?.trim() || '',
      jobLocation: formData.jobLocation?.trim() || '',
      createdAt: employeeToEdit?.createdAt || new Date().toISOString(),
    };

    onSave(finalizedEmployee);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              {employeeToEdit ? `Edit Record: ${employeeToEdit.empCode}` : 'Register New Employee'}
            </h2>
            <p className="text-xs text-slate-400">
              Statutory Employee Master Form with compliance, KYC, and banking fields
            </p>
          </div>
          <button
            type="button"
            id="btnCloseFormModal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'basic'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Personal Info</span>
            {(errors.name || errors.surname || errors.empCode) && (
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('job')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'job'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>2. Job & Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('statutory')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'statutory'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Statutory & KYC</span>
            {errors.mobile && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bank_address')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'bank_address'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>4. Bank & Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs_exit')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'docs_exit'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>5. Photo, Sign & Exit</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="employeeForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: PERSONAL INFO */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputEmpCode">
                  Employee Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="inputEmpCode"
                  type="text"
                  name="empCode"
                  value={formData.empCode || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. EMP-1001"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.empCode ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-slate-900'
                  }`}
                  required
                />
                {errors.empCode && <p className="text-[11px] text-red-600 mt-1">{errors.empCode}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputGender">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="inputGender"
                  name="gender"
                  value={formData.gender || 'Male'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputName">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="inputName"
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramesh"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-slate-900'
                  }`}
                  required
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputSurname">
                  Surname <span className="text-red-500">*</span>
                </label>
                <input
                  id="inputSurname"
                  type="text"
                  name="surname"
                  value={formData.surname || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Sharma"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.surname ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-slate-900'
                  }`}
                  required
                />
                {errors.surname && <p className="text-[11px] text-red-600 mt-1">{errors.surname}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputGuardian">
                  Father’s / Spouse Name
                </label>
                <input
                  id="inputGuardian"
                  type="text"
                  name="guardian"
                  value={formData.guardian || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramprasad Sharma"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputDob">
                  Date of Birth
                </label>
                <input
                  id="inputDob"
                  type="date"
                  name="dob"
                  value={formData.dob || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputNationality">
                  Nationality
                </label>
                <select
                  id="inputNationality"
                  name="nationality"
                  value={formData.nationality || 'Indian'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Indian">Indian</option>
                  <option value="Nepalese">Nepalese</option>
                  <option value="Bhutanese">Bhutanese</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputIdentification">
                  Mark of Identification
                </label>
                <input
                  id="inputIdentification"
                  type="text"
                  name="identification"
                  value={formData.identification || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Mole on right cheek, scar on forehead"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {/* TAB 2: JOB & PROFILE */}
          {activeTab === 'job' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputDesignation">
                  Designation
                </label>
                <select
                  id="inputDesignation"
                  name="designation"
                  value={formData.designation || 'DEO'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {DESIGNATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputCategory">
                  Category
                </label>
                <select
                  id="inputCategory"
                  name="category"
                  value={formData.category || 'Skilled'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Skilled">Skilled</option>
                  <option value="Semi-Skilled">Semi-Skilled</option>
                  <option value="Un Skilled">Un Skilled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputDoj">
                  Date of Joining
                </label>
                <input
                  id="inputDoj"
                  type="date"
                  name="doj"
                  value={formData.doj || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputEmploymentType">
                  Type of Employment
                </label>
                <input
                  id="inputEmploymentType"
                  type="text"
                  name="employmentType"
                  value={formData.employmentType || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Permanent, Contract, Daily Wage"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputEducation">
                  Education
                </label>
                <select
                  id="inputEducation"
                  name="education"
                  value={formData.education || '12th'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {EDUCATION_OPTIONS.map((edu) => (
                    <option key={edu} value={edu}>
                      {edu}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputJobLocation">
                  Job Location
                </label>
                <input
                  id="inputJobLocation"
                  type="text"
                  name="jobLocation"
                  value={formData.jobLocation || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Mumbai Works Yard, Factory #2"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputServiceBook">
                  Service Book No
                </label>
                <input
                  id="inputServiceBook"
                  type="text"
                  name="serviceBook"
                  value={formData.serviceBook || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. SB/2023/104"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {/* TAB 3: STATUTORY & KYC */}
          {activeTab === 'statutory' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputMobile">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  id="inputMobile"
                  type="tel"
                  name="mobile"
                  value={formData.mobile || ''}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    errors.mobile ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-slate-900'
                  }`}
                  required
                />
                {errors.mobile && <p className="text-[11px] text-red-600 mt-1">{errors.mobile}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputAadhar">
                  Aadhar No
                </label>
                <input
                  id="inputAadhar"
                  type="text"
                  name="aadhar"
                  value={formData.aadhar || ''}
                  onChange={handleInputChange}
                  placeholder="12-digit Aadhaar Number"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputPan">
                  PAN No
                </label>
                <input
                  id="inputPan"
                  type="text"
                  name="pan"
                  value={formData.pan || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputUan">
                  UAN No (Universal Account Number)
                </label>
                <input
                  id="inputUan"
                  type="text"
                  name="uan"
                  value={formData.uan || ''}
                  onChange={handleInputChange}
                  placeholder="12-digit EPF UAN"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputEsic">
                  ESIC IP No (Insurance Person)
                </label>
                <input
                  id="inputEsic"
                  type="text"
                  name="esic"
                  value={formData.esic || ''}
                  onChange={handleInputChange}
                  placeholder="17-digit ESIC Insurance No"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputLwf">
                  LWF (Labour Welfare Fund)
                </label>
                <input
                  id="inputLwf"
                  type="text"
                  name="lwf"
                  value={formData.lwf || ''}
                  onChange={handleInputChange}
                  placeholder="LWF registration identifier"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {/* TAB 4: BANK & ADDRESS */}
          {activeTab === 'bank_address' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputBank">
                    Bank Name
                  </label>
                  <input
                    id="inputBank"
                    type="text"
                    name="bank"
                    value={formData.bank || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. State Bank of India, HDFC"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputBankAccount">
                    Bank A/c No
                  </label>
                  <input
                    id="inputBankAccount"
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount || ''}
                    onChange={handleInputChange}
                    placeholder="Account number"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputIfsc">
                    IFSC Code
                  </label>
                  <input
                    id="inputIfsc"
                    type="text"
                    name="ifsc"
                    value={formData.ifsc || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputPresentAddress">
                  Present Address
                </label>
                <textarea
                  id="inputPresentAddress"
                  name="presentAddress"
                  rows={2}
                  value={formData.presentAddress || ''}
                  onChange={handleInputChange}
                  placeholder="Street, Room/Flat, City, State, PIN"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700" htmlFor="inputPermanentAddress">
                    Permanent Address
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAddress}
                      onChange={(e) => handleSameAddressToggle(e.target.checked)}
                      className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                    />
                    <span>Same as Present Address</span>
                  </label>
                </div>
                <textarea
                  id="inputPermanentAddress"
                  name="permanentAddress"
                  rows={2}
                  value={formData.permanentAddress || ''}
                  onChange={handleInputChange}
                  disabled={sameAddress}
                  placeholder="Native address, Village/District, PIN code"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    sameAddress ? 'bg-slate-100 text-slate-500' : 'border-slate-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 5: PHOTO, SIGNATURE & SEPARATION */}
          {activeTab === 'docs_exit' && (
            <div className="space-y-6">
              {/* Photo & Signature Upload Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Photo Upload */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center text-center">
                  <span className="text-xs font-semibold text-slate-700 mb-2">Employee Passport Photo</span>
                  <div className="w-28 h-36 rounded-lg border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden mb-3 relative group">
                    {formData.photo ? (
                      <img
                        src={formData.photo}
                        alt="Employee Photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1 p-2">
                        <User className="w-8 h-8 text-slate-300" />
                        <span className="text-[10px] text-slate-400">No Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={photoInputRef}
                      accept="image/*"
                      name="photo"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.photo ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    {formData.photo && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, photo: '' }))}
                        className="p-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Signature Upload */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center text-center">
                  <span className="text-xs font-semibold text-slate-700 mb-2">Specimen Signature</span>
                  <div className="w-48 h-24 rounded-lg border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden mb-3">
                    {formData.signature ? (
                      <img
                        src={formData.signature}
                        alt="Employee Signature"
                        className="max-h-full max-w-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1 p-2">
                        <PenTool className="w-6 h-6 text-slate-300" />
                        <span className="text-[10px] text-slate-400">No Signature</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={sigInputRef}
                      accept="image/*"
                      name="signature"
                      onChange={(e) => handleFileUpload(e, 'signature')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => sigInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.signature ? 'Change Signature' : 'Upload Signature'}</span>
                    </button>
                    {formData.signature && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, signature: '' }))}
                        className="p-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                        title="Remove signature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Separation / Exit Details */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Separation / Exit Details (Optional - Leave blank if active)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputExitDate">
                      Date of Exit
                    </label>
                    <input
                      id="inputExitDate"
                      type="date"
                      name="exitDate"
                      value={formData.exitDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputExitReason">
                      Reason for Exit
                    </label>
                    <input
                      id="inputExitReason"
                      type="text"
                      name="exitReason"
                      value={formData.exitReason || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. Resigned, Contract Completed, Retired"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="inputRemarks">
                  Remarks / HR Notes
                </label>
                <textarea
                  id="inputRemarks"
                  name="remarks"
                  rows={2}
                  value={formData.remarks || ''}
                  onChange={handleInputChange}
                  placeholder="Additional notes, background verification details, or project assignments"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              <span className="text-red-500">*</span> Required fields for master register
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                id="btnCancelEmployeeForm"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btnSubmitEmployeeForm"
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{employeeToEdit ? 'Update Record' : 'Save Employee Record'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
