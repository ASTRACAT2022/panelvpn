# Production Deployment Guide

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository>
   cd panelvpn
   cp .env.example .env
   # Edit .env with your secure passwords
   ```

2. **Deploy with Docker**
   ```bash
   # Make scripts executable
   chmod +x *.sh
   
   # Run complete deployment
   ./docker-build-test.sh
   ```

3. **Access the Application**
   - Web Interface: http://localhost:5000
   - API Documentation: http://localhost:5000/api/docs
   - Default Admin: admin@panelvpn.com / password
   - Default User: user@panelvpn.com / password

## Manual Deployment

### Prerequisites
- Docker and Docker Compose
- 4GB+ RAM recommended
- 10GB+ disk space

### Step-by-Step

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with secure passwords
   ```

2. **Database Setup**
   ```bash
   ./setup-db.sh
   ```

3. **Build and Start Services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Run Tests**
   ```bash
   ./run-tests.sh
   ```

## Configuration

### Security
- Change all default passwords in `.env`
- Use strong JWT secrets
- Configure firewall rules
- Enable SSL/TLS in production

### Performance
- Adjust container resources based on load
- Monitor database performance
- Configure Redis for caching
- Set up log rotation

### Monitoring
- Health checks are configured for all services
- Logs are collected with rotation
- Metrics available via monitoring endpoints

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

2. **API Not Responding**
   ```bash
   docker-compose -f docker-compose.prod.yml logs api
   ```

3. **Web Interface Issues**
   ```bash
   docker-compose -f docker-compose.prod.yml logs web
   ```

4. **Nginx Proxy Issues**
   ```bash
   docker-compose -f docker-compose.prod.yml logs nginx
   ```

### Logs and Debugging
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## Production Considerations

### SSL/TLS
- Configure SSL certificates
- Update Nginx configuration
- Enable HTTPS redirects

### Backup
- Regular database backups
- Configuration backups
- Log archival

### Updates
- Rolling updates strategy
- Database migration handling
- Zero-downtime deployments

### Scaling
- Horizontal scaling with load balancers
- Database read replicas
- Redis clustering

## Support

For issues and questions:
- Check logs first
- Review configuration
- Test with provided scripts
- Check service health endpoints