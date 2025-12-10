# NestJS Social Media API
A fully-featured social media backend built with NestJS and Websockets. This API is dockerized for easy deployment and development, and uses JWT authentication to secure sensitive routes.

## Features
- **User Management:** Register, login, update, and delete accounts.
- **Authentication:** JWT-based auth guards on protected routes for secure access.
- **Posts & Content:** Create posts with text or file uploads, fetch, update, delete.
- **Follows:** Follow/unfollow users, see your followers/following.
- **Messages & Conversations:** Real-time messaging with Websockets, initiate or manage conversations.
- **Likes & Reactions:** Like or react to posts, remove reactions.
- **Comments:** Add, edit, or delete comments on posts.
- **Live Notifications:** Receive live notifications for follows, likes/reactions to posts, messages, and comments through SSE events/messages.
- **Personalized Feed:** View posts from users you follow, with fallback to random posts.
- **Explore Feed:** Filter posts by most liked, most reacted, recent, or oldest.
- **Dockerized:** Easily run locally or in production using Docker and Docker Compose.

## Technologies
- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- Websockets (for real-time messaging)
- Docker & Docker Compose
- JWT authentication & guards
- Swagger for API documentation

## Minio / File Uploads

This project uses **Minio** (S3-compatible object storage) for uploading and serving media files. You **do not need a local Minio server** — you can use any hosted Minio or S3-compatible service.  

### Configuration

Set the following environment variables in `.env` (or copy from `env.example`):

- `MINIO_BUCKET` — The bucket name for storing files (e.g., `my-bucket`)
- `MINIO_ENDPOINT` — The URL of your hosted Minio instance (e.g., `https://your-minio-host.com`)
- `MINIO_PUBLIC` — The public base URL to access uploaded files (e.g., `https://your-minio-host.com/my-bucket`)
- `MINIO_ACCESS_KEY` — Your Minio access key
- `MINIO_SECRET_KEY` — Your Minio secret key

### Example

```env
MINIO_BUCKET=my-bucket
MINIO_ENDPOINT=https://play.min.io
MINIO_PUBLIC=https://play.min.io/my-bucket
MINIO_ACCESS_KEY=Q3AM3UQ867SPQQA43P2F
MINIO_SECRET_KEY=zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG

## Getting Started
Make sure the Docker Daemon is running, then start all services from the project root: docker-compose up --build

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use host DB)
