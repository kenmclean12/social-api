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
- **Notifications:** Receive notifications for likes/reactions to posts, messages, and comments. Also receive notifications for follows.
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

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use host DB)
