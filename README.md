# HackHive

A cloud-based CTF (Capture The Flag) platform that dynamically provisions isolated challenge containers on AWS and provides real-time terminal access through WebSocket connections.

## Overview

HackHive is a modern CTF platform where users can launch containerized challenge environments on-demand. The platform handles the entire lifecycle of challenge instances:

- Users browse available CTF challenges through the web interface
- Click to launch a challenge, triggering container deployment on AWS ECS
- Connect to the running container via an interactive terminal (xterm.js)
- Real-time WebSocket communication for terminal I/O
- Automated cleanup and resource management via scheduler

## How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Workflow                            │
└──────────────────────────────────────────────────────────────────┘

    1. Browse Challenges          2. Request Launch
    ┌─────────────┐              ┌─────────────┐
    │   Frontend  │─────HTTP────▶│   Backend   │
    │   (React)   │              │  (Hono.js)  │
    └─────────────┘              └──────┬──────┘
         │                              │
         │                              ▼
         │                       ┌─────────────┐
         │                       │  AWS ECS    │
         │                       │  Launch     │
         │                       │  Container  │
         │                       └──────┬──────┘
         │                              │
         │                              ▼
         │                       ┌─────────────┐
         │                       │  Container  │
         │                       │  + WebSocket│
         │                       │   Server    │
         │                       └──────┬──────┘
         │                              │
         │      3. Get Container IP     │
         │         & Port               │
         │◀─────────────────────────────┘
         │
         │      4. Direct WebSocket Connection
         └──────────────────────────────┐
                                        │
    ┌─────────────┐              ┌─────▼──────┐
    │  Terminal   │◀────WS───────│  Container │
    │  (xterm.js) │   Socket.io  │  Terminal  │
    └─────────────┘              └────────────┘

    5. Automated Cleanup
    ┌─────────────┐
    │  Scheduler  │──▶ Stops idle containers
    │ (node-cron) │──▶ Manages resources
    └─────────────┘
```

## Architecture

### Request Flow

1. **Challenge Launch**
   - Frontend sends launch request to Backend API
   - Backend authenticates user and validates challenge
   - Backend calls AWS ECS to create task with challenge container
   - Container starts on AWS ECS with exposed WebSocket port
   - Backend returns container IP address and WebSocket port to Frontend

2. **Direct Terminal Connection**
   - Frontend receives container connection details (IP:Port)
   - Frontend establishes **direct WebSocket connection** to the container
   - Container runs a WebSocket server that provides terminal access
   - User interacts with the container's shell in real-time via xterm.js
   - All terminal I/O flows directly between Frontend and Container
   - User explores the container filesystem to find CTF flags

3. **Resource Management**
   - Scheduler monitors running containers
   - Automatically stops idle or expired instances
   - Cleans up resources to optimize costs
   - Updates database with container states

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Challenge   │  │   Terminal   │  │     Auth     │           │
│  │    List      │  │   (xterm.js) │  │   (JWT)      │           │
│  └──────────────┘  └──────┬───────┘  └──────────────┘           │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTP (launch)
┌────────────────────────────▼────────────────────────────────────┐
│                         Backend Layer                           │
│  ┌──────────────┐                    ┌──────────────┐           │
│  │  API Routes  │                    │  AWS Client  │           │
│  │   (Hono)     │                    │   (ECS)      │           │
│  └──────────────┘                    └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │   AWS ECS    │    │  Scheduler   │
│   Database   │    │              │    │  (Cleanup)   │
└──────────────┘    └──────┬───────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Container   │
                    │  + WebSocket │◀─── Direct WS
                    │    Server    │     from Frontend
                    └──────────────┘
```

## Tech Stack

### Frontend
- **React 19** - Modern UI framework with TypeScript
- **Vite** - Fast build tool and dev server
- **Mantine** - Component library for polished UI
- **Tailwind CSS** - Utility-first styling
- **xterm.js** - Full-featured terminal emulator
- **Socket.io Client** - Real-time WebSocket communication
- **React Router** - Client-side routing

### Backend
- **Node.js + TypeScript** - Type-safe server runtime
- **Hono.js** - Lightweight, fast web framework
- **PostgreSQL** - Relational database for challenges and users
- **Drizzle ORM** - Type-safe database queries
- **JWT + bcrypt** - Secure authentication
- **AWS SDK** - ECS client for container orchestration

### Scheduler
- **Node.js** - Runtime for background jobs
- **node-cron** - Scheduled task execution
- **AWS ECS Client** - Container lifecycle management
- **PostgreSQL Client** - Database updates

### Infrastructure
- **Docker** - Container runtime and local development
- **AWS ECS** - Managed container orchestration
- **AWS EC2** - Compute instances for containers
- **AWS S3** - Storage for challenge files
- **Terraform** - Infrastructure as Code
- **docker-compose** - Local multi-container orchestration

## Project Structure

```
HackHive/
├── frontend/             # React web application
│   └── src/
│       ├── pages/        # Challenge list, terminal interface
│       ├── components/   # Reusable UI components
│       ├── api/          # Backend API client
│       └── context/      # WebSocket and auth context
│
├── backend/              # API and WebSocket server
│   └── src/
│       ├── controllers/  # HTTP endpoints (launch, status)
│       ├── use-cases/    # Business logic (container mgmt)
│       ├── infrastructure/
│       │   ├── database/ # Drizzle ORM, schemas
│       │   └── aws/      # ECS client integration
│       └── config/       # Environment configuration
│
├── scheduler/            # Background job service
│   └── src/
│       └── jobs/         # Container cleanup tasks
│
├── problems/             # CTF challenge containers
│   ├── base-image/       # Base Docker image for challenges
│   └── scripts/          # Challenge setup scripts
│
└── terraform/            # AWS infrastructure
    ├── main/             # Core resources (VPC, DB, ECS cluster)
    └── backend-app/      # Application-specific resources
```
