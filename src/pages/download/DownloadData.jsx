import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Your Firebase config file

const downloadFirestoreData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'billing'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const jsonData = JSON.stringify(data, null, 2); // for JSON downloadp
    triggerDownload(jsonData, 'firestore_data.json');
  } catch (error) {
    console.error("Error fetching Firestore data: ", error);
  }
};

const triggerDownload = (content, fileName) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

const DownloadFirestoreData = () => {
  return (
    <div>
      <button onClick={downloadFirestoreData}>Download Firestore Data</button>
    </div>
  );
};

export default DownloadFirestoreData;
