# Travelo

A modern travel stays and listings application built with Express, MongoDB, EJS and Bootstrap.

## Setup

```bash
npm install
npm start
```

Create a `.env` file with `ATLASDB_URL`, `SECRET`, and Cloudinary credentials (`CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`).

## Database

Refresh the database with exactly 100 curated and generated listings:

```bash
npm run db:update
```

This replaces existing listings with the seed collection and assigns them to the `travelo-demo` owner. If the demo user is missing, the script creates it automatically.

## Development checks

```bash
npm run check
```