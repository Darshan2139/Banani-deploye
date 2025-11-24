import * as XLSX from 'xlsx';
import { BananaEntry } from './supabaseClient';

export const exportToExcel = (entry: BananaEntry) => {
  const workbook = XLSX.utils.book_new();
  
  // Create a worksheet
  const ws_data: any[] = [];
  
  // Add header information
  ws_data.push(['Date', new Date(entry.date).toLocaleDateString('en-IN')]);
  if (entry.dealer_name) {
    ws_data.push(['Dealer Name', entry.dealer_name]);
  }
  ws_data.push(['Rate per 20kg', `₹ ${entry.rate_per_20kg}`]);
  if (entry.payment_due_date) {
    ws_data.push(['Payment Due Date', new Date(entry.payment_due_date).toLocaleDateString('en-IN')]);
  }
  ws_data.push(['Total Weight', `${entry.grand_total} kg`]);
  ws_data.push(['Total Earned', `₹ ${entry.total_earned}`]);
  ws_data.push([]); // Empty row for spacing
  
  // Create table headers for columns
  const maxColumns = entry.columns.length;
  const headerRow: string[] = [];
  
  for (let i = 0; i < maxColumns; i++) {
    headerRow.push(`Column ${i + 1}`, '');
  }
  ws_data.push(headerRow);
  
  // Add row headers
  const subHeaderRow: string[] = [];
  for (let i = 0; i < maxColumns; i++) {
    subHeaderRow.push('Weight (kg)', 'Remark');
  }
  ws_data.push(subHeaderRow);
  
  // Add data rows (10 rows per column)
  for (let rowIdx = 0; rowIdx < 10; rowIdx++) {
    const dataRow: any[] = [];
    
    for (let colIdx = 0; colIdx < maxColumns; colIdx++) {
      const column = entry.columns[colIdx];
      const rowData = column.rows[rowIdx];
      
      if (rowData) {
        dataRow.push(rowData.weight, rowData.remark || '');
      } else {
        dataRow.push('', '');
      }
    }
    
    ws_data.push(dataRow);
  }
  
  // Add totals row
  ws_data.push([]); // Empty row
  const totalsRow: any[] = [];
  for (let i = 0; i < maxColumns; i++) {
    const column = entry.columns[i];
    totalsRow.push(`Total: ${column.columnTotal.toFixed(2)}`, '');
  }
  ws_data.push(totalsRow);
  
  // Add grand total and earnings
  ws_data.push([]);
  ws_data.push(['Grand Total (kg):', entry.grand_total.toFixed(2)]);
  ws_data.push(['Total Earned (₹):', entry.total_earned.toFixed(2)]);
  
  // Create worksheet from data
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  
  // Set column widths
  const colWidths: XLSX.ColInfo[] = [];
  for (let i = 0; i < maxColumns * 2; i++) {
    colWidths.push({ wch: 15 });
  }
  worksheet['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Banana Entry');
  
  // Generate filename
  const dateStr = new Date(entry.date).toLocaleDateString('en-IN').replace(/\//g, '-');
  const filename = `BananiExpense_${dateStr}.xlsx`;
  
  // Write the file
  XLSX.writeFile(workbook, filename);
};
