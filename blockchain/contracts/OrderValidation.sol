// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OrderValidation
 * @dev Smart Contract để xác thực và lưu trữ thông tin đơn hàng ecommerce trên blockchain
 * @notice Contract này cho phép tạo và xác minh các đơn hàng một cách minh bạch
 */
contract OrderValidation {
    
    // Cấu trúc dữ liệu đơn hàng
    struct Order {
        string orderId;      // ID đơn hàng duy nhất
        address buyer;       // Địa chỉ ví người mua
        uint256 amount;      // Tổng tiền đơn hàng (wei)
        uint256 timestamp;   // Thời gian tạo đơn hàng
        bytes32 dataHash;    // Hash của dữ liệu đơn hàng (SHA256)
        bool exists;         // Kiểm tra đơn hàng có tồn tại hay không
    }
    
    // Mapping lưu trữ đơn hàng theo orderId
    mapping(string => Order) public orders;
    
    // Mảng lưu danh sách tất cả orderIds để duyệt
    string[] public orderIds;
    
    // Địa chỉ owner của contract
    address public owner;
    
    // Tổng số đơn hàng
    uint256 public totalOrders;
    
    // Events
    event OrderCreated(
        string indexed orderId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp,
        bytes32 dataHash
    );
    
    event OrderVerified(
        string indexed orderId,
        address indexed verifier,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier orderNotExists(string memory _orderId) {
        require(!orders[_orderId].exists, "Order already exists");
        _;
    }
    
    modifier orderExists(string memory _orderId) {
        require(orders[_orderId].exists, "Order does not exist");
        _;
    }
    
    /**
     * @dev Constructor - Khởi tạo contract
     */
    constructor() {
        owner = msg.sender;
        totalOrders = 0;
    }
    
    /**
     * @dev Tạo đơn hàng mới trên blockchain với hash dữ liệu và buyer address
     * @param _orderId ID đơn hàng duy nhất
     * @param _amount Tổng tiền đơn hàng
     * @param _dataHash Hash SHA256 của dữ liệu đơn hàng đầy đủ
     * @param _buyer Địa chỉ ví người mua (từ database)
     */
    function createOrder(
        string memory _orderId,
        uint256 _amount,
        bytes32 _dataHash,
        address _buyer
    ) public orderNotExists(_orderId) {
        require(bytes(_orderId).length > 0, "Order ID cannot be empty");
        require(_amount > 0, "Amount must be greater than 0");
        require(_dataHash != bytes32(0), "Data hash cannot be empty");
        require(_buyer != address(0), "Buyer address cannot be zero");
        
        // Tạo đơn hàng mới với buyer address từ tham số
        orders[_orderId] = Order({
            orderId: _orderId,
            buyer: _buyer,
            amount: _amount,
            timestamp: block.timestamp,
            dataHash: _dataHash,
            exists: true
        });
        
        // Thêm vào danh sách orderIds
        orderIds.push(_orderId);
        totalOrders++;
        
        // Emit event
        emit OrderCreated(_orderId, _buyer, _amount, block.timestamp, _dataHash);
    }
    
    /**
     * @dev Xác minh đơn hàng và trả về thông tin
     * @param _orderId ID đơn hàng cần xác minh
     * @return orderId ID đơn hàng
     * @return buyer Địa chỉ người mua
     * @return amount Tổng tiền
     * @return timestamp Thời gian tạo
     * @return dataHash Hash của dữ liệu
     * @return exists Trạng thái tồn tại
     */
    function verifyOrder(string memory _orderId) 
        public 
        orderExists(_orderId)
        returns (
            string memory orderId,
            address buyer,
            uint256 amount,
            uint256 timestamp,
            bytes32 dataHash,
            bool exists
        ) 
    {
        Order memory order = orders[_orderId];
        
        // Emit event khi verify
        emit OrderVerified(_orderId, msg.sender, block.timestamp);
        
        return (
            order.orderId,
            order.buyer,
            order.amount,
            order.timestamp,
            order.dataHash,
            order.exists
        );
    }
    
    /**
     * @dev Lấy thông tin đơn hàng (view function - không tốn gas)
     * @param _orderId ID đơn hàng
     */
    function getOrder(string memory _orderId) 
        public 
        view 
        orderExists(_orderId)
        returns (
            string memory orderId,
            address buyer,
            uint256 amount,
            uint256 timestamp,
            bytes32 dataHash
        ) 
    {
        Order memory order = orders[_orderId];
        return (
            order.orderId,
            order.buyer,
            order.amount,
            order.timestamp,
            order.dataHash
        );
    }
    
    /**
     * @dev Xác minh hash dữ liệu đơn hàng
     * @param _orderId ID đơn hàng
     * @param _dataToVerify Hash cần xác minh
     * @return isValid Hash có khớp hay không
     */
    function verifyOrderHash(string memory _orderId, bytes32 _dataToVerify) 
        public 
        view 
        orderExists(_orderId)
        returns (bool isValid) 
    {
        return orders[_orderId].dataHash == _dataToVerify;
    }
    
    /**
     * @dev Kiểm tra đơn hàng có tồn tại hay không
     * @param _orderId ID đơn hàng
     */
    function checkOrderExists(string memory _orderId) 
        public 
        view 
        returns (bool) 
    {
        return orders[_orderId].exists;
    }
    
    /**
     * @dev Lấy danh sách tất cả Order IDs
     */
    function getAllOrderIds() 
        public 
        view 
        returns (string[] memory) 
    {
        return orderIds;
    }
    
    /**
     * @dev Lấy tổng số đơn hàng
     */
    function getTotalOrders() 
        public 
        view 
        returns (uint256) 
    {
        return totalOrders;
    }
    
    /**
     * @dev Lấy đơn hàng theo index
     * @param index Vị trí trong mảng orderIds
     */
    function getOrderByIndex(uint256 index) 
        public 
        view 
        returns (
            string memory orderId,
            address buyer,
            uint256 amount,
            uint256 timestamp,
            bytes32 dataHash
        ) 
    {
        require(index < orderIds.length, "Index out of bounds");
        string memory _orderId = orderIds[index];
        return getOrder(_orderId);
    }
}
