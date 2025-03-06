# Payment API Integration - Backend Test Task

This project is a backend implementation for integrating with a payment API using NestJS. It provides endpoints for creating payments and handling 3DS authentication, with comprehensive error handling and logging.

## Prerequisites

- Node.js (v22 or higher)
- Yarn (v1.22.x or higher)
- Docker and Docker Compose
- Git

## Setup Instructions

Follow these steps to set up and run the project:

### 1. Clone the Frontend App
The frontend is needed to interact with the backend via UI.

```bash
git clone git@github.com:MRamanenkau/payment-form.git
```

### 2. Clone the Backend App
Fronted must be located in a parallel directory with the backend

```bash
git git@github.com:MRamanenkau/payment-test-task.git
cd payment-test-task
```

### 3. Configure Environment Variables
Create a .env file in the root of current project with the following:

```bash
BRAND_ID=<your-brand-id>
API_KEY=<your-api-key>
S2S_TOKEN=<your-s2s-token>
```

### 4. Build the Docker Containers
```bash
docker-compose build
```

### 5. Run the Application
```bash
docker-compose up
```

## Running Tests

### 1. Build the Tests
```bash
docker build -f Dockerfile.tests -t payment-api-tests .
```

### 2. Run the Tests
```bash
docker run --rm payment-api-tests
```
