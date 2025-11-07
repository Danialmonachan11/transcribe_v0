# Deployment Guide

This guide covers deploying the Video Transcription & Documentation Platform to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [AWS Deployment](#aws-deployment)
- [Google Cloud Deployment](#google-cloud-deployment)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Database Migration](#database-migration)
- [Monitoring Setup](#monitoring-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [CI/CD Pipeline](#cicd-pipeline)

## Prerequisites

### Required Services
- Cloud provider account (AWS/GCP)
- Domain name with DNS management
- SSL certificate (Let's Encrypt or purchased)
- PostgreSQL 14+ database
- Redis 7+ instance
- S3-compatible storage

### Required API Keys
- OpenAI API key
- ElevenLabs API key (or Azure TTS)
- Replicate API key
- Stripe API key (for payments)
- SendGrid/SMTP credentials

### Required Tools
- Docker and Docker Compose
- kubectl (for Kubernetes)
- AWS CLI / gcloud CLI
- Terraform (optional, for IaC)
- Git

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/video-transcription-docs-platform.git
cd video-transcription-docs-platform
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.production

# Edit .env.production with production values
vim .env.production
```

**Critical Production Settings:**
```bash
NODE_ENV=production
APP_URL=https://yourapp.com
DATABASE_URL=postgresql://user:pass@prod-db:5432/videodb
REDIS_URL=redis://prod-redis:6379
AWS_S3_BUCKET=prod-video-storage
JWT_SECRET=<strong-random-secret>
```

### 3. Generate Secrets
```bash
# Generate JWT secret
openssl rand -base64 64

# Generate session secret
openssl rand -base64 32
```

## AWS Deployment

### Architecture Overview
- **Compute**: ECS Fargate / EC2 Auto Scaling Group
- **Database**: RDS PostgreSQL (Multi-AZ)
- **Cache**: ElastiCache Redis (Cluster mode)
- **Storage**: S3 + CloudFront CDN
- **Load Balancer**: Application Load Balancer
- **Container Registry**: ECR

### Step-by-Step Deployment

#### 1. Create VPC and Networking
```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=video-transcription-vpc}]'

# Create public and private subnets
aws ec2 create-subnet --vpc-id vpc-xxxxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-xxxxx --cidr-block 10.0.2.0/24 --availability-zone us-east-1b
```

#### 2. Set Up RDS Database
```bash
aws rds create-db-instance \
  --db-instance-identifier video-transcription-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.7 \
  --master-username dbadmin \
  --master-user-password <strong-password> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --multi-az \
  --backup-retention-period 30 \
  --vpc-security-group-ids sg-xxxxx
```

#### 3. Set Up ElastiCache Redis
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id video-transcription-redis \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name default \
  --security-group-ids sg-xxxxx
```

#### 4. Create S3 Bucket
```bash
aws s3 mb s3://video-transcription-storage

# Configure bucket policy
aws s3api put-bucket-policy \
  --bucket video-transcription-storage \
  --policy file://s3-bucket-policy.json

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket video-transcription-storage \
  --versioning-configuration Status=Enabled

# Configure lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket video-transcription-storage \
  --lifecycle-configuration file://s3-lifecycle.json
```

**s3-lifecycle.json:**
```json
{
  "Rules": [
    {
      "Id": "Move old videos to Glacier",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "NoncurrentVersionTransitions": [
        {
          "NoncurrentDays": 30,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

#### 5. Create CloudFront Distribution
```bash
aws cloudfront create-distribution \
  --origin-domain-name video-transcription-storage.s3.amazonaws.com \
  --default-root-object index.html
```

#### 6. Build and Push Docker Images
```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name video-transcription-backend
aws ecr create-repository --repository-name video-transcription-frontend
aws ecr create-repository --repository-name video-transcription-worker

# Build and push backend
docker build -t video-transcription-backend ./backend
docker tag video-transcription-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/video-transcription-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/video-transcription-backend:latest

# Build and push frontend
docker build -t video-transcription-frontend ./frontend
docker tag video-transcription-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/video-transcription-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/video-transcription-frontend:latest

# Build and push worker
docker build -f ./backend/Dockerfile.worker -t video-transcription-worker ./backend
docker tag video-transcription-worker:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/video-transcription-worker:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/video-transcription-worker:latest
```

#### 7. Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name video-transcription-cluster

# Create task definitions (see task-definition.json)
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create services
aws ecs create-service \
  --cluster video-transcription-cluster \
  --service-name backend-service \
  --task-definition video-transcription-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}"
```

#### 8. Set Up Application Load Balancer
```bash
aws elbv2 create-load-balancer \
  --name video-transcription-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Create target groups
aws elbv2 create-target-group \
  --name backend-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --target-type ip

# Create listeners
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

## Google Cloud Deployment

### Architecture Overview
- **Compute**: Cloud Run / GKE
- **Database**: Cloud SQL PostgreSQL
- **Cache**: Memorystore Redis
- **Storage**: Cloud Storage + Cloud CDN
- **Load Balancer**: Cloud Load Balancing

### Step-by-Step Deployment

#### 1. Set Up Project
```bash
gcloud projects create video-transcription
gcloud config set project video-transcription
gcloud services enable sqladmin.googleapis.com redis.googleapis.com run.googleapis.com
```

#### 2. Create Cloud SQL Instance
```bash
gcloud sql instances create video-transcription-db \
  --database-version=POSTGRES_14 \
  --tier=db-g1-small \
  --region=us-central1 \
  --backup \
  --backup-start-time=03:00

# Create database
gcloud sql databases create videodb --instance=video-transcription-db

# Create user
gcloud sql users create dbuser \
  --instance=video-transcription-db \
  --password=<strong-password>
```

#### 3. Create Memorystore Redis
```bash
gcloud redis instances create video-transcription-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

#### 4. Create Cloud Storage Bucket
```bash
gsutil mb -l us-central1 gs://video-transcription-storage

# Set lifecycle policy
gsutil lifecycle set gs-lifecycle.json gs://video-transcription-storage

# Enable CDN
gcloud compute backend-buckets create video-cdn-backend \
  --gcs-bucket-name=video-transcription-storage \
  --enable-cdn
```

#### 5. Build and Deploy to Cloud Run
```bash
# Build images with Cloud Build
gcloud builds submit --tag gcr.io/video-transcription/backend ./backend
gcloud builds submit --tag gcr.io/video-transcription/frontend ./frontend

# Deploy backend
gcloud run deploy backend \
  --image gcr.io/video-transcription/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,DATABASE_URL=... \
  --min-instances 1 \
  --max-instances 10

# Deploy frontend
gcloud run deploy frontend \
  --image gcr.io/video-transcription/frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (EKS, GKE, or self-hosted)
- kubectl configured
- Helm installed

### Deployment Steps

#### 1. Create Namespace
```bash
kubectl create namespace video-transcription
kubectl config set-context --current --namespace=video-transcription
```

#### 2. Create Secrets
```bash
kubectl create secret generic app-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=redis-url="redis://..." \
  --from-literal=jwt-secret="..." \
  --from-literal=openai-api-key="..." \
  --from-literal=elevenlabs-api-key="..."
```

#### 3. Deploy PostgreSQL (Helm)
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --set auth.username=dbuser \
  --set auth.password=dbpass \
  --set auth.database=videodb \
  --set primary.persistence.size=50Gi
```

#### 4. Deploy Redis (Helm)
```bash
helm install redis bitnami/redis \
  --set auth.enabled=false \
  --set master.persistence.size=8Gi
```

#### 5. Deploy Application
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/worker-deployment.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml
```

**backend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 6. Set Up Ingress
```bash
# Install nginx ingress controller
helm install nginx-ingress ingress-nginx/ingress-nginx

# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml
```

**ingress.yaml:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - yourapp.com
    secretName: yourapp-tls
  rules:
  - host: yourapp.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3001
```

## Database Migration

### Running Migrations
```bash
# Development
npm run migrate

# Production
DATABASE_URL=postgresql://... npm run migrate:prod
```

### Creating Migrations
```bash
npm run migration:create -- add-user-table

# Edit the migration file
vim migrations/XXXXXX_add-user-table.sql
```

### Rollback
```bash
npm run migrate:rollback
```

## Monitoring Setup

### DataDog
```bash
# Install DataDog agent
DD_API_KEY=<your-api-key> DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"

# Configure APM
DD_APM_ENABLED=true
DD_LOGS_ENABLED=true
```

### Prometheus + Grafana
```bash
# Install Prometheus
helm install prometheus prometheus-community/prometheus

# Install Grafana
helm install grafana grafana/grafana

# Access Grafana
kubectl port-forward svc/grafana 3000:80
```

## SSL/TLS Configuration

### Let's Encrypt (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourapp.com -d www.yourapp.com
```

### cert-manager (Kubernetes)
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourapp.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## CI/CD Pipeline

### GitHub Actions (see .github/workflows/ci.yml)
The CI/CD pipeline automatically:
1. Runs tests on PR
2. Builds Docker images
3. Pushes to container registry
4. Deploys to staging on main branch
5. Deploys to production on release tags

### Manual Deployment
```bash
# Build and deploy
npm run build
npm run deploy:prod
```

## Health Checks

### Endpoint: /health
```bash
curl https://yourapp.com/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "storage": "accessible"
  }
}
```

## Rollback Procedure

### ECS Fargate
```bash
aws ecs update-service \
  --cluster video-transcription-cluster \
  --service backend-service \
  --task-definition video-transcription-backend:PREVIOUS_VERSION
```

### Kubernetes
```bash
kubectl rollout undo deployment/backend
kubectl rollout status deployment/backend
```

## Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check security groups
# Verify DATABASE_URL
# Test connection
psql $DATABASE_URL
```

**High Memory Usage:**
```bash
# Check container metrics
docker stats
# Scale horizontally
kubectl scale deployment backend --replicas=5
```

**Slow Video Processing:**
```bash
# Increase worker count
# Check queue depth
# Optimize FFmpeg settings
```

## Cost Optimization

1. Use spot instances for workers
2. Enable S3 lifecycle policies
3. Use CloudFront caching
4. Right-size database instances
5. Auto-scale based on traffic
6. Use reserved instances for baseline

## Security Checklist

- [ ] All secrets in environment variables
- [ ] Database encryption at rest enabled
- [ ] TLS 1.3 for all traffic
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Regular security scans
- [ ] Backup and disaster recovery tested
- [ ] Logging and monitoring active
