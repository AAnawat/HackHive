#!/bin/bash
exec > >(tee /var/log/user_data.log | logger -t user_data -s 2>/dev/console) 2>&1
set -xe

# Update system and install Docker
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker

sudo usermod -aG docker ec2-user
newgrp docker

# Wait for Docker daemon to be ready
until docker info >/dev/null 2>&1; do
  echo "Waiting for Docker to start..."
  sleep 2
done

# Create environment file
cat > /home/ec2-user/.env <<EOF
NODE_ENV=production

DATABASE_URL=${DATABASE_URL}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_DATABASE}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}

AWS_REGION=${REGION}

JWT_SECRET=${JWT_SECRET}
ADMIN_TOKEN=${ADMIN_TOKEN}
EOF

chown ec2-user:ec2-user /home/ec2-user/.env

cat > /home/ec2-user/run-web.sh <<EOF
#!/bin/bash

docker run -d --name backend-app \
  --env-file /home/ec2-user/.env \
  -p 80:8080 \
  --restart always \
  aunanawat/hackhive-backend
EOF

chown ec2-user:ec2-user /home/ec2-user/run-web.sh

cat > /home/ec2-user/push-db.sh <<EOF
#!/bin/bash

docker run --rm \
  --env-file /home/ec2-user/.env \
  aunanawat/hackhive-backend db:push
EOF

chown ec2-user:ec2-user /home/ec2-user/push-db.sh