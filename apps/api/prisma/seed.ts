import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@panelvpn.com' },
    update: {},
    create: {
      email: 'admin@panelvpn.com',
      name: 'Admin',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create test cluster
  const testCluster = await prisma.cluster.upsert({
    where: { name: 'Test Cluster' },
    update: {},
    create: {
      name: 'Test Cluster',
      type: 'LOAD_BALANCE',
    },
  });

  // Create test nodes
  const nodes = await Promise.all([
    prisma.node.upsert({
      where: { id: 'node-1' },
      update: {},
      create: {
        id: 'node-1',
        name: 'US-West-1',
        ip: '192.168.1.100',
        port: 443,
        status: 'ONLINE',
        clusterId: testCluster.id,
      },
    }),
    prisma.node.upsert({
      where: { id: 'node-2' },
      update: {},
      create: {
        id: 'node-2',
        name: 'US-East-1',
        ip: '192.168.1.101',
        port: 443,
        status: 'ONLINE',
        clusterId: testCluster.id,
      },
    }),
    prisma.node.upsert({
      where: { id: 'node-3' },
      update: {},
      create: {
        id: 'node-3',
        name: 'EU-Central-1',
        ip: '192.168.1.102',
        port: 443,
        status: 'OFFLINE',
        clusterId: testCluster.id,
      },
    }),
  ]);

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'user@panelvpn.com' },
    update: {},
    create: {
      email: 'user@panelvpn.com',
      name: 'Test User',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'USER',
      status: 'ACTIVE',
      clusters: {
        connect: { id: testCluster.id },
      },
    },
  });

  // Create test subscription
  const subscription = await prisma.subscription.upsert({
    where: { id: 'sub-1' },
    update: {},
    create: {
      id: 'sub-1',
      name: 'Premium Subscription',
      uuid: '12345678-1234-1234-1234-123456789012',
      userId: testUser.id,
      clusterId: testCluster.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // Create monitoring data
  const monitoringData = await Promise.all([
    prisma.monitoring.create({
      data: {
        nodeId: 'node-1',
        upload: 1024 * 1024 * 100, // 100 MB
        download: 1024 * 1024 * 500, // 500 MB
        timestamp: new Date(),
      },
    }),
    prisma.monitoring.create({
      data: {
        nodeId: 'node-2',
        upload: 1024 * 1024 * 200, // 200 MB
        download: 1024 * 1024 * 300, // 300 MB
        timestamp: new Date(),
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@panelvpn.com / password');
  console.log('👤 Test user: user@panelvpn.com / password');
  console.log(`🖥️  Created ${nodes.length} nodes`);
  console.log(`📊 Created monitoring data for ${monitoringData.length} nodes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });