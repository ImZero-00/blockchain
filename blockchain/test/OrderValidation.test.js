const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Unit test cho OrderValidation Smart Contract
 * Test các chức năng: tạo đơn hàng, xác minh, kiểm tra tồn tại
 */
describe("OrderValidation Contract", function () {
  let orderValidation;
  let owner;
  let buyer1;
  let buyer2;

  // Deploy contract trước mỗi test
  beforeEach(async function () {
    [owner, buyer1, buyer2] = await ethers.getSigners();
    
    const OrderValidation = await ethers.getContractFactory("OrderValidation");
    orderValidation = await OrderValidation.deploy();
    await orderValidation.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Nên set đúng owner", async function () {
      expect(await orderValidation.owner()).to.equal(owner.address);
    });

    it("Nên khởi tạo totalOrders = 0", async function () {
      expect(await orderValidation.totalOrders()).to.equal(0);
    });
  });

  describe("Create Order", function () {
    it("Nên tạo đơn hàng thành công", async function () {
      const orderId = "ORDER_001";
      const amount = ethers.parseEther("0.5"); // 0.5 ETH

      // Tạo đơn hàng
      await expect(orderValidation.connect(buyer1).createOrder(orderId, amount))
        .to.emit(orderValidation, "OrderCreated")
        .withArgs(orderId, buyer1.address, amount, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));

      // Kiểm tra totalOrders tăng
      expect(await orderValidation.totalOrders()).to.equal(1);

      // Kiểm tra order tồn tại
      expect(await orderValidation.checkOrderExists(orderId)).to.equal(true);
    });

    it("Nên revert nếu orderId rỗng", async function () {
      const amount = ethers.parseEther("0.5");
      
      await expect(
        orderValidation.connect(buyer1).createOrder("", amount)
      ).to.be.revertedWith("Order ID cannot be empty");
    });

    it("Nên revert nếu amount = 0", async function () {
      const orderId = "ORDER_002";
      
      await expect(
        orderValidation.connect(buyer1).createOrder(orderId, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Nên revert nếu orderId đã tồn tại", async function () {
      const orderId = "ORDER_003";
      const amount = ethers.parseEther("0.5");

      // Tạo đơn hàng lần 1
      await orderValidation.connect(buyer1).createOrder(orderId, amount);

      // Tạo đơn hàng lần 2 với cùng orderId
      await expect(
        orderValidation.connect(buyer2).createOrder(orderId, amount)
      ).to.be.revertedWith("Order already exists");
    });
  });

  describe("Verify Order", function () {
    it("Nên verify đơn hàng thành công và trả về đúng dữ liệu", async function () {
      const orderId = "ORDER_004";
      const amount = ethers.parseEther("1.0");

      // Tạo đơn hàng
      await orderValidation.connect(buyer1).createOrder(orderId, amount);

      // Verify đơn hàng
      const result = await orderValidation.verifyOrder(orderId);
      
      expect(result[0]).to.equal(orderId); // orderId
      expect(result[1]).to.equal(buyer1.address); // buyer
      expect(result[2]).to.equal(amount); // amount
      expect(result[4]).to.equal(true); // exists
    });

    it("Nên emit event OrderVerified", async function () {
      const orderId = "ORDER_005";
      const amount = ethers.parseEther("0.3");

      await orderValidation.connect(buyer1).createOrder(orderId, amount);

      await expect(orderValidation.connect(buyer2).verifyOrder(orderId))
        .to.emit(orderValidation, "OrderVerified")
        .withArgs(orderId, buyer2.address, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
    });

    it("Nên revert nếu order không tồn tại", async function () {
      await expect(
        orderValidation.verifyOrder("NONEXISTENT_ORDER")
      ).to.be.revertedWith("Order does not exist");
    });
  });

  describe("Get Order", function () {
    it("Nên lấy thông tin đơn hàng đúng", async function () {
      const orderId = "ORDER_006";
      const amount = ethers.parseEther("2.5");

      await orderValidation.connect(buyer1).createOrder(orderId, amount);

      const order = await orderValidation.getOrder(orderId);
      
      expect(order[0]).to.equal(orderId);
      expect(order[1]).to.equal(buyer1.address);
      expect(order[2]).to.equal(amount);
    });

    it("Nên revert nếu order không tồn tại", async function () {
      await expect(
        orderValidation.getOrder("NONEXISTENT")
      ).to.be.revertedWith("Order does not exist");
    });
  });

  describe("Multiple Orders", function () {
    it("Nên tạo nhiều đơn hàng từ nhiều buyers", async function () {
      const orders = [
        { id: "ORDER_101", amount: ethers.parseEther("0.1"), buyer: buyer1 },
        { id: "ORDER_102", amount: ethers.parseEther("0.2"), buyer: buyer2 },
        { id: "ORDER_103", amount: ethers.parseEther("0.3"), buyer: buyer1 },
      ];

      for (const order of orders) {
        await orderValidation.connect(order.buyer).createOrder(order.id, order.amount);
      }

      expect(await orderValidation.totalOrders()).to.equal(3);

      // Kiểm tra getAllOrderIds
      const allOrderIds = await orderValidation.getAllOrderIds();
      expect(allOrderIds.length).to.equal(3);
      expect(allOrderIds[0]).to.equal("ORDER_101");
      expect(allOrderIds[1]).to.equal("ORDER_102");
      expect(allOrderIds[2]).to.equal("ORDER_103");
    });

    it("Nên lấy order theo index", async function () {
      await orderValidation.connect(buyer1).createOrder("ORDER_201", ethers.parseEther("1.0"));
      await orderValidation.connect(buyer2).createOrder("ORDER_202", ethers.parseEther("2.0"));

      const order = await orderValidation.getOrderByIndex(1);
      expect(order[0]).to.equal("ORDER_202");
    });

    it("Nên revert nếu index vượt quá bounds", async function () {
      await orderValidation.connect(buyer1).createOrder("ORDER_301", ethers.parseEther("1.0"));

      await expect(
        orderValidation.getOrderByIndex(10)
      ).to.be.revertedWith("Index out of bounds");
    });
  });
});
