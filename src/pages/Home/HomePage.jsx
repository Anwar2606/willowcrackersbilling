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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';
import {faEdit, faSave } from '@fortawesome/free-solid-svg-icons';

const Homepage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState('');
  const [productDetails, setProductDetails] = useState([]);

  const [taxOption, setTaxOption] = useState('cgst_sgst');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customerDetails, setCustomerDetails] = useState([]);
  const [billingDetails, setBillingDetails] = useState([]); 
  const [assortedDetails, setAssortedDetails] = useState([]); 
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editedValues, setEditedValues] = useState({});
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


  const handleDelete = async (id, collectionName) => {
    console.log(`Deleting id: ${id} from ${collectionName}`);

    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef); // Delete the document from Firestore

      if (collectionName === 'customerBilling') {
        const updatedCustomerDetails = customerDetails.filter(detail => detail.id !== id);
        setCustomerDetails(updatedCustomerDetails);
      } else if (collectionName === 'billing') {
        const updatedBillingDetails = billingDetails.filter(detail => detail.id !== id);
        setBillingDetails(updatedBillingDetails);
      } else {
        console.error(`Unknown collection: ${collectionName}`);
      }
    } catch (error) {
      console.error(`Failed to delete id: ${id} from ${collectionName}`, error);
    }
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


const handleInputChange = (e, field) => {
  setEditedValues({
    ...editedValues,
    [field]: e.target.value,
  });
};





return (
  <div className="homepage-container">
    <Grid />
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
   
      
    </div>
    

          
         
  </div>
);
};

export default Homepage;