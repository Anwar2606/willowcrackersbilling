import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as per your setup
import './Grid.css'; // Import CSS file for styling

const Grid = () => {
  const [numberOfBills, setNumberOfBills] = useState(0);
  const [numberOfProducts, setNumberOfProducts] = useState(0);
  const [todayTotalAmount, setTodayTotalAmount] = useState(0);
  const [todayNumberOfBills, setTodayNumberOfBills] = useState(0);

  useEffect(() => {
    // Fetch number of bills
    const fetchNumberOfBills = async () => {
      const querySnapshot = await getDocs(collection(db, 'billing'));
      const uniqueInvoiceNumbers = new Set();

      querySnapshot.forEach(doc => {
        const invoiceNumber = doc.data().invoiceNumber; // Assuming 'invoiceNumber' is the unique field
        uniqueInvoiceNumbers.add(invoiceNumber);
      });

      setNumberOfBills(uniqueInvoiceNumbers.size); // Get number of unique documents in 'billing' collection
    };

    // Fetch number of products
    const fetchNumberOfProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      setNumberOfProducts(querySnapshot.size); // Get number of documents in 'products' collection
    };

    // Fetch today's total amount and number of unique bills
    const fetchTodayMetrics = async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const todayMetricsQuery = query(
        collection(db, 'billing'),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay)
      );

      try {
        const querySnapshot = await getDocs(todayMetricsQuery);
        let totalAmount = 0;
        const uniqueInvoiceNumbers = new Set();

        querySnapshot.forEach(doc => {
          const docData = doc.data();
          const invoiceNumber = docData.invoiceNumber; // Assuming 'invoiceNumber' is the unique field

          if (!uniqueInvoiceNumbers.has(invoiceNumber)) {
            uniqueInvoiceNumbers.add(invoiceNumber);
            totalAmount += parseFloat(docData.totalAmount); // Accumulate totalAmount as float
          }
        });

        setTodayTotalAmount(totalAmount.toFixed(2)); // Set totalAmount rounded to 2 decimal places
        setTodayNumberOfBills(uniqueInvoiceNumbers.size); // Set number of unique bills for today
      } catch (error) {
        console.error('Error fetching today metrics: ', error);
      }
    };

    fetchNumberOfBills();
    fetchNumberOfProducts();
    fetchTodayMetrics();
  }, []);

  return (
    <div className="metrics-dashboard">
      <div className="metric-card atm-card">
        <h2 className="animated-text">Number of Bills</h2>
        <p className="animated-text">{numberOfBills}</p>
      </div>
      <div className="metric-card atm-card">
        <h2 className="animated-text">Number of Products</h2>
        <p className="animated-text">{numberOfProducts}</p>
      </div>
      <div className="metric-card atm-card">
        <h2 className="animated-text">Today's Total Amount</h2>
        <p className="animated-text">₹{todayTotalAmount}</p>
      </div>
      <div className="metric-card atm-card">
        <h2 className="animated-text">Today's Number of Bills</h2>
        <p className="animated-text">{todayNumberOfBills}</p>
      </div>
    </div>
  );
};

export default Grid;
