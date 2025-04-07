# SwiftSensors Web Dashboard

A Vue 3 application for monitoring SwiftSensors devices and notifications.

## Features

- User authentication with SwiftSensors API
- Real-time sensor data display
- Notification management
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 20 or higher
- npm 8 or higher
- SwiftSensors API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your API key:
   ```
   VITE_SWIFT_SENSORS_API_KEY=your_api_key_here
   VITE_SWIFT_SENSORS_API_URL=https://api.swiftsensors.net/api/client/v1
   ```

## Development

To run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/views/` - Main application views
- `src/stores/` - Pinia stores for state management
- `src/services/` - API service functions
- `src/assets/` - Static assets and styles
- `src/router/` - Vue Router configuration
