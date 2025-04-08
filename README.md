# SwiftSensors Web Application

A Vue 3 web application for monitoring and managing SwiftSensors devices, sensors, and notifications.

## Features

- **Account Information**
  - View account details
  - Display account timezone and creation time

- **Device Management**
  - View all devices associated with the account
  - Monitor device status, battery levels, and signal strength
  - Track last contact time for each device

- **Sensor Monitoring**
  - Real-time display of sensor data
  - Support for multiple sensor types:
    - Temperature sensors (°C)
    - Humidity sensors (%)
    - Door sensors (Open/Closed)
    - Dew Point sensors (°C)
  - Status indicators and alert states
  - Update intervals and activity status

- **Notification Management**
  - View all configured notifications
  - Enable/Disable status indicators
  - Detailed notification information in modal view
  - Refresh capability for real-time updates

## Technology Stack

- Vue 3 with Composition API
- Pinia for state management
- Tailwind CSS for styling
- Axios for API communication

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SwiftSensors API access (API key required)

## Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd SwiftEventWeb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your API configuration:
   ```

   VITE_SWIFT_SENSORS_API_KEY=your-api-key
   VITE_SWIFT_SENSORS_API_HOST="https://api.swiftsensors.net"
   VITE_SWIFT_SENSORS_PROXY_API_URL="/api/api/client"
   VITE_SWIFT_SENSORS_USER=your-email-address  # optional
   VITE_SWIFT_SENSORS_PASSWORD=your-password   # optional 
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/`
  - `components/` - Reusable Vue components
  - `views/` - Page components
  - `stores/` - Pinia state management
  - `services/` - API service layer
  - `assets/` - Static assets

## API Integration

The application integrates with the SwiftSensors API:
- V1 endpoints for account information
- V2 endpoints for sensors and notifications
- Authentication using API key and Bearer token

## Development

To start development:
1. Ensure you have the correct API credentials
2. Run the development server
3. Access the application at `http://localhost:5173`

## Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license information here]
