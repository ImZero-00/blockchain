import prisma from './db/prisma.js';
import { hashPassword } from './utils/password.js';

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu với Authentication...\n');

  // Xóa dữ liệu cũ
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  console.log('✅ Đã xóa dữ liệu cũ\n');

  // Tạo Admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      fullName: 'Administrator',
      role: 'admin',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // Account #0 từ Hardhat
    }
  });
  console.log('✅ Admin user created:', admin.email, '(Password: admin123)');

  // Tạo User thường
  const userPassword = await hashPassword('user123');
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      fullName: 'Nguyễn Văn A',
      role: 'user',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' // Account #1 từ Hardhat
    }
  });
  console.log('✅ User created:', user.email, '(Password: user123)');

  // Tạo thêm 1 user không có ví
  const user2Password = await hashPassword('user456');
  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: user2Password,
      fullName: 'Trần Thị B',
      role: 'user',
      walletAddress: null // Chưa khai báo ví
    }
  });
  console.log('✅ User 2 created:', user2.email, '(Password: user456, chưa có ví)');

  console.log('\n📦 Đang tạo sản phẩm...\n');

  // Tạo sản phẩm
  const products = [
    {
      productId: 'PROD_001',
      name: 'Laptop Dell XPS 13',
      description: 'Laptop cao cấp, màn hình 13 inch, chip Intel Core i7',
      price: '0.5',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400',
      stock: 10
    },
    {
      productId: 'PROD_002',
      name: 'iPhone 15 Pro Max',
      description: 'Smartphone flagship của Apple, chip A17 Pro',
      price: '0.8',
      image: 'https://images.unsplash.com/photo-1592286927505-2fd0cef75eba?w=400',
      stock: 15
    },
    {
      productId: 'PROD_003',
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Flagship Android với S Pen, camera 200MP',
      price: '0.7',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
      stock: 12
    },
    {
      productId: 'PROD_004',
      name: 'MacBook Pro 16"',
      description: 'MacBook Pro M3 Max, 16 inch, 32GB RAM',
      price: '1.2',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      stock: 8
    },
    {
      productId: 'PROD_005',
      name: 'Sony WH-1000XM5',
      description: 'Tai nghe chống ồn cao cấp, Bluetooth',
      price: '0.15',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
      stock: 25
    },
    {
      productId: 'PROD_006',
      name: 'iPad Pro 12.9"',
      description: 'iPad Pro chip M2, màn hình Liquid Retina XDR',
      price: '0.6',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      stock: 10
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
    console.log(`✅ Product: ${product.name}`);
  }

  console.log('\n✨ Seed hoàn tất!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 THÔNG TIN ĐĂNG NHẬP:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin:');
  console.log('   Email:    admin@example.com');
  console.log('   Password: admin123');
  console.log('   Wallet:   0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  console.log('');
  console.log('👤 User 1 (có ví):');
  console.log('   Email:    user@example.com');
  console.log('   Password: user123');
  console.log('   Wallet:   0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  console.log('');
  console.log('👤 User 2 (chưa có ví):');
  console.log('   Email:    user2@example.com');
  console.log('   Password: user456');
  console.log('   Wallet:   (chưa khai báo)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
