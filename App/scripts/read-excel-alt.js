const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to the Excel file
const excelFilePath = path.join(__dirname, '../assets/questions.xlsx');

try {
  // Read the Excel file
  const workbook = XLSX.readFile(excelFilePath);

  // Get all sheet names
  console.log('Sheet names:', workbook.SheetNames);

  // Process each sheet
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\nProcessing sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    
    // Get the range of the sheet
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    console.log('Sheet range:', worksheet['!ref']);
    
    // Print some sample cells
    for (let row = range.s.r; row <= Math.min(range.e.r, 5); row++) {
      let rowData = [];
      for (let col = range.s.c; col <= Math.min(range.e.c, 5); col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        rowData.push(cell ? cell.v : undefined);
      }
      console.log(`Row ${row}:`, rowData);
    }
    
    // Try to convert to JSON
    try {
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('First few rows as JSON:');
      console.log(data.slice(0, 5));
    } catch (e) {
      console.error('Error converting to JSON:', e);
    }
  });
} catch (error) {
  console.error('Error reading Excel file:', error);
}
