# rmlp.dev

Landing page for [rmlp.dev](https://rmlp.dev) - A simple Node.js web application.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RamonLips/rmlp.dev.git
   cd rmlp.dev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `GITHUB_WEBHOOK_SECRET` | Secret for GitHub webhook signature verification |
| `GIT_BRANCH` | Git branch to pull from (default: main) |

## GitHub Webhook

The server includes a webhook endpoint for automatic deployments:

- **URL**: `https://rmlp.dev/github-update-project`
- **Method**: POST
- **Content-Type**: application/json

Configure your GitHub webhook with the secret set in `GITHUB_WEBHOOK_SECRET` environment variable.

## Project Structure

```
rmlp.dev/
├── index.js          # Express server entry point
├── public/           # Static files
│   ├── index.html    # Landing page
│   └── css/
│       └── style.css # Styles
├── package.json      # Project configuration
└── README.md         # This file
```

## License

ISC