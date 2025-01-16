import { format } from 'd3-format';
import { CountyDetail } from '../../types';

export const dollarFormat = (value: number) => {
  if (value < 1000) {
    return format('$,.0f')(value);
  }
  else {
    return format('$.2s')(value);
  }
}

export const bigDollarFormat = (value: number) => {
  if (value === 0) return "$0";
  const formatter = format('$.3s');
  return formatter(value).replace("G", "B");
};

export const bigNumberFormat = (value: number) => {
  if (value === 0) return "0";
  if (value < 100000) return format('.2s')(value);
  return format('.3s')(value);
}

export const numberFormat = format(',');

// Convert JSON to CSV
const convertToCSV = (data: any[]) => {
  if (!data.length) return '';

  // Get the headers (keys) from the first object
  const headers = Object.keys(data[0]);
  // Map data rows to CSV format
  const csvRows = data.map(row => 
    headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(',')
  );
  // Combine headers and rows
  return [headers.join(','), ...csvRows].join('\n');
};

export const downloadJSONAsCSV = (jsonData: CountyDetail[], filename: string) => {

  const csvData = convertToCSV(jsonData);

  // Create a Blob from the CSV string
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

};

