require('dotenv').config();
const mysql = require('mysql2/promise');

const categories = [
  [1, 'Computers & Laptops'],
  [2, 'Accessories & Peripherals'],
  [3, 'Components & Storage'],
  [4, 'Networking & Connectivity'],
  [5, 'Printers & Office'],
  [6, 'Gaming & Setup']
];

// IDs 1–24 belong to this starter catalog. Existing product IDs are updated in place
// so historical order lines keep their original product and price snapshots.
const products = [
  [1,1,'Vector Pro 15 Laptop','15.6-inch QHD display, Intel Core i7, 16GB memory and a fast 1TB NVMe drive. A versatile laptop for work and creative projects.',245000,'vector-pro-laptop'],
  [2,1,'Pulse Mini PC','Space-saving desktop with an eight-core processor, 32GB memory and 1TB SSD storage. Ready for a tidy home or office setup.',108000,'pulse-mini-pc'],
  [3,6,'Nova RTX Gaming Desktop','Gaming desktop with a Ryzen 7 processor, GeForce RTX 4070 SUPER, 32GB DDR5 memory and 1TB NVMe storage.',389000,'nova-gaming-desktop'],
  [4,3,'GeForce RTX 4070 SUPER','A powerful 12GB graphics card for high-resolution gaming, streaming and GPU-accelerated creative work.',189000,'rtx-4070-super'],
  [5,1,'Gamer 16 Performance Laptop','16-inch high-refresh display, Core i7 processor, GeForce RTX 4060 graphics, 16GB memory and 1TB storage.',279000,'gamer-16-laptop'],
  [6,2,'Arc 27 QHD Gaming Monitor','27-inch QHD IPS screen with a smooth 165Hz refresh rate, vivid colour and an adjustable stand.',54900,'arc-27-qhd-monitor'],
  [7,2,'Studio 4K Monitor','27-inch 4K IPS display with clear detail and true-to-life colour for design, photography and office work.',78900,'studio-4k-monitor'],
  [8,2,'Mechanical RGB Keyboard','Durable mechanical keys, adjustable RGB lighting and a comfortable layout for gaming and everyday typing.',8900,'mechanical-rgb-keyboard'],
  [9,2,'Wireless Precision Mouse','Comfortable wireless mouse with adjustable sensitivity, smooth tracking and long-lasting battery life.',4900,'wireless-mouse'],
  [10,6,'Studio Wireless Headset','Over-ear wireless audio with a clear detachable microphone and soft, breathable ear cushions.',13900,'studio-wireless-headset'],
  [11,5,'Full HD USB Webcam','1080p webcam with automatic light correction and a built-in stereo microphone for video calls and streaming.',5900,'full-hd-webcam'],
  [12,6,'Airflow Mesh PC Case','Mid-tower case with a ventilated front panel, clear side window and room for full-size graphics cards.',14900,'airflow-mesh-case'],
  [13,3,'PowerCore 650W Power Supply','Quiet 650W power supply with stable output and the connectors for a modern desktop build.',12900,'powercore-650w'],
  [14,3,'Ryzen 7 Gaming Processor','Eight-core AMD Ryzen 7 desktop processor built for responsive games, multitasking and content creation.',61900,'ryzen-7-cpu'],
  [15,3,'B650 Wi-Fi Motherboard','AM5 motherboard with DDR5 support, integrated Wi-Fi, high-speed M.2 storage and room to upgrade.',38900,'b650-wifi-motherboard'],
  [16,3,'GeForce RTX 4060 Graphics Card','An efficient 8GB graphics card with ray tracing and modern upscaling support for smooth 1080p gaming.',119000,'rtx-4060'],
  [17,3,'32GB DDR5 Memory Kit','Matched 32GB kit with two DDR5 modules for faster multitasking, gaming and creative applications.',18900,'32gb-ddr5-kit'],
  [18,3,'1TB NVMe SSD','Fast 1TB M.2 NVMe storage for shorter load times and more space for applications and games.',14900,'1tb-nvme-ssd'],
  [19,3,'2TB Desktop Hard Drive','Dependable 2TB hard drive for files, backups, media libraries and expanding desktop storage.',11900,'2tb-hdd'],
  [20,2,'USB-C Pro Dock','Add extra display, USB and wired network connections to a compatible laptop through one USB-C dock.',15900,'usb-c-pro-dock'],
  [21,4,'Wi-Fi 6 Dual-Band Router','Dual-band Wi-Fi 6 router with four antennas, gigabit wired ports and coverage for home or small office.',11900,'wifi-6-router'],
  [22,4,'8-Port Gigabit Network Switch','Plug-and-play metal network switch with eight gigabit Ethernet ports for a faster wired workspace.',6900,'gigabit-switch'],
  [23,5,'Laser Office Printer','Compact monochrome laser printer with crisp text output and convenient USB and wireless connectivity.',35900,'laser-office-printer'],
  [24,5,'850VA Backup UPS','Battery backup with surge protection and clear status indicators to safely protect your computer and router.',18900,'ups-850va']
];

async function seed(existingConnection) {
  const connection = existingConnection || await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jsp_eCommerce'
  });

  try {
    await connection.beginTransaction();
    await connection.query(
      'INSERT INTO categories (id, name) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)',
      [categories]
    );
    for (const [pid,category,title,details,price,image] of products) {
      await connection.query(
        'INSERT INTO products (pid, category, title, details, price, picture) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE category = VALUES(category), title = VALUES(title), details = VALUES(details), price = VALUES(price), picture = VALUES(picture)',
        [pid, category, title, details, price, '/images/catalog/product-photo-sheet.png']
      );
    }
    await connection.commit();
    console.log(`Tech catalog ready: ${products.length} computer products across ${categories.length} categories.`);
    console.log('Existing order receipts and their saved item prices remain unchanged.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    if (!existingConnection) await connection.end();
  }
}

module.exports = { seed };

if (require.main === module) {
  seed().catch(error => {
    console.error('Tech catalog setup failed:', error.message);
    process.exitCode = 1;
  });
}
