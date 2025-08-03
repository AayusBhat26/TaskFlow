import fs from 'fs';
import Papa from 'papaparse';

const testImport = async () => {
  console.log('=== Testing DSA Import API ===');
  
  try {
    // Read the test CSV file
    const csvContent = fs.readFileSync('./test_import.csv', 'utf8');
    console.log('CSV Content:', csvContent);
    
    // Parse CSV
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });
    
    console.log('Parsed Data:', parsed.data);
    
    // Test the import API
    const response = await fetch('http://localhost:3000/api/dsa/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add proper auth headers here
      },
      body: JSON.stringify({
        questions: parsed.data,
        fileName: 'test_import.csv',
        importName: 'Test Import Batch'
      })
    });
    
    const result = await response.json();
    console.log('Import Result:', result);
    
  } catch (error) {
    console.error('Test Import Error:', error);
  }
};

testImport();
