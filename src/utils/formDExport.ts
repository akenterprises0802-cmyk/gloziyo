import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormDRecord } from '../types';
import { getDaysCountForMonth } from '../data/initialFormD';

export function exportFormDToExcel(
  records: FormDRecord[],
  periodText: string,
  selectedMonth: string,
  selectedYear: number,
  registerKeeperName = 'Ashraf Belal (Owner)',
  fileName = 'FORM_D_ATTENDANCE_GLOZIYO.xlsx'
) {
  const daysInMonth = getDaysCountForMonth(selectedMonth, selectedYear);

  // Statutory Headings rows
  const wsData: (string | number)[][] = [
    ['FORM D'],
    ['Name of Establishment :- GLOZIYO SERVICES PRIVATE LIMITED'],
    ['Name of Owner : ASHRAF BELAL'],
    [`For the Period From:- ${periodText}`],
    [`Attendance Sheet for Month: ${selectedMonth} ${selectedYear}`],
    [], // empty row
  ];

  // Build header row:
  // Sr No., Name, Place of work*, DOJ, 1, 2, 3... 30/31, Summary No. of Days, Remarks No. of hours, **Signature of Register Keeper
  const headerRow: (string | number)[] = [
    'Sr No.',
    'Name',
    'Place of work*',
    'DOJ',
  ];

  for (let d = 1; d <= daysInMonth; d++) {
    headerRow.push(d);
  }

  headerRow.push('Summary No. of Days');
  headerRow.push('Remarks No. of hours');
  headerRow.push('**Signature of Register Keeper');

  wsData.push(headerRow);

  // Add employee attendance rows
  records.forEach((rec, idx) => {
    const row: (string | number)[] = [
      rec.srNo || idx + 1,
      rec.name,
      rec.placeOfWork,
      rec.doj,
    ];

    for (let d = 1; d <= daysInMonth; d++) {
      row.push(rec.dailyAttendance[d] || '-');
    }

    row.push(rec.summaryDays);
    row.push(rec.remarksNoOfHours);
    row.push(rec.registerKeeperSignature || registerKeeperName);

    wsData.push(row);
  });

  // Bottom footer row
  wsData.push([]);
  wsData.push([
    '',
    '',
    '',
    '',
    '**Signature of Register Keeper :-',
    registerKeeperName,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = [
    { wch: 8 },  // Sr No
    { wch: 22 }, // Name
    { wch: 20 }, // Place of work
    { wch: 14 }, // DOJ
  ];

  for (let d = 1; d <= daysInMonth; d++) {
    colWidths.push({ wch: 4.5 }); // Daily columns 1..31
  }

  colWidths.push({ wch: 18 }); // Summary No. of Days
  colWidths.push({ wch: 24 }); // Remarks No. of hours
  colWidths.push({ wch: 28 }); // Signature of Register Keeper

  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'FORM D');
  XLSX.writeFile(workbook, fileName);
}

export function exportFormDToPDF(
  records: FormDRecord[],
  periodText: string,
  selectedMonth: string,
  selectedYear: number,
  registerKeeperName = 'Ashraf Belal (Owner)',
  fileName = 'FORM_D_ATTENDANCE_LEGAL_GLOZIYO.pdf'
) {
  // Format: Legal landscape (14 x 8.5 inches = 355.6 x 215.9 mm)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'legal' });
  const pageWidth = doc.internal.pageSize.width; // 355.6 mm
  const pageHeight = doc.internal.pageSize.height; // 215.9 mm
  const daysInMonth = getDaysCountForMonth(selectedMonth, selectedYear);

  // Top header banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 21, 'F');

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('FORM D - ATTENDANCE REGISTER / MUSTER ROLL', 10, 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Month & Year: ${selectedMonth} ${selectedYear}  |  Legal Landscape (8.5 × 14 in)`, 10, 15);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 10, 15, { align: 'right' });

  // Statutory Headings (Without "Heading" word)
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Name of Establishment :- GLOZIYO SERVICES PRIVATE LIMITED,', 10, 27);
  doc.text('Name of Owner : ASHRAF BELAL', 10, 32);

  doc.setTextColor(67, 56, 202); // Indigo-700
  doc.text(`For the Period From:- ${periodText}    |    Attendance Sheet for Month: ${selectedMonth} ${selectedYear}`, 10, 37);

  // Table header
  const tableHeadRow: string[] = [
    'Sr\nNo.',
    'Name',
    'Place of\nwork*',
    'DOJ',
  ];

  for (let d = 1; d <= daysInMonth; d++) {
    tableHeadRow.push(`${d}`);
  }

  tableHeadRow.push('Summary\nNo. of Days');
  tableHeadRow.push('Remarks\nNo. of hours');
  tableHeadRow.push('**Signature of\nRegister Keeper');

  const tableBody = records.map((rec, i) => {
    const row: (string | number)[] = [
      rec.srNo || i + 1,
      rec.name,
      rec.placeOfWork,
      rec.doj,
    ];

    for (let d = 1; d <= daysInMonth; d++) {
      row.push(rec.dailyAttendance[d] || '-');
    }

    row.push(rec.summaryDays);
    row.push(rec.remarksNoOfHours);
    row.push(rec.registerKeeperSignature || registerKeeperName);

    return row;
  });

  const summaryColIdx = 4 + daysInMonth;
  const remarksColIdx = 5 + daysInMonth;
  const sigColIdx = 6 + daysInMonth;

  autoTable(doc, {
    head: [tableHeadRow],
    body: tableBody,
    startY: 40,
    margin: { left: 8, right: 8, top: 40, bottom: 12 },
    theme: 'grid',
    styles: {
      fontSize: 6.2,
      cellPadding: 0.9,
      overflow: 'linebreak',
      textColor: [30, 41, 59],
      lineWidth: 0.1,
      lineColor: [203, 213, 225],
      halign: 'center',
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate 900
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' }, // Sr No
      1: { cellWidth: 28, halign: 'left', fontStyle: 'bold' }, // Name
      2: { cellWidth: 22, halign: 'left' }, // Place of work
      3: { cellWidth: 15, halign: 'center' }, // DOJ
      [summaryColIdx]: { cellWidth: 16, halign: 'center' }, // Summary Days
      [remarksColIdx]: { cellWidth: 22, halign: 'left' }, // Remarks Hours
      [sigColIdx]: { cellWidth: 26, halign: 'center' }, // Signature
    },
    didDrawPage: (data) => {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`FORM D — Legal Landscape Register • Page ${data.pageNumber}`, 8, pageHeight - 5);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(
        `**Signature of Register Keeper : _______________________ (${registerKeeperName})`,
        pageWidth - 8,
        pageHeight - 5,
        { align: 'right' }
      );
    },
  });

  doc.save(fileName);
}
