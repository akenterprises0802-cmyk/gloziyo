import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee } from '../types';

export function exportToExcel(employees: Employee[], fileName = 'employees_records.xlsx') {
  const exportData = employees.map((emp, index) => ({
    'Sr No': index + 1,
    'Employee Code': emp.empCode || '',
    'Full Name': `${emp.name || ''} ${emp.surname || ''}`.trim(),
    'First Name': emp.name || '',
    'Surname': emp.surname || '',
    'Gender': emp.gender || '',
    'Father/Spouse Name': emp.guardian || '',
    'Date of Birth': emp.dob || '',
    'Nationality': emp.nationality || '',
    'Education': emp.education || '',
    'Date of Joining': emp.doj || '',
    'Designation': emp.designation || '',
    'Category': emp.category || '',
    'Employment Type': emp.employmentType || '',
    'Mobile No': emp.mobile || '',
    'UAN No': emp.uan || '',
    'PAN No': emp.pan || '',
    'ESIC IP': emp.esic || '',
    'LWF': emp.lwf || '',
    'Aadhar No': emp.aadhar || '',
    'Bank Name': emp.bank || '',
    'Bank A/c No': emp.bankAccount || '',
    'IFSC Code': emp.ifsc || '',
    'Present Address': emp.presentAddress || '',
    'Permanent Address': emp.permanentAddress || '',
    'Service Book No': emp.serviceBook || '',
    'Date of Exit': emp.exitDate || 'Active',
    'Reason for Exit': emp.exitReason || '',
    'Identification Mark': emp.identification || '',
    'Job Location': emp.jobLocation || '',
    'Remarks': emp.remarks || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set nice column widths
  const colWidths = [
    { wch: 6 },  // Sr No
    { wch: 14 }, // Code
    { wch: 22 }, // Full Name
    { wch: 14 }, // First Name
    { wch: 14 }, // Surname
    { wch: 10 }, // Gender
    { wch: 20 }, // Guardian
    { wch: 13 }, // DOB
    { wch: 12 }, // Nationality
    { wch: 12 }, // Education
    { wch: 13 }, // DOJ
    { wch: 16 }, // Designation
    { wch: 14 }, // Category
    { wch: 16 }, // Emp Type
    { wch: 14 }, // Mobile
    { wch: 16 }, // UAN
    { wch: 14 }, // PAN
    { wch: 16 }, // ESIC
    { wch: 16 }, // LWF
    { wch: 16 }, // Aadhar
    { wch: 20 }, // Bank
    { wch: 18 }, // A/C No
    { wch: 14 }, // IFSC
    { wch: 35 }, // Present Addr
    { wch: 35 }, // Permanent Addr
    { wch: 16 }, // Service Book
    { wch: 13 }, // Exit Date
    { wch: 20 }, // Exit Reason
    { wch: 25 }, // Ident mark
    { wch: 20 }, // Job Location
    { wch: 25 }, // Remarks
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  XLSX.writeFile(workbook, fileName);
}

export function exportTablePDF(employees: Employee[], title = 'Employee Master Register') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header Title & Branding
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 297, 20, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Records: ${employees.length}`, 297 - 14, 13, { align: 'right' });

  const tableHead = [
    [
      'Code',
      'Name',
      'Designation',
      'Category',
      'Mobile',
      'UAN No',
      'ESIC IP',
      'Bank & A/c No',
      'Location',
      'Status'
    ]
  ];

  const tableData = employees.map(emp => [
    emp.empCode || '-',
    `${emp.name || ''} ${emp.surname || ''}`.trim() || '-',
    emp.designation || '-',
    emp.category || '-',
    emp.mobile || '-',
    emp.uan || '-',
    emp.esic || '-',
    emp.bank ? `${emp.bank} (${emp.bankAccount})` : (emp.bankAccount || '-'),
    emp.jobLocation || '-',
    emp.exitDate ? `Exited (${emp.exitDate})` : 'Active'
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableData,
    startY: 25,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
}

export function exportSingleEmployeePDF(emp: Employee) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Top header banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE RECORD DOSSIER', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employee Code: ${emp.empCode}`, 14, 19);
  doc.text(`Date of Record: ${new Date().toLocaleDateString()}`, 210 - 14, 16, { align: 'right' });

  let y = 32;

  // Photo box if present
  if (emp.photo) {
    try {
      doc.addImage(emp.photo, 'JPEG', 160, 30, 35, 42);
      doc.setDrawColor(203, 213, 225);
      doc.rect(160, 30, 35, 42);
    } catch {
      // ignore image parse issue
    }
  }

  // Section 1: Basic & Employment Profile
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 140, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PERSONAL & EMPLOYMENT DETAILS', 16, y + 5);

  y += 12;
  doc.setFontSize(9);
  const addField = (label: string, value: string | undefined, x: number, currentY: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, x, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value || 'N/A', x + 38, currentY);
  };

  addField('Full Name', `${emp.name} ${emp.surname}`.trim(), 16, y);
  addField('Gender', emp.gender, 85, y);
  y += 6;
  addField("Father's/Spouse", emp.guardian, 16, y);
  addField('Nationality', emp.nationality, 85, y);
  y += 6;
  addField('Date of Birth', emp.dob, 16, y);
  addField('Education', emp.education, 85, y);
  y += 6;
  addField('Designation', emp.designation, 16, y);
  addField('Category', emp.category, 85, y);
  y += 6;
  addField('Employment Type', emp.employmentType, 16, y);
  addField('Date of Joining', emp.doj, 85, y);
  y += 6;
  addField('Job Location', emp.jobLocation, 16, y);
  addField('Service Book No', emp.serviceBook, 85, y);

  y += 10;
  // Section 2: Statutory & Compliance
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('2. STATUTORY & COMPLIANCE REGISTRATION', 16, y + 5);

  y += 12;
  addField('UAN Number', emp.uan, 16, y);
  addField('ESIC IP Number', emp.esic, 110, y);
  y += 6;
  addField('PAN Card No', emp.pan, 16, y);
  addField('Aadhar Number', emp.aadhar, 110, y);
  y += 6;
  addField('LWF Code', emp.lwf, 16, y);
  addField('Mobile Number', emp.mobile, 110, y);

  y += 10;
  // Section 3: Bank Account Details
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('3. BANKING DETAILS', 16, y + 5);

  y += 12;
  addField('Bank Name', emp.bank, 16, y);
  addField('Bank A/c No', emp.bankAccount, 110, y);
  y += 6;
  addField('IFSC Code', emp.ifsc, 16, y);
  addField('Identification Mark', emp.identification, 110, y);

  y += 10;
  // Section 4: Address
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('4. ADDRESS & RESIDENCE', 16, y + 5);

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Present Address:', 16, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const presLines = doc.splitTextToSize(emp.presentAddress || 'N/A', 135);
  doc.text(presLines, 54, y);
  y += Math.max(presLines.length * 5, 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Permanent Address:', 16, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const permLines = doc.splitTextToSize(emp.permanentAddress || 'N/A', 135);
  doc.text(permLines, 54, y);
  y += Math.max(permLines.length * 5, 8);

  // Section 5: Exit Details & Remarks
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('5. SEPARATION DETAILS & REMARKS', 16, y + 5);

  y += 12;
  addField('Exit Date', emp.exitDate || 'Still In Service (Active)', 16, y);
  addField('Reason for Exit', emp.exitReason || 'N/A', 110, y);
  y += 6;
  addField('Remarks', emp.remarks || 'None', 16, y);

  // Signature box at the bottom
  y += 15;
  if (emp.signature) {
    try {
      doc.addImage(emp.signature, 'PNG', 140, y, 50, 18);
    } catch {
      // ignore
    }
  }
  doc.setDrawColor(148, 163, 184);
  doc.line(14, y + 20, 70, y + 20);
  doc.line(140, y + 20, 195, y + 20);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("HR Authorized Signatory", 14, y + 24);
  doc.text("Employee's Signature", 140, y + 24);

  doc.save(`${emp.empCode}_Record.pdf`);
}
