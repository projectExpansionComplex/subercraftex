# Local Development Environment Setup

This document outlines how to set up and run the `subercraftex` project locally. The goal is to create a local environment that closely mimics the future production setup on AWS, allowing for confident and efficient development.

## 1. Prerequisites

Before you begin, ensure you have the following tools installed on your system:

*   **Docker Desktop:** Required for running the project's containerized infrastructure. Make sure to [enable Kubernetes](https://docs.docker.com/desktop/kubernetes/) in the Docker Desktop settings.
*   **Node.js:** Required for running the frontend and backend services.
*   **Git:** For version control.

## 2. Starting the Local Infrastructure

The project's infrastructure (databases, storage, etc.) is managed by Docker Compose. To start all the necessary services, run the following command from the project root:

```bash
docker-compose -f docker-compose.local-infra.yml up -d
```

This command will start the following services in the background:

*   **PostgreSQL:** A relational database, accessible at `localhost:5432`.
*   **Redis:** An in-memory data store, accessible at `localhost:6379`.
*   **MinIO:** An S3-compatible object storage service, with its API at `localhost:9000` and a web console at `http://localhost:9001`.
*   **Elasticsearch:** A search and analytics engine, accessible at `localhost:9200`.

## 3. Running the Application Services

Once the local infrastructure is running, you can start the individual application services (frontend, backend, etc.). Each service needs to be configured to connect to the local infrastructure. This is typically done through `.env` files in each service's directory.

### Example `.env` Configuration

```
# Database
DATABASE_URL=postgresql://subercraftex:localdevpassword@localhost:5432/subercraftex_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# S3-Compatible Storage (MinIO)
S3_ENDPOINT_URL=http://localhost:9000
S3_AWS_ACCESS_KEY_ID=minioadmin
S3_AWS_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=subercraftex-local-bucket

# Elasticsearch
ELASTICSEARCH_HOST=http://localhost:9200
```

## 4. Stopping the Local Infrastructure

To stop all the local infrastructure services, run the following command from the project root:

```bash
docker-compose -f docker-compose.local-infra.yml down
```
