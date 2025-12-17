import * as XLSX from 'xlsx';
import { TableData } from '../types';

export const generateExcel = (data: TableData, filename: string = 'extracted_data.xlsx') => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Create a worksheet from the 2D array
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Generate and download the file
  XLSX.writeFile(wb, filename);
};
