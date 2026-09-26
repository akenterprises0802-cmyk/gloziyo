import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormCRecord } from '../types';

export function exportFormCToExcel(
  records: FormCRecord[],
  periodText: string,
  fileName = 'FORM_C_GLOZIYO_SERVICES.xlsx'
) {
  // Build standard statutory header rows
  const wsData = [
    ['FORM C'],
    ['Name of Establishment :- GLOZIYO SERVICES PRIVATE LIMITED'],
    ['Name of Owner : ASHRAF BELAL'],
    [`For the Period From :- ${periodText}`],
    [], // Blank row
    [
      'SI. No. in Employee register',
      'Employee Code',
      'Name',
      'Heading Recovery Type (Damage, Loss, Fine, Advance, Loans)',
      'Particulars',
      'Date of Damage/Loss*',
      'Amount (Rs.)',
      'Whether Show Cause issued*',
      'Explanation heard in presence of*',
      'Number of Instalments',
      'First Month /Year',
      'Last Month /Year',
      'Date of Complete Recovery',
      'Remarks',
    ],
  ];

  records.forEach((rec, idx) => {
    wsData.push([
      (rec.slNo || idx + 1).toString(),
      rec.empCode,
      rec.name,
      rec.recoveryType,
      rec.particulars,
      rec.dateOfDamageLoss,
      rec.amount.toString(),
      rec.whetherShowCauseIssued,
      rec.explanationHeardInPresenceOf,
      rec.numberOfInstalments.toString(),
      rec.firstMonthYear,
      rec.lastMonthYear,
      rec.dateOfCompleteRecovery,
      rec.remarks,
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 16 }, // Sl No
    { wch: 15 }, // Emp Code
    { wch: 22 }, // Name
    { wch: 18 }, // Recovery Type
    { wch: 32 }, // Particulars
    { wch: 18 }, // Date of Damage/Loss*
    { wch: 14 }, // Amount
    { wch: 24 }, // Show Cause
    { wch: 28 }, // Explanation Heard In
    { wch: 16 }, // Instalments
    { wch: 16 }, // First Month/Year
    { wch: 16 }, // Last Month/Year
    { wch: 20 }, // Date Complete Recovery
    { wch: 28 }, // Remarks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'FORM C');
  XLSX.writeFile(workbook, fileName);
}

export function exportFormCToPDF(
  records: FormCRecord[],
  periodText: string,
  fileName = 'FORM_C_GLOZIYO_SERVICES.pdf'
) {
  // Format: Legal landscape (14 x 8.5 inches = 355.6 x 215.9 mm)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'legal' });
  const pageWidth = doc.internal.pageSize.width; // 355.6 mm
  const pageHeight = doc.internal.pageSize.height; // 215.9 mm

  // Top header banner
  doc.setFillColor(30, 41, 59); // Slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('FORM C', 14, 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('STATUTORY REGISTER OF RECOVERY / DAMAGE / LOSS / FINES / ADVANCES / LOANS', 14, 16);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 16, { align: 'right' });

  // Establishment & Owner Info Block
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont('helvetica', 'bold');
  doc.text('Name of Establishment :- GLOZIYO SERVICES PRIVATE LIMITED', 14, 31);
  doc.text('Name of Owner : ASHRAF BELAL', 14, 37);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202); // Indigo-700
  doc.text(`For the Period From :- ${periodText}`, 14, 43);

  // Prepare table data
  const tableHead = [
    [
      'SI. No. in\nEmp Reg',
      'Emp\nCode',
      'Name',
      'Recovery\nType',
      'Particulars',
      'Date of\nDamage/Loss*',
      'Amount\n(Rs.)',
      'Whether Show\nCause issued*',
      'Explanation heard\nin presence of*',
      'No. of\nInst.',
      'First\nMonth/Yr',
      'Last\nMonth/Yr',
      'Date of Complete\nRecovery',
      'Remarks',
    ],
  ];

  const tableBody = records.map((r, i) => [
    r.slNo || i + 1,
    r.empCode,
    r.name,
    r.recoveryType,
    r.particulars,
    r.dateOfDamageLoss,
    `Rs. ${Number(r.amount).toLocaleString('en-IN')}`,
    r.whetherShowCauseIssued,
    r.explanationHeardInPresenceOf,
    r.numberOfInstalments,
    r.firstMonthYear,
    r.lastMonthYear,
    r.dateOfCompleteRecovery || '-',
    r.remarks || '-',
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 47,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      overflow: 'linebreak',
      textColor: [30, 41, 59],
      lineWidth: 0.1,
      lineColor: [203, 213, 225],
    },
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center' },
      1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 28, fontStyle: 'bold' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 38 },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 26 },
      8: { cellWidth: 28 },
      9: { cellWidth: 16, halign: 'center' },
      10: { cellWidth: 20, halign: 'center' },
      11: { cellWidth: 20, halign: 'center' },
      12: { cellWidth: 24, halign: 'center' },
      13: { cellWidth: 28 },
    },
    didDrawPage: (data) => {
      // Signature footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Page ' + data.pageNumber,
        14,
        pageHeight - 6
      );
      doc.text(
        'Signature of Employer / Authorized Signatory: __________________________',
        pageWidth - 14,
        pageHeight - 6,
        { align: 'right' }
      );
    },
  });

  doc.save(fileName);
}
