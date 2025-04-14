# SwiftSensors Web Application

A Vue 3 web application for monitoring and managing SwiftSensors devices, sensors, and notifications. 
This application was build using Cursor.com on MacOS 15.4 and Windows 11. The application was build 
based on the [SwiftSensors public API](https://my.swiftsensors.net/api-docs) and has other than that 
no relation to SwiftSensors. Specifically, this application is not supported by SwiftSensors. 

![GH Pages Deploymentt](https://github.com/klaushofrichter/SwiftEventWeb/actions/workflows/deploy.yml/badge.svg?event=push)
![Code QA Check](https://github.com/klaushofrichter/SwiftEventWeb/actions/workflows/codeql.yml/badge.svg)

## Features

- **Account Information**
  - View account details
  - Display account timezone and creation time

- **Device Viewing**
  - View all devices associated with the account
  - Monitor device status, battery levels, and signal strength
  - Track last contact time for each device

- **Sensor Monitoring**
  - Display of sensor data
  - Support for multiple metric types, including:
    - Temperature sensors (°C of F)
    - Humidity sensors (%)
    - Door sensors (Open/Closed)
    - Dew Point sensors (°C of F)
  - Status indicators and alert states
  - Update intervals and activity status

- **Notification Viewing**
  - View all configured notifications
  - Enable/Disable status indicators
  - Detailed notification information in modal view
  - Refresh capability for real-time updates

## Screenshot
<img src="/public/swiftsensorsweb.png" alt="SwiftSensors Web Dashboard" width="50%" />

## Technology Stack

- Vue 3 with Composition API
- Pinia for state management
- Tailwind CSS for styling
- Axios for API communication

## CORS handling

The application uses different approaches for development and production. 

### Development

The application uses Vite's proxy configuration to avoid CORS issues. This should work locally for every developer when using `npm run dev`. 

### Production

There is a configuration provided for [Github Pages](https://klaushofrichter.github.io/SwiftEventWeb) that uses a Cloudflare Worker proxy (cors-proxy.swiftsensors.workers.dev) for all API calls. Both the Github Pages deployment and the Cloudflare worker proxy may or may not be active, so there is no guarantee that this would be working at any time. 

You can setup your own Github pages deployment and Cloudflare proxy: To deploy to Github pages you will need to configure your 
Github repository appropriately, see the "Pages" tab in "Settings" for the repository. You can configure to deploy Github 
pages from the "gh-pages" branch. Here is how to create this branch and deploy into it if you cloned or forked this current repository:

```bash
npm run build
npm run deploy
```
The above calls create a production build and deploy it into the Github Pages environment. This may be active for the 
source repository, try to navigate to [this URL](https://klaushofrichter.github.io/SwiftEventWeb/).  There is no need to
commit local changes to Github, the deployment to gh-pages is happening with the call to `npn run deploy` directly. A pull request 
from the [develop branch](https://github.com/klaushofrichter/SwiftEventWeb/tree/develop) to the [prod](https://github.com/klaushofrichter/SwiftEventWeb/tree/prod) branch is triggering a Github action to create the `gh-pages` build, so there is no
need to run `build` and `deploy` locally when a PR is sucessfully merging `develop` to `prod`.  

In order to resolve CORS issues you will need to proxy API calls. One possible configuration is available in the 
repository, see the [Cloudflare TOML](cors-proxy/wrangler.toml) configuration file and the [worker](cors-proxy/src/index.js) 
implementation. You will need to register at [Cloudflare](http://cloudflare.com) and acquire a user name and password. 
With that, you need to execute these calls for a deployment of the proxy:

```bash
cd ./cors-proxy
wrangler login
wrangler deploy
```

The `wrangler` tools should be installed when running `npm install` initially. Note that `wrangler` may be depreciated 
at some time. Calling this will create a proxy in the cloudflare environment. The URL of that proxy needs to be defined 
in the `.env` file. 

To run in Github pages (Production), you will need to create a set of secrets that mirror the `.env` file. Please create 
these secrets as [Repository/Actions secrets](https://github.com/klaushofrichter/SwiftEventWeb/settings/secrets/actions) 
in your repository, with the same values as given in the `.env` file: 

```
VITE_SWIFT_SENSORS_API_KEY
VITE_SWIFT_SENSORS_API_HOST
VITE_SWIFT_SENSORS_PROXY_API_URL
VITE_SWIFT_SENSORS_PROD_PROXY_API_URL
VITE_SWIFT_SENSORS_PROD_APP_DOMAIN
```
This allows Github Pages to operate. 

## Limitations

- There is no realtime event handling or timeseries display. The authentication may expire, it is needed to re-login if that happens. The only way to update values shown is the reload the app.
- The Application is not actively maintained. 
- The user account that is used for login can not have 2FA enabled. Therefore, in the my.Swiftsensors.net console, 
  it is recommended to create a sub-user without 2FA if the standard user has 2FA enabled and you are unwilling 
  to disable this setting. The sub-user might have less access right to compensate for the reduction of security 
  features. 

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SwiftSensors API access (API key required)

## Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:klaushofrichter/SwiftEventWeb.git
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
   VITE_SWIFT_SENSORS_PROXY_API_URL="/api/api/client" # for local execution only
   VITE_SWIFT_SENSORS_PROD_PROXY_API_URL="https://cors-proxy.swiftsensors.workers.dev/proxy/api/client" # for production only
   VITE_SWIFT_SENSORS_PROD_APP_DOMAIN="klaushofrichter.github.io" # for production, needs to be adopted to your domain 
   VITE_SWIFT_SENSORS_USER=your-email-address  # optional (for local API test)
   VITE_SWIFT_SENSORS_PASSWORD=your-password   # optional (for local API test)
   ```

4. Start the development server locally:
   ```bash
   npm run dev
   ```

5. Launch a browser to this address: [http://localhost:5173](http://localhost:5173)
 

## Project Structure

- `cors-proxy` - Cloudflare proxy to handle CORS
- `src/`
  - `components/` - Reusable Vue components
  - `views/` - Page components
  - `stores/` - Pinia state management
  - `services/` - API service layer
  - `assets/` - Static asset

## API Integration

The application integrates with the [SwiftSensors API](https://my.swiftsensors.net/api-docs):
- V1 endpoints for account information
- V2 endpoints for sensors and notifications
- Authentication using API key and Bearer token


## License

MIT License

Copyright (c) 2025 Klaus Hofrichter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
