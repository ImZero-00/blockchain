import { useState, useEffect } from 'react';
import { getAllProducts } from '../api/api';
import ProductCard from '../components/ProductCard';

/**
 * ProductListPage - Trang hiển thị danh sách sản phẩm
 */
function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối Backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">⏳ Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Danh sách sản phẩm</h1>
        <p className="page-subtitle">
          Chọn sản phẩm và đặt hàng. Mỗi giao dịch sẽ được ghi lên Blockchain để xác thực.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="card">
          <p>Chưa có sản phẩm nào. Vui lòng chạy seed script trong Backend.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductListPage;
