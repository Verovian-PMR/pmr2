---
title: Architecture
description: System architecture and design decisions for VivIPractice
---

# Architecture

## Two-Plane Design
VivIPractice uses a Control Plane / Data Plane separation:

**Control Plane** (multi-tenant, vendor-only)
- Manages pharmacy instances, feature flags, billing status
- Stores NO patient data (PHI)
- Accessed only by Super Admins via the Control Hub app

**Data Plane** (single-tenant, per pharmacy)
- Each pharmacy gets an isolated PostgreSQL database and S3 storage bucket
- Contains all PHI: appointments, patient info, schedules
- Deployed as containerized instances via IaC

## Monorepo Structure
The project uses Turborepo with npm workspaces. Shared code lives in `packages/`, applications in `apps/`.

## Security Model
- AES-256 encryption at rest (database + storage)
- TLS 1.3 in transit
- JWT authentication with 15-minute session TTL
- TOTP-based MFA
- Role-based access control (SUPER_ADMIN, PHARMACY_ADMIN, PHARMACY_STAFF)
- Immutable audit logs for all CUD operations
- Rate limiting on all endpoints
- No cross-instance data queries

## API Design
- RESTful with `/api/v1/` prefix
- Input validation via class-validator (whitelist mode)
- Swagger/OpenAPI documentation auto-generated
- Paginated responses for list endpoints
