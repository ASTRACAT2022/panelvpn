const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Cleaning up test data...');

  // Delete in reverse order to respect foreign key constraints
  await prisma.monitoring.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.node.deleteMany({});
  await prisma.cluster.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Cleanup completed');
}

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  // Create test users
  const testUsers = [
    {
      email: 'test1@panelvpn.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Test User 1',
      role: 'USER',
      status: 'ACTIVE',
    },
    {
      email: 'test2@panelvpn.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Test User 2',
      role: 'USER',
      status: 'ACTIVE',
    },
    {
      email: 'admin2@panelvpn.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Admin 2',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  ];

  for (const userData of testUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }

  // Create test clusters
  const testClusters = [
    {
      name: 'US East Cluster',
      description: 'US East Coast cluster',
      apiEndpoint: 'http://us-east.panelvpn.com:3001',
      status: 'ACTIVE',
    },
    {
      name: 'EU West Cluster',
      description: 'EU West cluster',
      apiEndpoint: 'http://eu-west.panelvpn.com:3001',
      status: 'ACTIVE',
    },
    {
      name: 'Asia Pacific Cluster',
      description: 'Asia Pacific cluster',
      apiEndpoint: 'http://apac.panelvpn.com:3001',
      status: 'MAINTENANCE',
    },
  ];

  const createdClusters = [];
  for (const clusterData of testClusters) {
    const cluster = await prisma.cluster.upsert({
      where: { name: clusterData.name },
      update: {},
      create: clusterData,
    });
    createdClusters.push(cluster);
  }

  // Create test nodes
  const testNodes = [
    {
      name: 'US-East-Node-1',
      hostname: 'us-east-1.panelvpn.com',
      ipAddress: '192.168.1.10',
      port: 8080,
      apiPort: 8081,
      status: 'ONLINE',
      clusterId: createdClusters[0].id,
      country: 'US',
      city: 'New York',
      maxConnections: 500,
      currentConnections: 150,
      bandwidthLimit: 10737418240, // 10GB
      bandwidthUsed: 2147483648, // 2GB
    },
    {
      name: 'US-East-Node-2',
      hostname: 'us-east-2.panelvpn.com',
      ipAddress: '192.168.1.11',
      port: 8080,
      apiPort: 8081,
      status: 'ONLINE',
      clusterId: createdClusters[0].id,
      country: 'US',
      city: 'Washington',
      maxConnections: 500,
      currentConnections: 200,
      bandwidthLimit: 10737418240, // 10GB
      bandwidthUsed: 3221225472, // 3GB
    },
    {
      name: 'EU-West-Node-1',
      hostname: 'eu-west-1.panelvpn.com',
      ipAddress: '192.168.2.10',
      port: 8080,
      apiPort: 8081,
      status: 'OFFLINE',
      clusterId: createdClusters[1].id,
      country: 'DE',
      city: 'Frankfurt',
      maxConnections: 400,
      currentConnections: 0,
      bandwidthLimit: 8589934592, // 8GB
      bandwidthUsed: 0,
    },
    {
      name: 'APAC-Node-1',
      hostname: 'apac-1.panelvpn.com',
      ipAddress: '192.168.3.10',
      port: 8080,
      apiPort: 8081,
      status: 'ONLINE',
      clusterId: createdClusters[2].id,
      country: 'JP',
      city: 'Tokyo',
      maxConnections: 300,
      currentConnections: 50,
      bandwidthLimit: 6442450944, // 6GB
      bandwidthUsed: 536870912, // 512MB
    },
  ];

  const createdNodes = [];
  for (const nodeData of testNodes) {
    const node = await prisma.node.upsert({
      where: { hostname: nodeData.hostname },
      update: {},
      create: nodeData,
    });
    createdNodes.push(node);
  }

  // Create test subscriptions
  const testSubscriptions = [
    {
      name: 'Basic Plan',
      description: 'Basic VPN subscription',
      userId: (await prisma.user.findUnique({ where: { email: 'test1@panelvpn.com' } })).id,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxConnections: 3,
      currentConnections: 1,
      bandwidthLimit: 5368709120, // 5GB
      bandwidthUsed: 1073741824, // 1GB
    },
    {
      name: 'Premium Plan',
      description: 'Premium VPN subscription',
      userId: (await prisma.user.findUnique({ where: { email: 'test2@panelvpn.com' } })).id,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      maxConnections: 5,
      currentConnections: 2,
      bandwidthLimit: 21474836480, // 20GB
      bandwidthUsed: 4294967296, // 4GB
    },
    {
      name: 'Expired Plan',
      description: 'Expired subscription',
      userId: (await prisma.user.findUnique({ where: { email: 'test1@panelvpn.com' } })).id,
      status: 'EXPIRED',
      expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      maxConnections: 2,
      currentConnections: 0,
      bandwidthLimit: 2684354560, // 2.5GB
      bandwidthUsed: 1073741824, // 1GB
    },
  ];

  for (const subscriptionData of testSubscriptions) {
    await prisma.subscription.upsert({
      where: { 
        name_userId: {
          name: subscriptionData.name,
          userId: subscriptionData.userId,
        }
      },
      update: {},
      create: subscriptionData,
    });
  }

  // Create test monitoring data
  const now = new Date();
  const monitoringData = [];

  for (const node of createdNodes) {
    // Create monitoring data for the last 24 hours (every hour)
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      monitoringData.push({
        nodeId: node.id,
        cpuUsage: Math.random() * 50 + 20, // 20-70%
        memoryUsage: Math.random() * 40 + 30, // 30-70%
        diskUsage: Math.random() * 30 + 20, // 20-50%
        networkIn: Math.floor(Math.random() * 1000000), // 0-1MB
        networkOut: Math.floor(Math.random() * 2000000), // 0-2MB
        activeConnections: Math.floor(Math.random() * node.maxConnections),
        uptime: (24 - i) * 3600, // decreasing uptime
        status: 'HEALTHY',
        createdAt: timestamp,
      });
    }
  }

  // Insert monitoring data in batches
  for (const data of monitoringData) {
    await prisma.monitoring.create({ data });
  }

  console.log('🎉 Test data seeded successfully!');
  console.log(`👥 Users: ${testUsers.length}`);
  console.log(`🏢 Clusters: ${testClusters.length}`);
  console.log(`🖥️  Nodes: ${testNodes.length}`);
  console.log(`📋 Subscriptions: ${testSubscriptions.length}`);
  console.log(`📊 Monitoring records: ${monitoringData.length}`);
}

async function main() {
  const command = process.argv[2];

  if (command === 'cleanup') {
    await cleanup();
  } else if (command === 'seed') {
    await seedTestData();
  } else {
    console.log('Usage: node seed-test.js [cleanup|seed]');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });