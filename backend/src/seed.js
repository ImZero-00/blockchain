import prisma from './db/prisma.js';

/**
 * Script để seed dữ liệu mẫu vào database
 * Chạy: node src/seed.js
 */

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...\n');

  // Xóa dữ liệu cũ (nếu có)
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  console.log('✅ Đã xóa dữ liệu cũ\n');

  // Tạo sản phẩm mẫu
  const products = [
    {
      productId: 'PROD_001',
      name: 'Laptop Dell XPS 13',
      description: 'Laptop cao cấp, màn hình 13 inch, chip Intel Core i7',
      price: '0.5', // 0.5 ETH
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400',
      stock: 10
    },
    {
      productId: 'PROD_002',
      name: 'iPhone 15 Pro Max',
      description: 'Smartphone flagship của Apple, chip A17 Pro',
      price: '0.8', // 0.8 ETH
      image: 'https://images.unsplash.com/photo-1592286927505-2fd0cef75eba?w=400',
      stock: 15
    },
    {
      productId: 'PROD_003',
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Flagship Android với S Pen, camera 200MP',
      price: '0.7', // 0.7 ETH
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
      stock: 12
    },
    {
      productId: 'PROD_004',
      name: 'MacBook Pro 16"',
      description: 'MacBook Pro M3 Max, 16 inch, 32GB RAM',
      price: '1.2', // 1.2 ETH
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      stock: 8
    },
    {
      productId: 'PROD_005',
      name: 'Sony WH-1000XM5',
      description: 'Tai nghe chống ồn cao cấp, Bluetooth',
      price: '0.15', // 0.15 ETH
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
      stock: 25
    },
    {
      productId: 'PROD_006',
      name: 'iPad Pro 12.9"',
      description: 'iPad Pro chip M2, màn hình Liquid Retina XDR',
      price: '0.6', // 0.6 ETH
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      stock: 10
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
    console.log(`✅ Đã tạo sản phẩm: ${product.name}`);
  }

  console.log(`\n✨ Đã seed ${products.length} sản phẩm thành công!\n`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
