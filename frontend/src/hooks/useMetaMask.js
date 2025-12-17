import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK_CONFIG, switchToHardhatNetwork } from '../config/contract';

/**
 * Custom Hook để kết nối MetaMask và tương tác với Smart Contract
 * Phiên bản cải tiến - User ký giao dịch thực tế
 */
export const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kiểm tra MetaMask có được cài đặt không
  const checkMetaMask = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Kiểm tra network hiện tại
  const checkNetwork = async () => {
    if (!checkMetaMask()) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isCorrect = parseInt(chainId, 16) === NETWORK_CONFIG.chainId;
      setIsCorrectNetwork(isCorrect);
      return isCorrect;
    } catch (err) {
      console.error('Error checking network:', err);
      return false;
    }
  };

  // Lấy balance của account
  const getBalance = async (address, ethProvider) => {
    try {
      const bal = await ethProvider.getBalance(address);
      return ethers.formatEther(bal);
    } catch (err) {
      console.error('Error getting balance:', err);
      return '0';
    }
  };

  // Kết nối MetaMask
  const connect = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!checkMetaMask()) {
        throw new Error('MetaMask chưa được cài đặt! Vui lòng cài đặt MetaMask extension.');
      }

      // Kiểm tra và chuyển network nếu cần
      const isCorrect = await checkNetwork();
      if (!isCorrect) {
        console.log('Đang chuyển sang mạng Hardhat...');
        const switched = await switchToHardhatNetwork();
        if (!switched) {
          throw new Error('Không thể chuyển sang mạng Hardhat. Vui lòng thêm mạng thủ công.');
        }
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

      // Tạo contract instance với signer (để gọi write functions)
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS, 
        CONTRACT_ABI, 
        ethersSigner
      );

      // Lấy balance
      const bal = await getBalance(accounts[0], ethersProvider);

      setAccount(accounts[0]);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(contractInstance);
      setBalance(bal);
      setIsConnected(true);
      setIsCorrectNetwork(true);

      console.log('✅ MetaMask connected:', accounts[0]);
      console.log('💰 Balance:', bal, 'ETH');

      return { account: accounts[0], signer: ethersSigner, contract: contractInstance };
    } catch (err) {
      console.error('❌ Error connecting MetaMask:', err);
      setError(err.message);
      setIsConnected(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Ngắt kết nối
  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setBalance(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    console.log('🔌 MetaMask disconnected');
  };

  // Tạo đơn hàng trên blockchain (USER KÝ GIAO DỊCH)
  const createOrderOnChain = async (orderId, amount, dataHash) => {
    try {
      if (!contract || !signer) {
        throw new Error('Chưa kết nối MetaMask');
      }

      if (!isCorrectNetwork) {
        throw new Error('Vui lòng chuyển sang mạng Hardhat');
      }

      const signerAddress = await signer.getAddress();
      console.log('📝 Creating order on blockchain...');
      console.log('   Order ID:', orderId);
      console.log('   Amount:', amount.toString());
      console.log('   Data Hash:', dataHash);
      console.log('   Buyer:', signerAddress);

      // Gọi smart contract - USER TỰ KÝ GIAO DỊCH
      const tx = await contract.createOrder(
        orderId,
        amount,
        dataHash,
        signerAddress
      );

      console.log('⏳ Transaction submitted:', tx.hash);
      console.log('   Waiting for confirmation...');

      // Đợi transaction được confirm
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed!');
      console.log('   Block:', receipt.blockNumber);
      console.log('   Gas used:', receipt.gasUsed.toString());

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: receipt.from,
        to: receipt.to
      };
    } catch (err) {
      console.error('❌ Error creating order on chain:', err);
      
      // Xử lý các loại lỗi phổ biến
      let errorMessage = err.message;
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Bạn đã từ chối giao dịch trong MetaMask';
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Không đủ ETH để thực hiện giao dịch';
      } else if (err.message.includes('Order already exists')) {
        errorMessage = 'Order ID đã tồn tại trên blockchain';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Verify order từ blockchain
  const verifyOrderOnChain = async (orderId) => {
    try {
      if (!contract) {
        // Tạo read-only contract nếu chưa kết nối
        const readProvider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProvider);
        
        const result = await readContract.verifyOrder(orderId);
        return {
          exists: result[0],
          orderId: result[1],
          buyer: result[2],
          amount: result[3].toString(),
          dataHash: result[4],
          timestamp: result[5].toString()
        };
      }

      const result = await contract.verifyOrder(orderId);
      return {
        exists: result[0],
        orderId: result[1],
        buyer: result[2],
        amount: result[3].toString(),
        dataHash: result[4],
        timestamp: result[5].toString()
      };
    } catch (err) {
      console.error('Error verifying order:', err);
      return null;
    }
  };

  // Lắng nghe sự thay đổi account và network
  useEffect(() => {
    if (!checkMetaMask()) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (provider) {
          const bal = await getBalance(accounts[0], provider);
          setBalance(bal);
        }
        console.log('🔄 Account changed:', accounts[0]);
      }
    };

    const handleChainChanged = async (chainId) => {
      const isCorrect = parseInt(chainId, 16) === NETWORK_CONFIG.chainId;
      setIsCorrectNetwork(isCorrect);
      if (!isCorrect) {
        setError('Vui lòng chuyển sang mạng Hardhat (Chain ID: 1337)');
      } else {
        setError(null);
      }
      console.log('🔄 Network changed:', chainId, 'Is correct:', isCorrect);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, provider]);

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
    // State
    account,
    provider,
    signer,
    contract,
    balance,
    isConnected,
    isCorrectNetwork,
    error,
    loading,
    
    // Actions
    connect,
    disconnect,
    createOrderOnChain,
    verifyOrderOnChain,
    checkNetwork,
    
    // Utils
    hasMetaMask: checkMetaMask(),
    contractAddress: CONTRACT_ADDRESS,
    networkConfig: NETWORK_CONFIG
  };
};

export default useMetaMask;