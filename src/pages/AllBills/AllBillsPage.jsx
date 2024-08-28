// src/pages/AllBillsPage.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path if needed
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './AllBillsPage.css'
import { FaDownload, FaTrash } from 'react-icons/fa';
import { format, isValid, parseISO } from 'date-fns';

const AllBillsPage = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        // Fetch bills from 'billing' collection
        const billingSnapshot = await getDocs(collection(db, 'billing'));
        const billingData = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch bills from 'customerBilling' collection
        const customerBillingSnapshot = await getDocs(collection(db, 'customerBilling'));
        const customerBillingData = customerBillingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Combine both collections
        const allBills = [...billingData, ...customerBillingData];
        
        setBills(allBills);
      } catch (error) {
        console.error('Error fetching bills: ', error);
      }
    };

    fetchBills();
  }, []);
  const dateFormats = [
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", // ISO 8601 with milliseconds
    "yyyy-MM-dd'T'HH:mm:ss'Z'",     // ISO 8601 without milliseconds
    "yyyy-MM-dd",                    // Simple date format
    "MM/dd/yyyy",                    // US date format
    "dd/MM/yyyy"                     // European date format
];
  const generatePDF = (detail, copyType) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const borderMargin = 10; // Adjust the margin as needed
  // Function to format Firestore Timestamp or Date
  const formatDate = (timestamp) => {
    let jsDate;
  
    // Check if timestamp is undefined or null
    if (timestamp === undefined || timestamp === null) {
      console.error('Timestamp is undefined or null');
      return 'Invalid Date';
    }
  
    // Handle Timestamp type
    if (timestamp instanceof Timestamp) {
      jsDate = timestamp.toDate();
    }
    // Handle Date type
    else if (timestamp instanceof Date) {
      jsDate = timestamp;
    }
    // Handle string type
    else if (typeof timestamp === 'string') {
      jsDate = new Date(timestamp);
    }
    // Handle unexpected types
    else {
      console.error('Unexpected type for date:', typeof timestamp);
      return 'Invalid Date';
    }
  
    // Check if jsDate is a valid date
    if (isNaN(jsDate.getTime())) {
      console.error('Invalid date:', jsDate);
      return 'Invalid Date';
    }
  
    // Format the date
    return jsDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata' // Adjust timezone if needed
    });
  };
  
  // Example data (replace with actual data)
  const bill = {
    createdAt: new Timestamp(1672531200, 0) // Replace with actual Timestamp or Date
  };
  
  // Get formatted date from bill
  const formattedDate = formatDate(bill.createdAt);
  console.log('Formatted Date:', formattedDate); 
   
  

    doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);
    doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin);

  const {
    customerName,
    customerAddress,
    customerState,
    customerPhone,
    customerGSTIN,
    customerPAN
  } = detail;
  
      // doc.addImage(imgData, 'JPEG', 17, 22, 22, 22);
  doc.setFontSize(10);
  doc.setTextColor(255, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('STAR PYRO PARK', 44, 21);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('3/1320-8,SIVA NAGAR VISWANATHAM VILLAGE SIVAKASI', 44, 28);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Phone number:', 44, 35);
  doc.setFont('helvetica', 'normal');
  doc.text('8098892999', 68, 35);
  doc.setFont('helvetica', 'bold');
  doc.text('Email:', 44, 42);
  doc.setFont('helvetica', 'normal');
  doc.text('hariprakashtex@gmail.com', 54, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('State:', 44, 49);
  doc.setFont('helvetica', 'normal');
  doc.text('33-Tamil Nadu', 53, 49);
  doc.setFontSize(10);
  doc.setTextColor(255, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 138, 22);
  doc.text(copyType.toUpperCase()+" COPY", 138, 29);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Invoice Number: WC-${detail.invoiceNumber}-24`, 138, 43);
  const currentDate = new Date();
 

  doc.text(`Date: ${formattedDate}`, 138, 36);
  // doc.text(`Date: ${currentDate.toLocaleDateString()}`, 138, 36);
  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN: 33AEGFS0424L1Z4', 138, 49);

  doc.rect(14, 15, 182, 40);

  doc.setFontSize(12);
  doc.setTextColor(170, 51, 106);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO', 19, 65);
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const startX = 21;
  let startY = 72;
  const lineHeight = 8;

    const labels = [
      'Name',
      'Address',
      'State',
      'Phone',
      'GSTIN',
      'AADHAR'
    ];

    const values = [
      customerName,
      customerAddress,
      customerState,
      customerPhone,
      customerGSTIN,
      customerPAN
    ];

    const maxLabelWidth = Math.max(...labels.map(label => doc.getTextWidth(label)));

    const colonOffset = 2;
    const maxLineWidth = 160;
    const maxTextWidth = 104;

    labels.forEach((label, index) => {
      const labelText = label;
      const colonText = ':';
      const valueText = values[index];

      const colonX = startX + maxLabelWidth + colonOffset;
      const valueX = colonX + doc.getTextWidth(colonText) + colonOffset;

      const splitValueText = doc.splitTextToSize(valueText, maxTextWidth - valueX);

      doc.text(labelText, startX, startY);
      doc.text(colonText, colonX, startY);

      splitValueText.forEach((line, lineIndex) => {
        doc.text(line, valueX, startY + (lineIndex * lineHeight));
      });

      startY += lineHeight * splitValueText.length;
    });

    doc.setFontSize(12);
    doc.setTextColor(170, 51, 106);

    doc.setFont('helvetica', 'bold');
    doc.text('SHIPPED TO', 107, 65);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const initialX = 110;
    let initialY = 72;
    const lineSpacing = 8;
    const spacingBetweenLabelAndValue = 3;
    const maxValueWidth = 65;
    const labelTexts = [
      'Name',
      'Address',
      'State',
      'Phone',
      'GSTIN',
      'AADHAR'
    ];

    const valuesTexts = [
      customerName,
      customerAddress,
      customerState,
      customerPhone,
      customerGSTIN,
      customerPAN
    ];

  const maxLabelTextWidth = Math.max(...labelTexts.map(label => doc.getTextWidth(label)));

  const colonWidth = doc.getTextWidth(':');

  labelTexts.forEach((labelText, index) => {
    const valueText = valuesTexts[index];

    const labelWidth = doc.getTextWidth(labelText);
    const colonX = initialX + maxLabelTextWidth + (colonWidth / 2);

    const valueX = colonX + colonWidth + spacingBetweenLabelAndValue;

    const splitValueText = doc.splitTextToSize(valueText, maxValueWidth);

    doc.text(labelText, initialX, initialY);
    doc.text(':', colonX, initialY);

    splitValueText.forEach((line, lineIndex) => {
      doc.text(line, valueX, initialY + (lineIndex * lineSpacing));
    });

    initialY += lineSpacing * splitValueText.length;
  });

  const rectX = 14;
  const rectY = 58;
  const rectWidth = 182;
  const rectHeight = 75;

  doc.rect(rectX, rectY, rectWidth, rectHeight);

  const centerX = rectX + rectWidth / 2;

  doc.line(centerX, rectY, centerX, rectY + rectHeight);

  const tableBody = detail.productsDetails.map(item => [
    item.name || 'N/A',
    '36041000',
    item.quantity || 'N/A',
    `Rs.${item.saleprice ? item.saleprice.toFixed(2) : 'N/A'}`,
    `Rs.${item.quantity && item.saleprice ? (item.quantity * item.saleprice).toFixed(2) : 'N/A'}`
  ]);

  const totalAmount = detail.totalAmount ? `Rs.${detail.totalAmount.toFixed(2)}` : 'N/A';
  const discountedAmount = detail.discountedTotal ? `Rs.${detail.discountedTotal.toFixed(2)}` : 'N/A';
  const grandTotal = detail.grandTotal ? `Rs.${detail.grandTotal.toFixed(2)}` : 'N/A';

  doc.autoTable({
    head: [['Product Name','HSN CODE', 'Quantity', 'Price', 'Total Amount']],
    body: tableBody,
    startY: 150,
    theme: 'grid',
    styles: {
      cellPadding: 2,
      fontSize: 10,
      valign: 'middle',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    headStyles: {
      fillColor: [204, 204, 204],
      textColor: [0, 0, 0],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      halign: 'right',
      valign: 'middle'
    }
  });

  doc.autoTable({
    body: [
      ['Total Amount', totalAmount],
      ['Discounted Amount', discountedAmount],
      ['Grand Total', grandTotal]
    ],
    startY: doc.autoTable.previous.finalY + 10,
    theme: 'grid',
    styles: {
      cellPadding: 2,
      fontSize: 10,
      valign: 'middle',
      halign: 'center'
    },
    headStyles: {
      fillColor: [204, 204, 204],
      textColor: [0, 0, 0],
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      halign: 'right',
      valign: 'middle'
    }
  });
  const convertNumberToWords = (num) => {
    const numberToWords = require('number-to-words');
    return numberToWords.toWords(num);
};

const grandTotalInWords = `Rupees: ${convertNumberToWords(detail.grandTotal || 0)}`;

// Position for Grand Total in Words
const grandTotalY = pageHeight - 60; // Adjust Y coordinate as needed
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text(grandTotalInWords, 15, grandTotalY);

  const termsAndConditions = [
    'Terms & Conditions',
    '1. Goods once sold will not be taken back.',
    '2. All matters subject to "Sivakasi" jurisdiction only.'
];

// Set font and position for the terms
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
const pdfPageHeight = doc.internal.pageSize.getHeight();
const termsStartY = pdfPageHeight - 30; // Adjust as needed

termsAndConditions.forEach((line, index) => {
    doc.text(line, 15, termsStartY + (index * 7)); // Adjust X and Y coordinates as needed
});
  
const signatureText = 'Authorised Signature';
const signatureMargin = 18; // Margin from the right edge
const signatureWidth = doc.getTextWidth(signatureText);
const signatureX = pageWidth - signatureWidth - signatureMargin;
const signatureY = pageHeight - 15; // Adjust Y coordinate as needed

doc.setFontSize(10);
doc.setFont('helvetica', 'bold');
doc.text(signatureText, signatureX, signatureY);
    const fileName = `${copyType.toLowerCase()}_copy.pdf`;
    doc.save(fileName);
  };

  const handleDownloadAllPdfs = async (detail) => {
    const copyTypes = ['Transport', 'Sales', 'Office', 'Customer'];
    for (const copyType of copyTypes) {
      generatePDF(detail, copyType);
    }
  };

  const handleDelete = async (id, collectionName) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      setBills(bills.filter(bill => bill.id !== id));
    } catch (error) {
      console.error('Error deleting bill: ', error);
    }
  };

  return (
    <div className="all-bills-page">
      <h1>All Bills</h1>
      <table className="bills-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Customer Name</th>
            <th>Total Amount</th>
            <th>Date</th> {/* Added Date column */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {bills.map((bill) => {
            // Check if createdAt is a Firestore Timestamp or a date string
            const createdAt = bill.createdAt instanceof Timestamp 
              ? bill.createdAt.toDate().toLocaleDateString() 
              : new Date(bill.createdAt).toLocaleDateString();
            
            return (
              <tr key={bill.id}>
                <td>{bill.invoiceNumber}</td>
                <td>{bill.customerName}</td>
                <td>{bill.totalAmount}</td>
                <td>{createdAt}</td> {/* Display formatted date */}
                <td>
                  <FaDownload
                    className="download-icon"
                    onClick={() => handleDownloadAllPdfs(bill)}
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                  />
                  <FaTrash
                    className="delete-icon"
                    onClick={() => handleDelete(bill.id, bill.collectionName)}
                    style={{ cursor: 'pointer', color: 'red' }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AllBillsPage;
