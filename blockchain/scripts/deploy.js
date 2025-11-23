const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script để deploy OrderValidation Smart Contract
 * Sau khi deploy sẽ lưu địa chỉ contract vào file deployed-address.json
 */
async function main() {
  console.log("🚀 Bắt đầu deploy OrderValidation Smart Contract...");
  
  // Lấy thông tin signers (accounts)
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("\n📋 Thông tin Deployer:");
  console.log("   Địa chỉ:", deployer.address);
  console.log("   Số dư:", hre.ethers.formatEther(balance), "ETH");
  
  // Deploy contract
  console.log("\n⏳ Đang deploy contract...");
  const OrderValidation = await hre.ethers.getContractFactory("OrderValidation");
  const orderValidation = await OrderValidation.deploy();
  
  await orderValidation.waitForDeployment();
  const contractAddress = await orderValidation.getAddress();
  
  console.log("\n✅ Deploy thành công!");
  console.log("   Contract Address:", contractAddress);
  console.log("   Network:", hre.network.name);
  console.log("   Chain ID:", hre.network.config.chainId);
  
  // Lưu địa chỉ contract vào file
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contractName: "OrderValidation"
  };
  
  const outputPath = path.join(__dirname, "..", "deployed-address.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n💾 Đã lưu thông tin deployment vào:", outputPath);
  
  // Test một số hàm cơ bản
  console.log("\n🧪 Test các hàm cơ bản...");
  
  const owner = await orderValidation.owner();
  console.log("   Owner:", owner);
  
  const totalOrders = await orderValidation.totalOrders();
  console.log("   Total Orders:", totalOrders.toString());
  
  console.log("\n✨ Hoàn thành!");
  console.log("\n📌 Sử dụng địa chỉ contract này trong Backend:");
  console.log("   ", contractAddress);
}

// Xử lý lỗi
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Lỗi khi deploy:", error);
    process.exit(1);
  });
