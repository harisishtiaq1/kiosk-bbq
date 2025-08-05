import React, { useState } from 'react';
// import './PaymentModal.css'; // optional for custom styling

function PaymentModal({ show, onClose, onSelect }) {
  if (!show) return null;

  return (
    <div className="modal-backdrop show d-flex align-items-center justify-content-center">
      <div className="bg-white rounded p-4" style={{ minWidth: 400 }}>
        <h5 className="text-center mb-4 fw-bold">Choose Payment Method</h5>
        <div className="d-flex justify-content-around mb-3">
          <button
            className="btn btn-outline-light d-flex flex-column align-items-center p-3 border"
            onClick={() => onSelect('card')}
          >
            <img src="/path-to/mastercard.png" alt="Card" height="40" />
            <span className="mt-2 fw-semibold text-dark">Pay by Card</span>
          </button>
          <button
            className="btn btn-outline-light d-flex flex-column align-items-center p-3 border"
            onClick={() => onSelect('cash')}
          >
            <img src="/path-to/cash-icon.png" alt="Cash" height="40" />
            <span className="mt-2 fw-semibold text-dark">Pay by Cash</span>
          </button>
        </div>
        <div className="text-center">
          <button className="btn btn-link text-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
