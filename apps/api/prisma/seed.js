const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('password', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@panelvpn.com' },
    update: {},
    create: {
      email: 'admin@panelvpn.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash('password', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@panelvpn.com' },
    update: {},
    create: {
      email: 'user@panelvpn.com',
      password: userPassword,
      name: 'Test User',
      role: 'USER',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Test user created:', user.email);

  // Create test cluster
  const cluster = await prisma.cluster.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Test Cluster',
      description: 'Test cluster for development',
      apiEndpoint: 'http://localhost:3001',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Test cluster created:', cluster.name);

  // Create test node
  const node = await prisma.node.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Test Node',
      hostname: 'test-node',
      ipAddress: '127.0.0.1',
      port: 8080,
      apiPort: 8081,
      status: 'ONLINE',
      clusterId: cluster.id,
      country: 'US',
      city: 'New York',
      maxConnections: 100,
      currentConnections: 5,
      bandwidthLimit: 1073741824, // 1GB
      bandwidthUsed: 10485760, // 10MB
    },
  });
  console.log('✅ Test node created:', node.name);

  // Create test subscription
  const subscription = await prisma.subscription.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Test Subscription',
      description: 'Test subscription for user',
      userId: user.id,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxConnections: 5,
      currentConnections: 1,
      bandwidthLimit: 5368709120, // 5GB
      bandwidthUsed: 52428800, // 50MB
    },
  });
  console.log('✅ Test subscription created:', subscription.name);

  // Create test monitoring data
  const monitoring = await prisma.monitoring.create({
    data: {
      nodeId: node.id,
      cpuUsage: 25.5,
      memoryUsage: 60.2,
      diskUsage: 45.8,
      networkIn: 1048576, // 1MB
      networkOut: 2097152, // 2MB
      activeConnections: 5,
      uptime: 3600, // 1 hour
      status: 'HEALTHY',
    },
  });
  console.log('✅ Test monitoring data created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });