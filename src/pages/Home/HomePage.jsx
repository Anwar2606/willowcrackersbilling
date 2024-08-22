import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../pages/firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SalesComparisonChart from '../Chart/SalesComparisonChart';
import Grid from '../Grid/Grid';
import './HomePage.css';  
import RevenueProgress from '../Revenue/RevenueProgress';
import AssortedChart from '../Assorted Chart/AssortedChat';
import AssortedProgress from '../AssortedRevenueProgress/AssortedProgress';

const Homepage = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNumbers, setInvoiceNumbers] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [customerPAN, setCustomerPAN] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [manualInvoiceNumber, setManualInvoiceNumber] = useState('');
  const [businessState, setBusinessState] = useState('YourBusinessState');
  const [searchTerm, setSearchTerm] = useState('');
  const [taxOption, setTaxOption] = useState('cgst_sgst');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customerDetails, setCustomerDetails] = useState([]);
  const [billingDetails, setBillingDetails] = useState([]); 
  const [assortedDetails, setAssortedDetails] = useState([]); 
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null); // Track currently editing detail

  // const fetchDetails = async () => {
  //   setLoading(true);
  //   const startOfDay = new Date(selectedDate);
  //   startOfDay.setHours(0, 0, 0, 0);
  //   const endOfDay = new Date(selectedDate);
  //   endOfDay.setHours(23, 59, 59, 999);
    
  //   const startTimestamp = Timestamp.fromDate(startOfDay);
  //   const endTimestamp = Timestamp.fromDate(endOfDay);
  
  //   const detailsQuery = query(
  //     collection(db, 'customerBilling'),
  //     where('date', '>=', startTimestamp),
  //     where('date', '<=', endTimestamp)
  //   );
  
  //   try {
  //     const querySnapshot = await getDocs(detailsQuery);
  //     const detailsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  //     // Deduplicate based on invoice number
  //     const uniqueDetails = {};
  //     detailsData.forEach(detail => {
  //       uniqueDetails[detail.invoiceNumber] = detail; // Will overwrite duplicates
  //     });
  //     setDetails(Object.values(uniqueDetails)); // Convert back to array
  //   } catch (error) {
  //     console.error('Error fetching details: ', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // useEffect(() => {
  //   fetchDetails();
  // }, [selectedDate]);
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const startTimestamp = Timestamp.fromDate(startOfDay);
      const endTimestamp = Timestamp.fromDate(endOfDay);

      const customerQuery = query(
        collection(db, 'customerBilling'),
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp)
      );

      const billingQuery = query(
        collection(db, 'billing'),
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp)
      );

      try {
        const customerSnapshot = await getDocs(customerQuery);
        const customerData = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const billingSnapshot = await getDocs(billingQuery);
        const billingData = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setCustomerDetails(customerData);
        setBillingDetails(billingData);
      } catch (error) {
        console.error('Error fetching details: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedDate]);

  // Reuse existing functions (handleDelete, handleEdit, handleSave, handleDownloadPDF, handleGeneratePDF)



  const handleDelete = (id) => {
    setCustomerDetails(customerDetails.filter(detail => detail.id !== id));
  };
  
  
  const handleEdit = (detail) => {
    setEditingDetail({ ...detail });
  };

  const handleSave = () => {
    const updatedDetails = customerDetails.map(detail =>
      detail.id === editingDetail.id ? editingDetail : detail
    );
    setCustomerDetails(updatedDetails);
    setEditingDetail(null);
  };

  const handleDownloadPDF = (data, fileName) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); 
    const tableColumn = ['Customer Name', 'Phone No', 'Email ID', 'Purchase Details', 'CGST', 'SGST', 'IGST', 'Grand Total'];
    const tableRows = [];

    data.forEach((detail) => {
      const detailData = [
        detail.customerName,
        detail.customerPhone || 'N/A',
        detail.customerEmail || 'N/A',
        `Rs.${detail.totalAmount ? detail.totalAmount.toFixed(0) : 'N/A'}`,
        `Rs.${detail.cgstAmount ? detail.cgstAmount.toFixed(0) : 'N/A'}`,
        `Rs.${detail.sgstAmount ? detail.sgstAmount.toFixed(0) : 'N/A'}`,
        `Rs.${detail.igstAmount ? detail.igstAmount.toFixed(0) : 'N/A'}`,
        `Rs.${detail.grandTotal ? detail.grandTotal.toFixed(0) : 'N/A'}`,
      ];
      tableRows.push(detailData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text('Details by Date', 14, 15);
    doc.save(`${fileName}.pdf`);
  };
  const handleChange = (e) => {
    setEditingDetail({ ...editingDetail, totalAmount: e.target.value });
  };
  const handleCancelEdit = () => {
    setEditingDetail(null); // Clear editing state
  };

  const handleGeneratePDF = (detail) => {
    const doc = new jsPDF();
    const currentDate = new Date();   
     
    // Add a page border
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const borderMargin = 10; // Adjust the margin as needed
  
    // Draw the page border
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
  doc.text('CUSTOMER COPY', 138, 29);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Invoice Number: WC-${detail.invoiceNumber}-24`, 138, 43);
  doc.text(`Date: ${currentDate.toLocaleDateString()}`, 138, 36);
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
 
  
  
  doc.save(`invoice_${detail.invoiceNumber}.pdf`);
  };
  


//   return (
//     <div className="homepage-container">
//       <Grid/>
//       <div className="grid-container">
//         <div className="sales-comparison-chart">
//           <SalesComparisonChart />
//         </div>
//         <div className="revenue-progress">
//           <RevenueProgress />
//         </div>
        
//       </div>
//       <div className="grid-container">
//         <div className="sales-comparison-chart">
//           <AssortedChart />
//         </div>
//         <div className="revenue-progress">
//           <AssortedProgress />
//         </div>
        
//       </div>
//       <h2 className='dateTitle'>Details By Date</h2>
//       <div className="date-button-container">
//         <DatePicker
//           selected={selectedDate}
//           onChange={(date) => setSelectedDate(date)}
//           dateFormat="dd/MM/yyyy"
//           className="custom-date"
//         />
//         <button onClick={handleDownloadPDF} className="download-button">Download Today's Data</button>
//       </div>
//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="table-container">
//           {details.length === 0 ? (
//             <p>No details recorded on this date.</p>
//           ) : (
//             <table className="details-table">
//               <thead>
//                 <tr>
//                   <th>Customer Name</th>
//                   <th>Discount Amount</th>
//                   <th>CGST Amount</th>
//                   <th>SGST Amount</th>
//                   <th>IGST Amount</th>
//                   <th>Total Amount</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {details.map(detail => (
//                   <tr key={detail.id}>
//                     <td>
//                       {editingDetail && editingDetail.id === detail.id ? (
//                         <input
//                           type="text"
//                           value={editingDetail.customerName}
//                           onChange={(e) => setEditingDetail({ ...editingDetail, customerName: e.target.value })}
//                         />
//                       ) : (
//                         detail.customerName
//                       )}
//                     </td>
//                     <td>₹{detail.discountedTotal ? detail.discountedTotal.toFixed(2) : 'N/A'}</td>
//                     <td>₹{detail.cgstAmount ? detail.cgstAmount.toFixed(2) : 'N/A'}</td>
//                     <td>₹{detail.sgstAmount ? detail.sgstAmount.toFixed(2) : 'N/A'}</td>
//                     <td>₹{detail.igstAmount ? detail.igstAmount.toFixed(2) : 'N/A'}</td>
//                     <td>
//                       {editingDetail && editingDetail.id === detail.id ? (
//                         <input
//                           type="text"
//                           value={editingDetail.totalAmount}
//                           onChange={(e) => setEditingDetail({ ...editingDetail, totalAmount: e.target.value })}
//                         />
//                       ) : (
//                         `₹${detail.totalAmount}`
//                       )}
//                     </td>
//                     <td className="button-cell">
//                       {editingDetail && editingDetail.id === detail.id ? (
//                         <>
//                           <button className="action-button" onClick={handleSave}>Save</button>
//                           <button className="action-button" onClick={handleCancelEdit}>Cancel</button>
//                         </>
//                       ) : (
//                         <button className="action-button" onClick={() => handleEdit(detail)}><i className="fas fa-edit"></i></button>
//                       )}
//                       <button className="action-button" onClick={() => handleDelete(detail.id)}><i className="fas fa-trash-alt"></i></button>
//                       <button className="action-button" onClick={() => handleGeneratePDF(detail)}><i className="fa fa-download"></i></button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       )}
//       <a href='https://www.tamizhasolutions.com/' className="footer-link">
//         Developed by Tamizha Software Solutionss
//       </a>
//     </div>
//   );
// };  

// export default Homepage;
return (
  <div className="homepage-container">
    <Grid/>
    <div className="grid-container">
      <div className="sales-comparison-chart">
        <SalesComparisonChart />
      </div>
      <div className="revenue-progress">
        <RevenueProgress />
      </div>
    </div>
    <div className="grid-container">
      <div className="sales-comparison-chart">
        <AssortedChart />
      </div>
      <div className="revenue-progress">
        <AssortedProgress />
      </div>
    </div>
    <h2 className="dateTitle">Details By Date</h2>
    <div className="date-button-container">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
        className="custom-date"
      />
      <button
        onClick={() => handleDownloadPDF([...customerDetails, ...billingDetails], 'Todays Data')}
        className="download-button"
      >
        Download Today's Data
      </button>
    </div>
    {loading ? (
  <p>Loading...</p>
) : (
  <div className="table-container">
    {customerDetails.length === 0 && billingDetails.length === 0 ? (
      <p>No details recorded on this date.</p>
    ) : (
      <table className="details-table">
        <thead>
          <tr>
            <th>Collection Name</th>
            <th>Customer Name</th>
            <th>Discount Amount</th>
            <th>CGST Amount</th>
            <th>SGST Amount</th>
            <th>IGST Amount</th>
            <th>Total Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Render customerBilling collection details */}
          {customerDetails.map((detail) => (
            <tr key={detail.id}>
              <td>Customer Billing</td> {/* Collection Name */}
              <td>{detail.customerName}</td>
              <td>₹{detail.discountedTotal ? detail.discountedTotal.toFixed(2) : 'N/A'}</td>
              <td>₹{detail.cgstAmount ? detail.cgstAmount.toFixed(2) : 'N/A'}</td>
              <td>₹{detail.sgstAmount ? detail.sgstAmount.toFixed(2) : 'N/A'}</td>
              <td>₹{detail.igstAmount ? detail.igstAmount.toFixed(2) : 'N/A'}</td>
              <td>₹{detail.totalAmount ? detail.totalAmount.toFixed(2) : '0.00'}</td>
              <td>
              <td>
 
  <button onClick={() => handleGeneratePDF(detail)} className="action-button">
    <i className="fa fa-download" aria-hidden="true"></i>
  </button>
  <button onClick={() => handleDelete(detail.id)} className="action-button">
    <i className="fa fa-trash" aria-hidden="true"></i>
  </button>
</td>
              </td>
            </tr>
          ))}
          {/* Render billing collection details */}
          {billingDetails.map((detail) => (
            <tr key={detail.id}>
              <td>Billing</td> {/* Collection Name */}
              <td>{detail.customerName}</td>
              <td>₹{detail.discountedTotal ? detail.discountedTotal.toFixed(2) : 'N/A'}</td>
              <td>₹{detail.cgstAmount ? detail.cgstAmount.toFixed(2) : 'N/A'}</td>
              <td>₹{detail.sgstAmount ? detail.sgstAmount.toFixed(2) : 'N/A'}</td>
              <td>₹{detail.igstAmount ? detail.igstAmount.toFixed(2) : 'N/A'}</td>
              <td>₹{detail.totalAmount ? detail.totalAmount.toFixed(2) : '0.00'}</td>
              <td>
              <td>

  <button onClick={() => handleGeneratePDF(detail)} className="action-button">
    <i className="fa fa-download" aria-hidden="true"></i>
  </button>
  <button onClick={() => handleDelete(detail.id)} className="action-button">
    <i className="fa fa-trash" aria-hidden="true"></i>
  </button>
</td>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}

  </div>
);
};

export default Homepage;