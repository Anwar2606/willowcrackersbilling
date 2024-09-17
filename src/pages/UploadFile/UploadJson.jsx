import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Firebase config

const UploadJSON = () => {
  const [file, setFile] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Read and upload JSON to Firestore
  const handleUpload = async () => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // Parse JSON file content
        const jsonData = JSON.parse(e.target.result);

        // Upload JSON data to Firestore
        await uploadToFirestore(jsonData);

        alert('Upload successful!');
      } catch (error) {
        console.error('Error uploading JSON:', error);
        alert('Failed to upload');
      }
    };

    reader.readAsText(file); // Read the file as text
  };

  // Upload JSON data to Firestore
  const uploadToFirestore = async (jsonData) => {
    const collectionRef = collection(db, 'willow'); // Replace with your Firestore collection

    // Check if jsonData is an array or an object and upload each item
    if (Array.isArray(jsonData)) {
      for (const item of jsonData) {
        await addDoc(collectionRef, item);
      }
    } else {
      await addDoc(collectionRef, jsonData);
    }
  };

  return (
    <div>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload JSON</button>
    </div>
  );
};

export default UploadJSON;
