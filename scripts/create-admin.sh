#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# VivIPractice — Create Admin User
# Run this AFTER the app is deployed and the database is running.
#
# Usage:
#   chmod +x scripts/create-admin.sh
#   ./scripts/create-admin.sh
#
# Or with env vars:
#   ADMIN_EMAIL=admin@pharmacy.com ADMIN_PASSWORD=SecureP@ss123 ./scripts/create-admin.sh
# ============================================================

# Defaults (override via environment)
ADMIN_NAME="${ADMIN_NAME:-Admin User}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@vivipractice.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

# Prompt for password if not provided
if [ -z "$ADMIN_PASSWORD" ]; then
  echo "Enter admin password (min 8 chars):"
  read -s ADMIN_PASSWORD
  echo ""
  if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
    echo "ERROR: Password must be at least 8 characters."
    exit 1
  fi
fi

echo "Creating admin user: ${ADMIN_EMAIL}"

# Run inside the API container using node + prisma
docker compose -f docker-compose.prod.yml exec api node -e "
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash('${ADMIN_PASSWORD}', 12);
    const user = await prisma.user.upsert({
      where: { email: '${ADMIN_EMAIL}' },
      update: { passwordHash: hash, name: '${ADMIN_NAME}', role: 'PHARMACY_ADMIN', isActive: true },
      create: {
        email: '${ADMIN_EMAIL}',
        passwordHash: hash,
        name: '${ADMIN_NAME}',
        role: 'PHARMACY_ADMIN',
        isActive: true,
      },
    });
    console.log('Admin user created/updated:', user.email, '(id:', user.id + ')');
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}
main();
"

echo ""
echo "Done! You can now log in at https://services.vivipractice.com/dashboard"
echo "  Email: ${ADMIN_EMAIL}"
echo "  Password: (the one you entered)"
