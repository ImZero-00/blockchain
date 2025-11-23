/**
 * MetaMaskButton Component - Nút kết nối MetaMask
 */
function MetaMaskButton({ account, isConnected, hasMetaMask, onConnect, onDisconnect }) {
  
  if (!hasMetaMask) {
    return (
      <a 
        href="https://metamask.io/download/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="btn btn-warning"
        style={{fontSize: '14px'}}
      >
        🦊 Cài đặt MetaMask
      </a>
    );
  }

  if (isConnected && account) {
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <div style={{
          background: '#d4edda',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          🦊 {account.slice(0, 6)}...{account.slice(-4)}
        </div>
        <button 
          onClick={onDisconnect}
          className="btn btn-secondary"
          style={{fontSize: '14px', padding: '8px 12px'}}
        >
          Ngắt kết nối
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={onConnect}
      className="btn btn-primary"
      style={{fontSize: '14px'}}
    >
      🦊 Kết nối MetaMask
    </button>
  );
}

export default MetaMaskButton;
