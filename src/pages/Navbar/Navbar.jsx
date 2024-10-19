// import React from 'react';
// import { Link } from 'react-router-dom';
// import Logo from '../assets/WillowCrackers.png';
// import './Navbar.css';

// const Navbar = () => {
//   return (
//     <nav className="navbar">
//       <h1 className="navbar-title"><Link to="/home" ><img src={Logo} height={"90px"} alt="Home" /></Link>
          
//         </h1>
//       <ul className="navbar-list">
     
//          <li className="navbar-item">
//           <Link to="/home" className="navbar-link">Dashboard</Link>
//         </li>
//         <li className="navbar-item">
//           <Link to="/allbills" className="navbar-link">All Bills</Link>
//         </li>
//         <li className="navbar-item">
//           <Link to="/invoice" className="navbar-link">Invoice Number</Link>
//         </li>
//         <li className="navbar-item">
//           <Link to="/products" className="navbar-link">Products</Link>
//         </li>
        
//         {/* <li className="navbar-item">
//           <Link to="/multipleproducts" className="navbar-link">Add MultipleProducts</Link>
//         </li> */}
//         <li className="navbar-item">
//           <Link to="/bill" className="navbar-link">Invoice</Link>
//         </li>
//       </ul>
//     </nav>
//   );
// };

// export default Navbar;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/WillowCrackers.png';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-title">
        <Link to="/home">
          <img src={Logo} height={"90px"} alt="Home" />
        </Link>
      </h1>

      {/* Hamburger menu for mobile view */}
      <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* Navbar links */}
      <ul className={`navbar-list ${menuOpen ? 'open' : ''}`}>
        <li className="navbar-item">
          <Link to="/home" className="navbar-link">Dashboard</Link>
        </li>
        <li className="navbar-item">
          <Link to="/allbills" className="navbar-link">All Bills</Link>
        </li>
        <li className="navbar-item">
          <Link to="/editbill" className="navbar-link">Edit Bills</Link>
        </li>
        <li className="navbar-item">
          <Link to="/invoice" className="navbar-link">Invoice Number</Link>
        </li>
        <li className="navbar-item">
          <Link to="/products" className="navbar-link">Products</Link>
        </li>
        <li className="navbar-item">
          <Link to="/bill" className="navbar-link">Invoice</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
