
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Kiosk from './components/kiosk/Kiosk'; // kiosk component
import Selection from './components/selection/Selection'; // selection page component
import ProductDetail from './components/product/ProductDetail'; // product detail component
import CheckOut from './components/checkout/CheckOut';
function App() {
  return (
   <Router>
      <Routes>
        <Route path="/" element={<Kiosk />} />
        <Route path="/selection" element={<Selection />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckOut />} />
      </Routes>
    </Router>
  );
}

export default App;
