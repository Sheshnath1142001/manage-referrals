
# Backend for Location Items

This is a simple Node.js/Express backend to handle location items API requests.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /api/location-items` - Get all location items
- `GET /api/location-items/:id` - Get a specific location item
- `PUT /api/location-items/:id` - Update a location item
- `PUT /api/location-items/:id/modifiers` - Update modifiers for a location item
- `POST /api/location-items/clone` - Clone items between locations

## Environment Variables

You can configure the port by setting the `PORT` environment variable (default: 5000).
