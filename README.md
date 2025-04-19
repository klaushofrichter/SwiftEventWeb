# SwiftSensors Web Application

A Vue 3 web application for viewing a SwiftSensors account and its sensors. 
This application was build using [Cursor](https://Cursor.com) on MacOS 15.4 and Windows 11. The application is using
the [SwiftSensors public API](https://my.swiftsensors.net/api-docs) but has other than that 
no relation to SwiftSensors. Specifically, this application is not supported or endorsed by SwiftSensors. 

![GH Pages Deployment](https://github.com/klaushofrichter/SwiftEventWeb/actions/workflows/deploy.yml/badge.svg?event=push&label=GH%20Pages) 
![CodeQL Check](https://github.com/klaushofrichter/SwiftEventWeb/actions/workflows/codeql.yml/badge.svg?label=CodeQL) 
![Dev Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fklaushofrichter%2FSwiftEventWeb%2Frefs%2Fheads%2Fdevelop%2Fpackage.json&query=version&label=develop&color=%2333ca55) 
![Prod Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fklaushofrichter%2FSwiftEventWeb%2Frefs%2Fheads%2Fprod%2Fpackage.json&query=version&label=prod&color=%2333ca55) 
![GH Pages Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fklaushofrichter%2FSwiftEventWeb%2Frefs%2Fheads%2Fgh-pages%2Fpackage.json&query=version&label=gh-pages&color=%2333ca55)


## Application Features

- **Login with email, password and optional API Key**
  - Overwriting of the default API Key at login time
  - Local storage of credentials until explict logout
  - Automatic access token refresh

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
  - Listing of all configured notifications
  - Enable/Disable status indicators
  - Detailed notification information in modal view
  - Measurement Refresh for real-time updates

- **CORS**
  - CORS handling via proxy ([Vite](https://vite.dev/) or [Cloudflare](https://www.cloudflare.com/))

## Screenshots
<img src="/public/swiftsensorsweb.png" alt="SwiftSensors Web Dashboard" width="50%" />
<img src="/public/swiftsensorsmobile.png" alt="SwiftSensors Mobile Dashboard" width="25%" /><img src="/public/swiftsensorsmobile2.png" alt="SwiftSensors Mobile Dashboard" width="25%" />

## Technology Stack

- Vue 3 with Composition API
- Pinia for state management
- Tailwind CSS for styling
- Axios for API communication

## Login Procedure

The Swiftsensors API requires an API Key for all calls in the header of the API call. 
The API Key related to the Account, and any user/password is bound to that API Key. 
Account owners need to request an API Key from Swiftsensors, it will then be visible 
in the [Swiftsensors console](https://my.swiftsensors.net/) under Admin/Accounts. 

The API Key can be provided at login time, along with the email and password. It is possible
to configure a a default API Key in the `.env` file, and subsequently in the Github repository
secrets. 

## CORS handling

The application uses different approaches for development and production:

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

In order to resolve CORS issues you will need to proxy API calls. One possible configuration 
is available in the repository, see the [Cloudflare TOML](cors-proxy/wrangler.toml) configuration 
file and the [worker](cors-proxy/src/index.js) implementation. You will need to register 
at [Cloudflare](http://cloudflare.com) and acquire a user name and password. 
With that, you need to execute these calls for a deployment of the proxy:

```bash
cd ./cors-proxy
wrangler login
wrangler deploy
```

The `wrangler` tools should be installed when running `npm install` initially. Note that 
`wrangler` may be depreciated at some time. Calling this will create a proxy in the cloudflare 
environment. The URL of that proxy needs to be defined in the `.env` file. 

It is possible to use the Cloudflar proxy also for local execution by pointing the 
`VITE_SWIFT_SENSORS_API_HOST` to that proxy instead of the local `vite` proxy. 

To run the application via Github pages (Production), you will need to create a set of secrets that mirror 
the `.env` file. Please create these secrets as 
[Repository/Actions secrets](https://github.com/klaushofrichter/SwiftEventWeb/settings/secrets/actions) 
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

- There is no realtime event handling or timeseries display. 
- The Application is not actively maintained. 
- The user account that is used for login can not have 2FA enabled. Therefore, in the 
  my.Swiftsensors.net console, it is recommended to create a sub-user without 2FA if the 
  standard user has 2FA enabled and you are unwilling to disable this setting. The sub-user 
  might have less access rights to compensate for the reduction of security features. 
- Credentials are stored locally. Please use `logout` to remove the credentials. 

## Development and Deployment Prerequisites

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

3. Set up Git hooks:
   ```bash
   npm run setup-hooks
   ```
   This will set up:
   - A pre-commit hook that automatically increments the patch version number
   - Updates the last-commit date when committing to the develop branch
   - This may not work on Windows Powershell. That means that the automated version update is not working. Try gitbash and call `.hooks/setup-hooks.sh` 
   from the terminal. 

4. Create a `.env` file in the root directory with your API configuration:
   ```
   VITE_SWIFT_SENSORS_API_KEY=your-api-key
   VITE_SWIFT_SENSORS_API_HOST="https://api.swiftsensors.net"
   VITE_SWIFT_SENSORS_PROXY_API_URL="/proxy" # for local execution only
   VITE_SWIFT_SENSORS_PROD_PROXY_API_URL="https://cors-proxy.swiftsensors.workers.dev/proxy" # for use with cloudflare proxy / production
   VITE_SWIFT_SENSORS_PROD_APP_DOMAIN="klaushofrichter.github.io" # for production, needs to be adopted to your domain 
   VITE_SWIFT_SENSORS_USER=your-email-address  # optional 
   VITE_SWIFT_SENSORS_PASSWORD=your-password   # optional
   ```

5. Start the development server locally:
   ```bash
   npm run dev
   ```

6. Launch a browser to this address: [http://localhost:5173](http://localhost:5173)
 

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

## Testing

There are two types of tests: a local API test using `./test_api.sh` and a set of [Playwright[(https://playwright.dev/)] tests of the Application, locally or in production. To run these 
locally you need to provide valid credentials in the `.env ` file for `VITE_SWIFT_SENSORS_USER` and `VITE_SWIFT_SENSORS_PASSWORD` or as repository secrets.

Local API test: `test_api.sh`: this is a simple CURL script that tests the credentials by
retrieving an access token from the Swiftsensors API. Just call the script
in the terminal.

Playwright: this can be invoced locally by `npm run test`. 
You may need to manually install a headless browser locally before by calling `playwright install chromium` on the terminal. 

To run the test locally:

```bash
npm run test
```

This will:
1. Start the development server
2. Run the tests in Chrome headless mode
3. Generate an HTML report of the test results

The tests currently cover:
- Login functionality
- Dashboard page verification

Make sure your `.env` file contains valid credentials for testing:
```
VITE_SWIFT_SENSORS_USER=your-email-address
VITE_SWIFT_SENSORS_PASSWORD=your-password
```

You can run this also as part of the github actions workflow `.github/workflows/test-develop.yml` or `.github/workflows/test-gh-pages.yml` against the production deployment on Github Pages. 

## GitHub Actions Workflows

The project uses several GitHub Actions workflows for automation:

### Deployment Workflow (`deploy.yml`)
- Triggers on push to `prod` branch
- Builds and deploys the application to GitHub Pages
- Required secrets:
  - `VITE_SWIFT_SENSORS_API_KEY`
  - `VITE_SWIFT_SENSORS_API_HOST`
  - `VITE_SWIFT_SENSORS_PROD_APP_DOMAIN`
  - `VITE_SWIFT_SENSORS_PROD_PROXY_API_URL`

### Test Workflow (`test-gh-pages.yml`)
- Runs Playwright tests against the deployed GitHub Pages site
- Triggers after successful deployment
- Required secrets:
  - `VITE_SWIFT_SENSORS_USER`
  - `VITE_SWIFT_SENSORS_PASSWORD`

### Package Creation (`package.yml`)
- Creates a versioned package after successful deployment and tests
- Generates GitHub release with source code
- No additional secrets required beyond `GITHUB_TOKEN`

### Notifications

#### Slack Notifications
The project includes Slack notifications for various events:

1. **Deployment Notifications** (`slack-deployment-notification.yml`)
   - Sends notification when deployment completes
   - Includes version, commit info, and deployment URL
   - Required secret: `SLACK_WEBHOOK_URL`

2. **Test Result Notifications** (`slack-test-notification.yml`)
   - Notifies about test results (success/failure)
   - Includes test duration and version info
   - Required secret: `SLACK_WEBHOOK_URL`

#### GitHub Issue Creation (`create-issue-on-test-failure.yml`)
- Automatically creates issues for test failures
- Includes detailed test failure information
- No additional secrets required

### Setting Up Notifications

1. **Slack Integration**:
   - Create a Slack App in your workspace
   - Create an Incoming Webhook
   - Add the webhook URL as a repository secret:
     ```
     SLACK_WEBHOOK_URL=your-webhook-url
     ```

2. **GitHub Issues**:
   - No additional setup required
   - Issues will be created automatically on test failures
   - Labels used: `bug`, `test-failure`, `needs-attention`

### Workflow Dependencies

The workflows are interconnected:
1. Deployment workflow runs on push to `prod`
2. Test workflow runs after successful deployment
3. Package creation runs after both deployment and tests succeed
4. Notifications are sent based on workflow results

### Permissions

The workflows require specific GitHub permissions:
- `contents: write` - For deployments and releases
- `pages: write` - For GitHub Pages deployment
- `issues: write` - For creating issues
- `packages: write` - For package creation

To set up these permissions:
1. Go to your repository settings
2. Navigate to Actions > General
3. Under "Workflow permissions", select "Read and write permissions"

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
