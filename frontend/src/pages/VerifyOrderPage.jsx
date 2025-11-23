import { useState } from 'react';
import { verifyOrder } from '../api/api';

/**
 * VerifyOrderPage - Trang xác minh đơn hàng từ blockchain
 */
function VerifyOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderId.trim()) {
      setError('Vui lòng nhập Order ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await verifyOrder(orderId);

      if (response.success || response.existsOnChain !== undefined) {
        setResult(response);
      } else {
        setError(response.message || 'Không thể xác minh đơn hàng');
      }

    } catch (err) {
      console.error('Error verifying order:', err);
      setError(
        err.response?.data?.message || 
        'Không thể xác minh đơn hàng. Vui lòng kiểm tra Backend và Blockchain.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-header">🔍 Xác minh đơn hàng</h2>

        <div className="alert alert-info">
          Nhập Order ID để xác minh đơn hàng trên Blockchain và so sánh với dữ liệu trong Database.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Order ID *</label>
            <input
              type="text"
              className="form-input"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Ví dụ: ORDER_1234567890_123"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Đang xác minh...' : '🔎 Xác minh'}
          </button>
        </form>

        {error && (
          <div className="alert alert-error" style={{marginTop: '20px'}}>
            {error}
          </div>
        )}

        {result && (
          <div className="verification-result">
            {/* Trạng thái tổng quan */}
            <div style={{marginTop: '20px'}}>
              <h3>📊 Kết quả xác minh</h3>
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <span className={`badge ${result.existsOnChain ? 'badge-success' : 'badge-danger'}`}>
                  {result.existsOnChain ? '✅ Tồn tại trên Blockchain' : '❌ Không tồn tại trên Blockchain'}
                </span>
                <span className={`badge ${result.existsInDatabase ? 'badge-success' : 'badge-warning'}`}>
                  {result.existsInDatabase ? '✅ Tồn tại trong Database' : '⚠️ Không có trong Database'}
                </span>
                {result.isMatched !== undefined && (
                  <span className={`badge ${result.isMatched ? 'badge-success' : 'badge-danger'}`}>
                    {result.isMatched ? '✅ Dữ liệu khớp' : '❌ Dữ liệu không khớp'}
                  </span>
                )}
              </div>
            </div>

            {/* Dữ liệu On-Chain */}
            {result.onChainData && (
              <div style={{marginTop: '20px'}}>
                <h3>🔗 Dữ liệu trên Blockchain (On-Chain)</h3>
                <div className="data-box">
                  <div className="data-row">
                    <span className="data-label">Order ID:</span>
                    <span className="data-value">{result.onChainData.orderId}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Buyer Address:</span>
                  </div>
                  <div className="transaction-hash">
                    {result.onChainData.buyer}
                  </div>
                  <div className="data-row" style={{marginTop: '10px'}}>
                    <span className="data-label">Amount:</span>
                    <span className="data-value">{result.onChainData.amountInEth} ETH</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Amount (Wei):</span>
                    <span className="data-value">{result.onChainData.amount}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Timestamp:</span>
                    <span className="data-value">{result.onChainData.timestampDate}</span>
                  </div>
                  {result.onChainData.dataHash && (
                    <>
                      <div className="data-row">
                        <span className="data-label">🔒 Data Hash:</span>
                      </div>
                      <div className="transaction-hash">
                        {result.onChainData.dataHash}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Dữ liệu Off-Chain */}
            {result.offChainData && (
              <div style={{marginTop: '20px'}}>
                <h3>💾 Dữ liệu trong Database (Off-Chain)</h3>
                <div className="data-box">
                  <div className="data-row">
                    <span className="data-label">Order ID:</span>
                    <span className="data-value">{result.offChainData.orderId}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Customer Name:</span>
                    <span className="data-value">{result.offChainData.customerName}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Product:</span>
                    <span className="data-value">{result.offChainData.productName}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Quantity:</span>
                    <span className="data-value">{result.offChainData.quantity}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Amount:</span>
                    <span className="data-value">{result.offChainData.amountInEth} ETH</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Buyer Address:</span>
                  </div>
                  <div className="transaction-hash">
                    {result.offChainData.buyerAddress}
                  </div>
                  <div className="data-row" style={{marginTop: '10px'}}>
                    <span className="data-label">Transaction Hash:</span>
                  </div>
                  <div className="transaction-hash">
                    {result.offChainData.transactionHash}
                  </div>
                  <div className="data-row" style={{marginTop: '10px'}}>
                    <span className="data-label">Block Number:</span>
                    <span className="data-value">{result.offChainData.blockNumber}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Status:</span>
                    <span className="data-value">
                      <span className={`badge badge-${result.offChainData.status === 'confirmed' ? 'success' : 'warning'}`}>
                        {result.offChainData.status}
                      </span>
                    </span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Created At:</span>
                    <span className="data-value">
                      {new Date(result.offChainData.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {result.offChainData.dataHash && (
                    <>
                      <div className="data-row">
                        <span className="data-label">🔒 Data Hash:</span>
                      </div>
                      <div className="transaction-hash">
                        {result.offChainData.dataHash}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Xác minh Hash */}
            {result.hashVerification && (
              <div style={{marginTop: '20px'}}>
                <h3>🔐 Xác minh Data Hash</h3>
                <div className={`alert ${result.hashVerification.isValid ? 'alert-success' : 'alert-error'}`}>
                  {result.hashVerification.isValid ? (
                    <>
                      <strong>✅ Hash hợp lệ!</strong>
                      <div style={{marginTop: '10px', fontSize: '14px'}}>
                        Dữ liệu off-chain khớp hoàn toàn với hash được lưu trên blockchain. 
                        Đơn hàng này đảm bảo tính toàn vẹn và không bị chỉnh sửa.
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>❌ Hash không khớp!</strong>
                      <div style={{marginTop: '10px', fontSize: '14px'}}>
                        Dữ liệu off-chain có thể đã bị thay đổi hoặc không nhất quán với blockchain.
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Sự khác biệt (nếu có) */}
            {result.differences && result.differences.length > 0 && (
              <div style={{marginTop: '20px'}}>
                <h3>⚠️ Sự khác biệt giữa On-Chain và Off-Chain</h3>
                <div className="alert alert-error">
                  {result.differences.map((diff, index) => (
                    <div key={index} style={{marginBottom: '10px'}}>
                      <strong>{diff.field}:</strong>
                      <div>On-Chain: {diff.onChain}</div>
                      <div>Off-Chain: {diff.offChain}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Không tồn tại trên blockchain */}
            {!result.existsOnChain && (
              <div style={{marginTop: '20px'}}>
                <div className="alert alert-error">
                  ❌ Đơn hàng không tồn tại trên Blockchain. Có thể đơn hàng chưa được tạo hoặc Order ID không chính xác.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyOrderPage;
