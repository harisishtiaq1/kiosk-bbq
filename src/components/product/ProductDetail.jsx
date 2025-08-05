import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [basePrice, setBasePrice] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [multiOptions, setMultiOptions] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    axios.get(`http://localhost:5000/item/${id}`)
      .then(response => {
        const data = response.data;
        setProduct(data);
        setBasePrice(parseFloat(data.price));
        setTotalPrice(parseFloat(data.price));
      })
      .catch(error => console.error(error));
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const variations = JSON.parse(product.variations || '[]');
    let total = parseFloat(basePrice);

    variations.forEach(group => {
      if (group.type === 'single') {
        const selected = selectedOptions[group.name];
        const price = group.values.find(v => v.label === selected)?.optionPrice || 0;
        total += parseFloat(price);
      } else if (group.type === 'multi') {
        const selected = multiOptions[group.name] || [];
        selected.forEach(label => {
          const price = group.values.find(v => v.label === label)?.optionPrice || 0;
          total += parseFloat(price);
        });
      }
    });

    setTotalPrice((total * quantity).toFixed(2));
  }, [selectedOptions, multiOptions, product, basePrice, quantity]);

  const handleSingleSelect = (groupName, label) => {
    setSelectedOptions(prev => ({ ...prev, [groupName]: label }));
  };

  const handleMultiSelect = (groupName, label) => {
    setMultiOptions(prev => {
      const current = prev[groupName] || [];
      const isSelected = current.includes(label);
      const updated = isSelected
        ? current.filter(item => item !== label)
        : [...current, label];
      return { ...prev, [groupName]: updated };
    });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent default form submission

    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
    }

    const variationsData = JSON.stringify({
      single: selectedOptions,
      multi: multiOptions,
    });

    const payload = {
      product_id: product.id,
      session_id: sessionId,
      user_id: null,
      variations: variationsData,
      quantity: quantity,
      price: totalPrice / quantity,
      total_price: totalPrice,
    };

    try {
      await axios.post('http://localhost:5000/add-to-cart', payload);

      Swal.fire({
        icon: 'success',
        title: 'Added to Bag!',
        text: 'This item has been added to your bag.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Close'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/selection');
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while adding the item.',
      });
    }
  };

  if (!product) return <div className="text-center mt-5">Loading...</div>;

  const variations = JSON.parse(product.variations || '[]');

  return (
    <div className="container py-5">
      <form onSubmit={handleAddToCart}>
        <div className="row">
          {/* Image Column */}
          <div className="col-md-6 text-center mb-4">
            <img
              src={`/${product.photo}`}
              alt={product.title}
              className="img-fluid rounded"
              style={{ maxHeight: "auto", objectFit: 'cover', width: '70%' }}
            />
          </div>

          {/* Product Info Column */}
          <div className="col-md-6">
            <h2 className="mb-2">{product.title}</h2>
            <p className="text-muted mb-1">Base Price: ${basePrice.toFixed(2)}</p>
            <p className="h5 fw-bold mb-4">Total Price: ${totalPrice}</p>

            <div style={{ height: '350px', overflowY: 'auto' }}>
              {variations.map(group => (
                <div className="mb-4" key={group.name}>
                  <h5 className="mb-2">{group.name}{group.required === 'on' ? ' *' : ''}</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {group.values.map(item => {
                      const isSelected =
                        group.type === 'single'
                          ? selectedOptions[group.name] === item.label
                          : (multiOptions[group.name] || []).includes(item.label);

                      return (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() =>
                            group.type === 'single'
                              ? handleSingleSelect(group.name, item.label)
                              : handleMultiSelect(group.name, item.label)
                          }
                          className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                        >
                          {item.label}
                          {parseFloat(item.optionPrice) > 0
                            ? ` (+$${parseFloat(item.optionPrice).toFixed(2)})`
                            : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 d-flex align-items-center gap-2">
              <label className="fw-semibold me-2">Quantity:</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="form-control w-auto"
              />
            </div>

            <button type="submit" className="btn btn-success mt-4">Add to Cart</button>
          </div>
        </div>
      </form>
    </div>
  );
}
