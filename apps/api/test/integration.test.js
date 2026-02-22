const axios = require('axios');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

class TestRunner {
  constructor() {
    this.results = [];
    this.authToken = null;
    this.testUser = null;
  }

  async runTest(name, testFn) {
    try {
      console.log(`🧪 Running: ${name}`);
      await testFn();
      this.results.push({ name, status: 'PASS', error: null });
      console.log(`✅ ${name} - PASSED`);
    } catch (error) {
      this.results.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
  }

  async setup() {
    console.log('🔧 Setting up test environment...');
    
    // Create test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    this.testUser = await prisma.user.create({
      data: {
        email: 'integration-test@panelvpn.com',
        password: hashedPassword,
        name: 'Integration Test User',
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    // Create test cluster and node
    const cluster = await prisma.cluster.create({
      data: {
        name: 'Integration Test Cluster',
        description: 'Test cluster for integration tests',
        apiEndpoint: 'http://localhost:3001',
        status: 'ACTIVE',
      },
    });

    await prisma.node.create({
      data: {
        name: 'Integration Test Node',
        hostname: 'test-node-integration',
        ipAddress: '127.0.0.1',
        port: 8080,
        apiPort: 8081,
        status: 'ONLINE',
        clusterId: cluster.id,
        country: 'US',
        city: 'Test City',
        maxConnections: 100,
        currentConnections: 0,
        bandwidthLimit: 1073741824, // 1GB
        bandwidthUsed: 0,
      },
    });

    console.log('✅ Test environment setup completed');
  }

  async teardown() {
    console.log('🧹 Cleaning up test data...');
    
    await prisma.monitoring.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.node.deleteMany({});
    await prisma.cluster.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: 'integration-test@panelvpn.com' },
    });

    console.log('✅ Cleanup completed');
  }

  async authenticate() {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'integration-test@panelvpn.com',
      password: 'testpassword',
    });
    this.authToken = response.data.access_token;
    return this.authToken;
  }

  async runAllTests() {
    console.log('🚀 Starting integration tests...\n');

    await this.setup();

    // Authentication Tests
    await this.runTest('User Registration', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: 'newuser@panelvpn.com',
        password: 'newpassword',
        name: 'New User',
      });
      if (response.status !== 201) throw new Error('Registration failed');
    });

    await this.runTest('User Login', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'integration-test@panelvpn.com',
        password: 'testpassword',
      });
      if (response.status !== 200) throw new Error('Login failed');
      if (!response.data.access_token) throw new Error('No token received');
    });

    await this.runTest('Get User Profile', async () => {
      const token = await this.authenticate();
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Profile fetch failed');
      if (response.data.email !== 'integration-test@panelvpn.com') throw new Error('Wrong user data');
    });

    // User Management Tests
    await this.runTest('Get All Users (Admin)', async () => {
      const token = await this.authenticate();
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Users fetch failed');
      if (!Array.isArray(response.data)) throw new Error('Invalid response format');
    });

    await this.runTest('Get User by ID', async () => {
      const token = await this.authenticate();
      const response = await axios.get(`${API_BASE_URL}/users/${this.testUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('User fetch failed');
      if (response.data.id !== this.testUser.id) throw new Error('Wrong user data');
    });

    // Cluster Management Tests
    await this.runTest('Get All Clusters', async () => {
      const token = await this.authenticate();
      const response = await axios.get(`${API_BASE_URL}/clusters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Clusters fetch failed');
      if (!Array.isArray(response.data)) throw new Error('Invalid response format');
    });

    await this.runTest('Create New Cluster', async () => {
      const token = await this.authenticate();
      const response = await axios.post(`${API_BASE_URL}/clusters`, {
        name: 'Test Cluster New',
        description: 'New test cluster',
        apiEndpoint: 'http://localhost:3002',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 201) throw new Error('Cluster creation failed');
    });

    // Node Management Tests
    await this.runTest('Get All Nodes', async () => {
      const token = await this.authenticate();
      const response = await axios.get(`${API_BASE_URL}/nodes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Nodes fetch failed');
      if (!Array.isArray(response.data)) throw new Error('Invalid response format');
    });

    await this.runTest('Get Node by ID', async () => {
      const token = await this.authenticate();
      const nodes = await prisma.node.findMany();
      const nodeId = nodes[0].id;
      const response = await axios.get(`${API_BASE_URL}/nodes/${nodeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Node fetch failed');
      if (response.data.id !== nodeId) throw new Error('Wrong node data');
    });

    // Subscription Tests
    await this.runTest('Get All Subscriptions', async () => {
      const token = await this.authenticate();
      const response = await axios.get(`${API_BASE_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Subscriptions fetch failed');
      if (!Array.isArray(response.data)) throw new Error('Invalid response format');
    });

    await this.runTest('Create Subscription', async () => {
      const token = await this.authenticate();
      const response = await axios.post(`${API_BASE_URL}/subscriptions`, {
        name: 'Test Subscription',
        description: 'Test subscription',
        userId: this.testUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxConnections: 3,
        bandwidthLimit: 5368709120, // 5GB
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 201) throw new Error('Subscription creation failed');
    });

    // Monitoring Tests
    await this.runTest('Get Monitoring Data', async () => {
      const token = await this.authenticate();
      const response = await axios.get(`${API_BASE_URL}/monitoring`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Monitoring fetch failed');
      if (!Array.isArray(response.data)) throw new Error('Invalid response format');
    });

    await this.runTest('Get Node Statistics', async () => {
      const token = await this.authenticate();
      const nodes = await prisma.node.findMany();
      const nodeId = nodes[0].id;
      const response = await axios.get(`${API_BASE_URL}/monitoring/stats/${nodeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Node statistics fetch failed');
    });

    // Health Check Tests
    await this.runTest('API Health Check', async () => {
      const response = await axios.get(`${API_BASE_URL}/health`);
      if (response.status !== 200) throw new Error('Health check failed');
      if (response.data.status !== 'ok') throw new Error('Health check returned unhealthy');
    });

    // Error Handling Tests
    await this.runTest('Invalid Authentication', async () => {
      try {
        await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: 'Bearer invalid-token' },
        });
        throw new Error('Should have failed with invalid token');
      } catch (error) {
        if (error.response?.status !== 401) throw new Error('Expected 401 Unauthorized');
      }
    });

    await this.runTest('Invalid User ID', async () => {
      const token = await this.authenticate();
      try {
        await axios.get(`${API_BASE_URL}/users/99999`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        throw new Error('Should have failed with invalid user ID');
      } catch (error) {
        if (error.response?.status !== 404) throw new Error('Expected 404 Not Found');
      }
    });

    await this.teardown();

    // Print results
    console.log('\n📊 Test Results:');
    console.log('================');
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = TestRunner;