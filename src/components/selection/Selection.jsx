import React, { useEffect, useState } from 'react';
import '../selection/Selection.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
export default function Selection() {
  const [currentCategory, setCurrentCategory] = useState('all');
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const handleStartOrder = () => {
    navigate('/CheckOut');
  };
  // Generate or get existing session_id
  const session_id = (() => {
    let id = localStorage.getItem('session_id');
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('session_id', id);
    }
    return id;
  })();

  // Fetch categories
  useEffect(() => {
    axios.get('http://localhost:5000/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error(error));
  }, []);

  // Fetch items based on selected category
  useEffect(() => {
    const url = currentCategory === 'all'
      ? 'http://localhost:5000/items'
      : `http://localhost:5000/items?category_id=${currentCategory}`;

    axios.get(url)
      .then(response => setItems(response.data))
      .catch(error => console.error(error));
  }, [currentCategory]);
  console.log(session_id);

  // Fetch cart items by session_id
  useEffect(() => {
    let session_id = localStorage.getItem('session_id');
    if (!session_id) {
      session_id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('session_id', session_id);
    }
    axios.get(`http://localhost:5000/cart?session_id=${session_id}`)
      .then(response => {
        setCart(response.data.items);
        setTotal(response.data.total);
      })
      .catch(error => console.error('Cart fetch error:', error));
  }, []);
  console.log(total, 'totalPric1e');
  console.log(cart, 'cart');

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'poppins, sans-serif' }}>
      <div className='kiosk-container'>
        {/* Sidebar */}
        <div className="sidebar">
          <ul>
            <li
              className={currentCategory === 'all' ? 'active' : ''}
              onClick={() => setCurrentCategory('all')}
            >
              All
            </li>
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={currentCategory === cat.id ? 'active' : ''}
                onClick={() => setCurrentCategory(cat.id)}
              >
                {cat.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="main">
          <div className="products">
            {items.map((item, i) => (
              <Link
                to={`/product/${item.id}`}
                key={i}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="product">
                  <img src={item.photo} alt={item.title} />
                  <h4>{item.title}</h4>
                  <p>${item.price}</p>
                </div>
              </Link>
            ))}
          </div>


          <div className="footer">
            <span>Total: ${total.toFixed(2)}</span>
            <button
              className="btn"
              onClick={handleStartOrder}
              style={{
                background: '#ffc107',
                color: 'black',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              Start Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
