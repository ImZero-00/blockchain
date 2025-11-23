import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

/**
 * Custom Hook để kết nối MetaMask
 */
export const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Kiểm tra MetaMask có được cài đặt không
  const checkMetaMask = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Kết nối MetaMask
  const connect = async () => {
    try {
      if (!checkMetaMask()) {
        throw new Error('MetaMask chưa được cài đặt! Vui lòng cài đặt MetaMask extension.');
      }

      // Request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('Không có account nào được kết nối');
      }

      // Tạo provider và signer
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();

      setAccount(accounts[0]);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setIsConnected(true);
      setError(null);

      console.log('✅ MetaMask connected:', accounts[0]);

      return accounts[0];
    } catch (err) {
      console.error('❌ Error connecting MetaMask:', err);
      setError(err.message);
      setIsConnected(false);
      return null;
    }
  };

  // Ngắt kết nối
  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    console.log('🔌 MetaMask disconnected');
  };

  // Lắng nghe sự thay đổi account
  useEffect(() => {
    if (!checkMetaMask()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        console.log('🔄 Account changed:', accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account]);

  // Auto connect nếu đã kết nối trước đó
  useEffect(() => {
    const autoConnect = async () => {
      if (!checkMetaMask()) return;

      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });

        if (accounts.length > 0) {
          await connect();
        }
      } catch (err) {
        console.error('Auto connect failed:', err);
      }
    };

    autoConnect();
  }, []);

  return {
    account,
    provider,
    signer,
    isConnected,
    error,
    connect,
    disconnect,
    hasMetaMask: checkMetaMask()
  };
};
