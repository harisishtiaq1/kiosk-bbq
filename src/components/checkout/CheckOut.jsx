import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'bootstrap';
const CheckOut = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const modalRef = useRef();

  const handleOrderMore = () => {
    navigate('/selection');
  };

  const session_id = (() => {
    let id = localStorage.getItem('session_id');
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('session_id', id);
    }
    return id;
  })();
  const showModal = () => {
    const modal = new Modal(modalRef.current);
    modal.show();
  };
  const handleCompleteOrder = async () => {
    try {
      const response = await axios.post('http://localhost:5000/create-order', {
        cart,
        total,
        payment_method: 'cash', // or 'card' — change based on logic
        session_id: session_id,
      });

      if (response.data.success) {
        // Close modal if open
        const modalElement = modalRef.current;
        const bsModal = Modal.getInstance(modalElement);
        if (bsModal) {
          bsModal.hide();
        }

        // Remove Bootstrap modal backdrop manually
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();

        // Sweet alert and redirect
        Swal.fire({
          title: 'Success!',
          text: 'Order has been successfully placed. Please collect it from the counter.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/selection');
        });
      } else {
        Swal.fire('Error', response.data.message, 'error');
      }
    } catch (error) {
      console.error('Order Error:', error);
      Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
    }
  };

  const handleRemoveItem = (itemId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this item from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/cart/${itemId}?session_id=${session_id}`)
          .then(() => {
            const updatedCart = cart.filter(item => item.id !== itemId);
            setCart(updatedCart);
            const updatedTotal = updatedCart.reduce(
              (acc, curr) => acc + curr.price * curr.quantity,
              0
            );
            setTotal(updatedTotal.toFixed(2));
            Swal.fire('Removed!', 'The item has been removed.', 'success');
          })
          .catch(error => {
            console.error('Remove item error:', error);
            Swal.fire('Error', 'Failed to remove item.', 'error');
          });
      }
    });
  };


  useEffect(() => {
    axios.get(`http://localhost:5000/cart?session_id=${session_id}`)
      .then(response => {
        setCart(response.data.items);
        setTotal(response.data.total.toFixed(2));
      })
      .catch(error => console.error('Cart fetch error:', error));
  }, [session_id]);

  const renderVariations = (variationJson) => {
    let parsed;
    try {
      parsed = JSON.parse(variationJson);
    } catch {
      return <p className="text-muted small">Invalid variation data</p>;
    }

    return (
      <div className="mt-2">
        {parsed.single &&
          Object.entries(parsed.single).map(([key, value]) => (
            <p className="text-muted small mb-1" key={key}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
        {parsed.multi &&
          Object.entries(parsed.multi).map(([key, values]) => (
            <div key={key} className="mb-1">
              <p className="text-muted small mb-0"><strong>{key}:</strong></p>
              <ul className="text-muted small ps-3 mb-0">
                {values.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg p-4">
        <h3 className="fw-bold mb-4">Your Order</h3>

        {cart.map((item, index) => (
          <div className="d-flex mb-4 border-bottom pb-3" key={index}>
            <img
              src={item.photo}
              className="rounded me-3"
              alt={item.title}
              width="80"
              height="80"
            />
            <div className="flex-grow-1">
              <p className="fw-medium mb-1">{item.title}</p>
              {renderVariations(item.variations)}
            </div>
            <div className="text-end">
              <p className="fw-semibold mb-1">${item.price.toFixed(2)}</p>
              <p className="text-muted small">Qty: {item.quantity}</p>
              <button
                className="btn btn-link text-danger p-0"
                onClick={() => handleRemoveItem(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="border-top pt-3 text-end">
          <p className="fs-5 fw-bold">Total: ${total}</p>
        </div>

        <div className="container mt-5">
          <div className="d-flex justify-content-between">
            <button className="btn btn-outline-secondary w-50 me-3" onClick={handleOrderMore}>
              Order More
            </button>
            <button
              onClick={showModal}
              className="btn btn-warning w-50 fw-bold text-dark"
            >
              Complete Order
            </button>
          </div>

          {/* Bootstrap Modal */}
          <div
            className="modal fade"
            id="paymentModal"
            tabIndex="-1"
            aria-labelledby="paymentModalLabel"
            aria-hidden="true"
            ref={modalRef}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-center">
                <div className="modal-header">
                  <h5 className="modal-title w-100" id="paymentModalLabel">
                    Choose Payment Method
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body d-flex justify-content-around">
                  {/* Card Payment */}
                  <button
                    className="btn btn-light border p-3"
                    onClick={() => handleCompleteOrder('card')}
                  >
                    💳 <div className="mt-2 fw-semibold">Pay by Card</div>
                  </button>

                  {/* Cash Payment */}
                  <button
                    className="btn btn-light border p-3"
                    onClick={() => handleCompleteOrder('cash')}
                  >
                    💵 <div className="mt-2 fw-semibold">Pay by Cash</div>
                  </button>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary w-100"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckOut;
