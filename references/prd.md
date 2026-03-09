# Product Requirements Document (PRD)
**Project Name:** vivipractice  
**Version:** 1.0  
**Status:** Draft  
**Date:** March 5, 2026  
**Confidentiality:** Internal Use Only  

---

## 1. Executive Summary
### 1.1 Product Vision
To provide an enterprise-grade, turnkey digital platform for pharmacies that combines a fully customizable public website, a robust appointment booking system, and a comprehensive management dashboard. The platform operates on a **Single-Tenancy Architecture** (isolated instances per client) managed via a centralized **Control Hub**, ensuring maximum data security, compliance, and customization for each pharmacy.

### 1.2 Objectives
*   **Security & Compliance:** Achieve HIPAA/GDPR readiness through data isolation and encryption.
*   **Scalability:** Enable rapid provisioning of new pharmacy instances via automation.
*   **Customization:** Allow pharmacies to brand and structure their public presence without code.
*   **Operational Excellence:** Maintain 99.9% uptime with automated monitoring and updates across all instances.

### 1.3 Scope
*   **In Scope:** Control Hub (Vendor), Pharmacy Dashboard (Admin), Public Website (Patient), Booking Engine, Component Library, Single-Tenant Infrastructure.
*   **Out of Scope:** Direct Payment Processing (Billing is offline), Telehealth Video Integration (Phase 2), Inventory Management (Phase 2).

---

## 2. User Personas
| Persona | Description | Key Goals |
| :--- | :--- | :--- |
| **Super Admin (Vendor)** | Internal team managing the platform. | Provision instances, monitor health, push updates, manage feature flags. |
| **Pharmacy Admin** | Owner or Manager of the pharmacy. | Brand website, manage staff, view reports, configure booking rules. |
| **Pharmacy Staff** | Receptionists or Pharmacists. | View appointments, confirm bookings, manage daily schedules. |
| **Patient (End User)** | Customer visiting the public site. | Find services, book appointments, view location/hours. |

---

## 3. System Architecture
### 3.1 High-Level Design: Control Plane vs. Data Plane
The system utilizes a **Two-Plane Architecture** to balance management ease with data isolation.

*   **Control Plane (Parent Hub):**
    *   **Function:** Centralized management of all client instances.
    *   **Tenancy:** Multi-tenant (Vendor only).
    *   **Data:** Client metadata, subscription status, feature flags, infrastructure logs. **NO Patient Data.**
    *   **Access:** Secure internal network only.
*   **Data Plane (Client Instances):**
    *   **Function:** Hosting the Pharmacy Dashboard and Public Website.
    *   **Tenancy:** Single-tenant (One isolated instance per pharmacy).
    *   **Data:** PHI, Appointments, Schedules, Website Content, Media.
    *   **Deployment:** Containerized (Docker) via Infrastructure as Code (IaC).

### 3.2 Technology Stack (Recommended)
*   **Frontend:** Next.js (React) - Supports SSR for SEO and Dashboard interactivity.
*   **Backend:** Node.js (NestJS) or Python (Django) - Robust API frameworks.
*   **Database:** PostgreSQL - Relational data for scheduling and bookings.
*   **Storage:** S3-Compatible Object Storage (e.g., AWS S3, MinIO) for media.
*   **Infrastructure:** Kubernetes (K8s) or AWS ECS for container orchestration.
*   **IaC:** Terraform or AWS CDK for provisioning.

### 3.3 Data Flow (Single Source of Truth)
*   The **Pharmacy Dashboard** and **Public Website** share the same database instance.
*   Changes made in the Dashboard (e.g., Schedule update, Branding change) are immediately reflected on the Public Website via API caching invalidation.
*   No data synchronization between instances is required.

---

## 4. Functional Requirements: Control Hub (Vendor)
*Access restricted to Super Admins.*

### 4.1 Instance Provisioning
*   **FR-CH-01:** System shall allow Super Admin to create a new client instance via a form (Pharmacy Name, Admin Email, Subdomain).
*   **FR-CH-02:** Upon creation, the system shall automatically trigger an IaC script to deploy a new container, database, and storage bucket.
*   **FR-CH-03:** System shall generate temporary admin credentials and email them to the Pharmacy Admin.

### 4.2 Domain & SSL Management
*   **FR-CH-04:** System shall automatically configure DNS records for subdomains (e.g., `client.platform.com`).
*   **FR-CH-05:** System shall automatically issue and renew SSL certificates (Let's Encrypt) for every instance.
*   **FR-CH-06:** System shall support custom domain mapping (CNAME configuration) for enterprise clients.

### 4.3 Feature Flagging
*   **FR-CH-07:** Super Admin shall be able to enable/disable specific modules per instance (e.g., Enable SMS Notifications, Enable Dynamic Table).
*   **FR-CH-08:** Feature flags shall be pushed to the instance configuration without requiring a code redeploy.

### 4.4 Fleet Monitoring & Updates
*   **FR-CH-09:** Dashboard shall display health status (Online/Offline, CPU, Memory) for all active instances.
*   **FR-CH-10:** Super Admin shall be able to push software updates to selected instances or all instances simultaneously.
*   **FR-CH-11:** System shall track billing status (Offline) per client (Active, Overdue, Suspended).

---

## 5. Functional Requirements: Pharmacy Dashboard
*Access restricted to Pharmacy Admin and Staff.*

### 5.1 Authentication & Security
*   **FR-PD-01:** Login shall require Email/Password + Multi-Factor Authentication (MFA).
*   **FR-PD-02:** Sessions shall expire after 15 minutes of inactivity.
*   **FR-PD-03:** All actions (Create, Edit, Delete) shall be logged in an immutable Audit Trail (User, Timestamp, IP, Action).

### 5.2 Website Customization Tab
*   **FR-PD-04:** **Global Settings:** Users can upload Logo, Favicon, and set Primary/Secondary Color Hex codes.
*   **FR-PD-05:** **Page Manager:** Users can toggle visibility of default pages (Home, Services, About, Contact, Booking).
*   **FR-PD-06:** **SEO:** Users can edit Meta Title and Description per page.

### 5.3 Component Library (Page Builder)
*Users can add, reorder, and configure the following components on pages:*

| Component | Requirement ID | Specifications |
| :--- | :--- | :--- |
| **Home Slider** | **FR-COMP-01** | • **Data:** Pulls images from **Service** records.<br>• **Config:** Multi-select services to display.<br>• **Layout:** Toggle `Centered` (Text/Btn centered) or `Left Aligned` (Text left, Btn below).<br>• **Action:** Button redirects to Booking Form with pre-selected service. |
| **Services Card** | **FR-COMP-02** | • **Data:** Pulls from **Service** records.<br>• **Config:** Multi-select services.<br>• **Layout:** Card style (Image top 50%, Content bottom 50%).<br>• **Grid:** Selectable density (1-4 cards per row). |
| **2-Column Content** | **FR-COMP-03** | • **Left:** Rich Text Editor.<br>• **Right:** Toggle `Image` or `Map`.<br>• **Image Layout:** `Full Width` or `Circular` (30px padding).<br>• **Map:** Async search field (OpenStreetMap) to pin location. |
| **Gallery** | **FR-COMP-04** | • **Storage:** Images uploaded to S3 Compatible Storage.<br>• **Config:** Drag-and-drop upload.<br>• **Layout:** Toggle `Grid` or `Carousel Slider`. |
| **Dynamic Table** | **FR-COMP-05** | • **Data:** Manually entered rows/columns.<br>• **Config:** Add/Edit/Delete rows.<br>• **Feature:** Frontend sorting enabled.<br>• **Use Case:** Price lists, schedules, etc. |

### 5.4 Service Management
*   **FR-PD-07:** Users can Create, Read, Update, Delete (CRUD) services.
*   **FR-PD-08:** Each service must have a Name, Description, Duration, and Featured Image.
*   **FR-PD-09:** Services can be marked `Active` or `Inactive` (inactive services hide from public components).

### 5.5 Schedule & Availability
*   **FR-PD-10:** Users can define providers (Doctors/Pharmacists).
*   **FR-PD-11:** Users can set working hours (e.g., Mon-Fri 9-5) and slot durations (e.g., 15min, 30min).
*   **FR-PD-12:** Users can block specific dates/times (Holidays, Leave).
*   **FR-PD-13:** **Logic:** Booking form shall only show slots where `Provider Availability` AND `Service Duration` align.

### 5.6 Form Builder
*   **FR-PD-14:** Users can customize the booking form fields (Text, Date, Dropdown, File Upload).
*   **FR-PD-15:** Users can set fields as `Required` or `Optional`.
*   **FR-PD-16:** **Validation:** Email format, Phone number format enforcement.

### 5.7 Appointment Management
*   **FR-PD-17:** Dashboard shall display appointments in a List or Kanban view (Pending, Confirmed, Completed, Cancelled).
*   **FR-PD-18:** Users can manually create, edit, or cancel appointments.
*   **FR-PD-19:** Users can export appointment lists to CSV.

---

## 6. Functional Requirements: Public Frontend
*Accessible by Patients.*

### 6.1 Performance & SEO
*   **FR-PF-01:** Page Load Time shall be under 2 seconds on 4G networks.
*   **FR-PF-02:** All pages shall generate dynamic Sitemaps and Meta Tags based on Dashboard settings.
*   **FR-PF-03:** Images shall be lazy-loaded and served in WebP format where supported.

### 6.2 Booking Flow
*   **FR-PF-04:** Users shall select Service → Select Provider (optional) → Select Time Slot → Enter Details.
*   **FR-PF-05:** System shall prevent double-booking via database locking mechanisms.
*   **FR-PF-06:** Upon submission, user shall see a Confirmation Screen and receive an Email confirmation.

### 6.3 Accessibility
*   **FR-PF-07:** Frontend shall comply with **WCAG 2.1 AA** standards (contrast, keyboard navigation, screen reader support).

---

## 7. Security & Compliance (Enterprise Standard)
### 7.1 Data Protection
*   **SEC-01:** **Encryption at Rest:** All databases and S3 buckets must use AES-256 encryption.
*   **SEC-02:** **Encryption in Transit:** TLS 1.3 enforced for all endpoints.
*   **SEC-03:** **Isolation:** No cross-instance data queries allowed. Network policies must deny traffic between client instances.

### 7.2 Compliance (HIPAA/GDPR)
*   **SEC-04:** **Audit Logs:** All access to Patient Data must be logged and retained for minimum 6 years.
*   **SEC-05:** **Data Retention:** Automated archiving of appointments older than 7 years (configurable).
*   **SEC-06:** **Right to Erasure:** Admin must have a tool to anonymize patient data upon request.

### 7.3 Backup & Disaster Recovery
*   **SEC-07:** **Backups:** Automated daily snapshots of DB and Storage off-site.
*   **SEC-08:** **RTO:** Recovery Time Objective < 4 hours.
*   **SEC-09:** **RPO:** Recovery Point Objective < 24 hours.

---

## 8. Non-Functional Requirements
### 8.1 Reliability
*   **NFR-01:** System Availability SLA of 99.9% per instance.
*   **NFR-02:** Automated health checks every 60 seconds.

### 8.2 Scalability
*   **NFR-03:** Each instance must support up to 10,000 monthly visitors without performance degradation.
*   **NFR-04:** Control Hub must support management of 100+ instances without latency.

### 8.3 Maintainability
*   **NFR-05:** Code coverage for automated tests must exceed 80%.
*   **NFR-06:** CI/CD pipeline must run security scans (SAST/DAST) on every commit.

---

## 9. DevOps & Operational Strategy
### 9.1 Infrastructure as Code (IaC)
*   All infrastructure defined in Terraform/CDK. No manual console changes allowed in production.

### 9.2 CI/CD Pipeline
*   **Build:** Docker image creation on commit.
*   **Test:** Unit, Integration, and E2E testing (simulate booking flow).
*   **Deploy:** Blue/Green deployment strategy to ensure zero downtime during updates.

### 9.3 Monitoring
*   **Centralized Logging:** All instance logs shipped to central ELK/Datadog stack.
*   **Alerting:** Super Admins notified via SMS/Email if instance uptime drops or error rate > 1%.

---

## 10. Roadmap & Phasing
### Phase 1: MVP
*   Control Hub (Provisioning, Monitoring).
*   Pharmacy Dashboard (Basic Customization, Services, Schedule).
*   Public Site (Home Slider, Service Card, Booking Form).
*   Email Notifications.

### Phase 2: Enhancement
*   Advanced Components (Gallery, Dynamic Table, 2-Column Map).
*   SMS Notifications.
*   Custom Domain Support.
*   Automated Backups.

### Phase 3: Enterprise
*   Advanced Analytics.
*   Patient Portal (Login to view history).
*   API Integrations (EHR, Insurance).

---

## 11. Appendices
### 11.1 Database Schema Overview (Key Tables)
*   `Users` (Admin/Staff)
*   `Services` (Name, Duration, ImageID)
*   `Schedules` (ProviderID, StartTime, EndTime, Exceptions)
*   `Appointments` (PatientInfo, ServiceID, SlotStart, Status)
*   `PageComponents` (PageID, ComponentType, ConfigJSON, Order)
*   `AuditLogs` (UserID, Action, Timestamp, IP)

### 11.2 API Endpoint Standards
*   All APIs must be RESTful or GraphQL.
*   Versioning required (e.g., `/api/v1/bookings`).
*   Rate limiting enforced to prevent DDoS.