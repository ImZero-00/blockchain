import { useNavigate } from 'react-router-dom';

/**
 * ProductCard Component - Card hiển thị thông tin sản phẩm
 */
function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleOrderClick = () => {
    navigate('/checkout', { state: { product } });
  };

  const handleMetaMaskOrderClick = () => {
    navigate('/checkout-metamask', { state: { product } });
  };

  return (
    <div className="product-card">
      <img 
        src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">{product.price} ETH</div>
        <div className="product-stock">Còn lại: {product.stock} sản phẩm</div>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <button 
            className="btn btn-primary" 
            onClick={handleOrderClick}
            disabled={product.stock === 0}
            title="Backend ký giao dịch"
          >
            {product.stock > 0 ? '🛒 Đặt hàng' : 'Hết hàng'}
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleMetaMaskOrderClick}
            disabled={product.stock === 0}
            title="Bạn tự ký qua MetaMask"
            style={{fontSize: '14px'}}
          >
            🦊 MetaMask
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
