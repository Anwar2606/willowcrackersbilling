import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import AddProduct from './pages/Add Product/AddProduct';
import ProductList from './pages/ProductList/ProductList';
import { db } from './pages/firebase';
import BillingCalculator from './pages/Dashboard/BillingCalculator';
import Navbar from './pages/Navbar/Navbar';
import './App.css';
import MultipleProducts from './pages/MultipleProducts/MultipleProducts';
import BulkUpload from './pages/BulkUpload/BulkUpload';
import EditProductPage from './pages/EditProduct/EditProduct';
import TodaySales from './pages/TodaySales/TodaySales';
import GraphComponent from './pages/Chart/SalesComparisonChart';
import HomePage from './pages/Home/HomePage';
import Grid from './pages/Grid/Grid';
import LoginPage from './pages/Login/LoginPage';
import fetchDataAndGenerateExcel from './pages/DownloadData/DownloadData';
import Edit from './pages/sampleEdit/SampleEdit';
import AllBillsPage from './pages/AllBills/AllBillsPage';
import InvoiceNumbersPage from './pages/Invoice Numbers/InvoiceNumbersPage';
import DownloadBillingData from './pages/Download bill/DownloadBillingData';
import DownloadFirestoreData from './pages/download/DownloadData';
import UploadJSON from './pages/UploadFile/UploadJson';



const App = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);
  

  const handleProductSelect = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map(p =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };
  const handleDownload = async () => {
    try {
      await fetchDataAndGenerateExcel('products');
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  };
  const handleGenerateInvoice = () => {
    const products = selectedProducts.map(product => ({
      ...product,
      total: product.price * product.quantity * (1 - product.discount / 100) * 1.18, // Apply discount and GST
    }));

    const total = products.reduce((acc, product) => acc + product.total, 0);
    setInvoiceData({ products, total });
  };
  const location = useLocation();

  // Determine if the current path is the login page
  const isLoginPage = location.pathname === '/';

  return (
    
      <div>
         <button style={{display:"none"}} onClick={handleDownload}>Download Data</button>
      {!isLoginPage && <Navbar />}
        <Routes>
        <Route path="/todaysales" element={<TodaySales />} />
        <Route path="/invoice" element={<InvoiceNumbersPage />} />
        <Route path="/downloadbill" element={<DownloadBillingData />} />
        <Route path="/download" element={<DownloadFirestoreData />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/upload" element={<UploadJSON />} />
          <Route path="/grid" element={<Grid />} />
          <Route path="/allbills" element={<AllBillsPage />} />
          <Route path="/graph" element={<GraphComponent />} />
          <Route path="/bill" element={<BillingCalculator />} />
          <Route path="/multipleproducts" element={<MultipleProducts />} />
          <Route path="/bulkupload" element={<BulkUpload />} />
          <Route path="/products" element={<ProductList />} />
        <Route path="/edit-product/:id" element={<EditProductPage />} />
        <Route path="/home" element={<HomePage />} />
          <Route path="/products" element={
            <>
              <ProductList onSelect={handleProductSelect} />
            </>
          } />
        </Routes>
      </div>
   
  );
};

export default App;
