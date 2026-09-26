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
    'Department': emp.department || '',
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
  // Format: Legal landscape (14 x 8.5 inches = 355.6 x 215.9 mm)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'legal' });
  const pageWidth = doc.internal.pageSize.width; // 355.6 mm
  const pageHeight = doc.internal.pageSize.height; // 215.9 mm

  // Header Title & Branding
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('GLOZIYO SERVICES PRIVATE LIMITED', 14, 10);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title.toUpperCase()} (FORM A)  •  Legal Landscape (8.5 × 14 in)`, 14, 16);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | Total Records: ${employees.length}`, pageWidth - 14, 14, { align: 'right' });

  const tableHead = [
    [
      'Emp Code',
      'Employee Name',
      'Department',
      'Designation',
      'Category',
      'Employment Type',
      'DOJ',
      'Mobile No',
      'UAN No',
      'ESIC IP',
      'Bank & A/c No',
      'Work Location',
      'Status'
    ]
  ];

  const tableData = employees.map(emp => [
    emp.empCode || '-',
    `${emp.name || ''} ${emp.surname || ''}`.trim() || '-',
    emp.department || 'Engineering',
    emp.designation || '-',
    emp.category || '-',
    emp.employmentType || 'Permanent',
    emp.doj || '-',
    emp.mobile || '-',
    emp.uan || '-',
    emp.esic || '-',
    emp.bank ? `${emp.bank} (${emp.bankAccount || '-'})` : (emp.bankAccount || '-'),
    emp.jobLocation || 'Main Plant',
    emp.exitDate ? `Exited (${emp.exitDate})` : 'Active'
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableData,
    startY: 27,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineWidth: 0.1,
      lineColor: [203, 213, 225],
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data) => {
      // Signature footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Page ' + data.pageNumber,
        14,
        pageHeight - 6
      );
      doc.text(
        'Authorized HR Signatory: __________________________',
        pageWidth - 14,
        pageHeight - 6,
        { align: 'right' }
      );
    },
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_legal.pdf`);
}

export function exportSingleEmployeePDF(emp: Employee) {
  // Format: Legal landscape (14 x 8.5 inches = 355.6 x 215.9 mm)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'legal' });
  const pageWidth = doc.internal.pageSize.width; // 355.6 mm
  const pageHeight = doc.internal.pageSize.height; // 215.9 mm

  // Top header banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('GLOZIYO SERVICES PRIVATE LIMITED • EMPLOYEE MASTER RECORD (FORM A)', 14, 9.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employee Code: ${emp.empCode}  |  Service Book No: ${emp.serviceBook || '—'}  |  Format: Legal Landscape (8.5 × 14 in)`, 14, 16.5);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 16.5, { align: 'right' });

  // Two Column Layout Parameters
  const col1X = 14;
  const col1W = 160;
  const col2X = 182;
  const col2W = 160;

  const addField = (label: string, value: string | undefined, x: number, currentY: number, labelWidth = 36) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.text(`${label}:`, x, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value || 'N/A', x + labelWidth, currentY);
  };

  // --- LEFT COLUMN ---
  let yLeft = 28;

  // Section 1: Personal & Employment Tenure
  doc.setFillColor(241, 245, 249);
  doc.rect(col1X, yLeft, col1W, 6.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PERSONAL & TENURE DETAILS', col1X + 3, yLeft + 4.5);

  yLeft += 11;
  addField('Full Name', `${emp.name} ${emp.surname}`.trim(), col1X + 2, yLeft, 38);
  addField('Gender', emp.gender, col1X + 85, yLeft, 24);
  yLeft += 5.5;
  addField("Father's/Spouse", emp.guardian, col1X + 2, yLeft, 38);
  addField('Nationality', emp.nationality || 'Indian', col1X + 85, yLeft, 24);
  yLeft += 5.5;
  addField('Date of Birth', emp.dob, col1X + 2, yLeft, 38);
  addField('Education', emp.education, col1X + 85, yLeft, 24);
  yLeft += 5.5;
  addField('Department', emp.department || 'Engineering', col1X + 2, yLeft, 38);
  addField('Designation', emp.designation, col1X + 85, yLeft, 24);
  yLeft += 5.5;
  addField('Category', emp.category, col1X + 2, yLeft, 38);
  addField('Employment Type', emp.employmentType || 'Permanent', col1X + 85, yLeft, 32);
  yLeft += 5.5;
  addField('Date of Joining', emp.doj, col1X + 2, yLeft, 38);
  addField('Job Location', emp.jobLocation || 'Main Plant', col1X + 85, yLeft, 24);
  yLeft += 5.5;
  addField('Service Book No', emp.serviceBook, col1X + 2, yLeft, 38);
  addField('Identification', emp.identification || 'None', col1X + 85, yLeft, 24);

  yLeft += 8;

  // Section 2: Addresses
  doc.setFillColor(241, 245, 249);
  doc.rect(col1X, yLeft, col1W, 6.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('2. RESIDENTIAL ADDRESSES', col1X + 3, yLeft + 4.5);

  yLeft += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.text('Present Address:', col1X + 2, yLeft);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const presLines = doc.splitTextToSize(emp.presentAddress || 'N/A', col1W - 38);
  doc.text(presLines, col1X + 38, yLeft);
  yLeft += Math.max(presLines.length * 4.2, 7) + 2;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.text('Permanent Address:', col1X + 2, yLeft);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const permLines = doc.splitTextToSize(emp.permanentAddress || 'N/A', col1W - 38);
  doc.text(permLines, col1X + 38, yLeft);
  yLeft += Math.max(permLines.length * 4.2, 7) + 2;

  // Section 3: Separation & Remarks
  doc.setFillColor(241, 245, 249);
  doc.rect(col1X, yLeft, col1W, 6.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('3. SEPARATION & REMARKS', col1X + 3, yLeft + 4.5);

  yLeft += 10;
  addField('Service Status', emp.exitDate ? `Exited on ${emp.exitDate}` : 'Active (In Service)', col1X + 2, yLeft, 38);
  yLeft += 5.5;
  if (emp.exitReason) {
    addField('Exit Reason', emp.exitReason, col1X + 2, yLeft, 38);
    yLeft += 5.5;
  }
  addField('Remarks', emp.remarks || 'None', col1X + 2, yLeft, 38);

  // --- RIGHT COLUMN ---
  let yRight = 28;

  // Photo Box at Top Right
  if (emp.photo) {
    try {
      doc.addImage(emp.photo, 'JPEG', col2X + col2W - 32, yRight, 30, 36);
      doc.setDrawColor(203, 213, 225);
      doc.rect(col2X + col2W - 32, yRight, 30, 36);
    } catch {
      // ignore
    }
  }

  // Section 4: Statutory & Compliance
  doc.setFillColor(241, 245, 249);
  doc.rect(col2X, yRight, emp.photo ? col2W - 36 : col2W, 6.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('4. STATUTORY & COMPLIANCE REGISTRATION', col2X + 3, yRight + 4.5);

  yRight += 11;
  const statutoryLabelW = 32;
  addField('UAN Number', emp.uan, col2X + 2, yRight, statutoryLabelW);
  yRight += 5.5;
  addField('ESIC IP Number', emp.esic, col2X + 2, yRight, statutoryLabelW);
  yRight += 5.5;
  addField('PAN Card No', emp.pan, col2X + 2, yRight, statutoryLabelW);
  yRight += 5.5;
  addField('Aadhaar Number', emp.aadhar, col2X + 2, yRight, statutoryLabelW);
  yRight += 5.5;
  addField('LWF Code', emp.lwf, col2X + 2, yRight, statutoryLabelW);
  yRight += 5.5;
  addField('Mobile Number', emp.mobile, col2X + 2, yRight, statutoryLabelW);

  yRight += 8;

  // Section 5: Banking Details
  doc.setFillColor(241, 245, 249);
  doc.rect(col2X, yRight, col2W, 6.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('5. BANKING & DISBURSEMENT DETAILS', col2X + 3, yRight + 4.5);

  yRight += 10;
  addField('Bank Name', emp.bank, col2X + 2, yRight, 32);
  addField('IFSC Code', emp.ifsc, col2X + 85, yRight, 26);
  yRight += 5.5;
  addField('Bank A/c No', emp.bankAccount, col2X + 2, yRight, 32);
  yRight += 10;

  // Section 6: Attestation & Verification Signatures
  doc.setFillColor(241, 245, 249);
  doc.rect(col2X, yRight, col2W, 6.5, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('6. ATTESTATION & SIGNATURES', col2X + 3, yRight + 4.5);

  yRight += 12;
  if (emp.signature) {
    try {
      doc.addImage(emp.signature, 'PNG', col2X + 95, yRight, 45, 16);
    } catch {
      // ignore
    }
  }

  doc.setDrawColor(148, 163, 184);
  doc.line(col2X + 5, yRight + 20, col2X + 65, yRight + 20);
  doc.line(col2X + 90, yRight + 20, col2X + 150, yRight + 20);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("HR Authorized Signatory", col2X + 5, yRight + 25);
  doc.text("Employee's Signature / Thumb Impression", col2X + 90, yRight + 25);

  // Footer bar
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Page 1 of 1  •  Official Record under Legal Landscape 8.5 × 14 in', 14, pageHeight - 6);
  doc.text('GLOZIYO SERVICES PRIVATE LIMITED', pageWidth - 14, pageHeight - 6, { align: 'right' });

  doc.save(`${emp.empCode}_Record_Legal.pdf`);
}
