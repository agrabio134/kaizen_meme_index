import React from 'react';
import Swal from 'sweetalert2';

const BoostModal = ({ token, isOpen, onClose }) => {
  if (!isOpen || !token) return null;

  const copyCA = () => {
    const ca = token.id;
    navigator.clipboard.writeText(ca);
    Swal.fire({
      title: 'Copied!',
      text: 'Contract address copied to clipboard',
      icon: 'success',
      timer: 1500,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      background: '#000',
      color: '#0f0',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="boost-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{token.symbol} Details</h2>
          <button onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="token-details">
            <div className="detail-row">
              <span className="label">Symbol:</span>
              <span className="value">{token.symbol}</span>
            </div>
            <div className="detail-row">
              <span className="label">Name:</span>
              <span className="value">{token.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Market Cap:</span>
              <span className="value">${token.marketCap?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Price Change:</span>
              <span className="value">{token.priceChange?.toFixed(2)}%</span>
            </div>
            <div className="detail-row">
              <span className="label">Contract Address:</span>
              <span className="value ca-address">{token.id ? `${token.id.slice(0, 8)}...${token.id.slice(-8)}` : 'N/A'}</span>
            </div>
          </div>

          <button
            className="boost-confirm-btn"
            onClick={copyCA}
          >
            📋 Copy CA
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoostModal;
