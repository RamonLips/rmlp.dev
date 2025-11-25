const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const GIT_BRANCH = process.env.GIT_BRANCH || 'main';

// Simple rate limiter for webhook endpoint
const webhookRateLimit = {
  lastRequest: 0,
  minInterval: 10000 // Minimum 10 seconds between requests
};

// Middleware to parse JSON with raw body for webhook signature verification
app.use('/github-update-project', express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// GitHub webhook endpoint for automatic project updates
app.post('/github-update-project', (req, res) => {
  // Rate limiting check
  const now = Date.now();
  if (now - webhookRateLimit.lastRequest < webhookRateLimit.minInterval) {
    return res.status(429).send('Too many requests. Please wait before trying again.');
  }
  webhookRateLimit.lastRequest = now;

  if (!WEBHOOK_SECRET) {
    console.error('GITHUB_WEBHOOK_SECRET environment variable is not set');
    return res.status(500).send('Webhook secret not configured');
  }

  // Verify the webhook signature
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return res.status(401).send('No signature provided');
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
    return res.status(401).send('Invalid signature');
  }

  // Execute git pull and restart
  console.log('Webhook received, updating project...');
  const gitPull = spawn('git', ['pull', 'origin', GIT_BRANCH], { cwd: __dirname });
  
  let stdout = '';
  let stderr = '';
  
  gitPull.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  
  gitPull.stderr.on('data', (data) => {
    stderr += data.toString();
  });
  
  gitPull.on('close', (code) => {
    if (code !== 0) {
      console.error('Git pull error, exit code:', code);
      console.error('stderr:', stderr);
      return res.status(500).send('Update failed');
    }
    console.log('Git pull output:', stdout);
    if (stderr) console.log('Git pull stderr:', stderr);
    
    res.status(200).send('Update successful');
    
    // Restart the process after response is sent
    // Delay exit to ensure response is delivered
    setTimeout(() => {
      console.log('Restarting application...');
      process.exit(0);
    }, 100);
  });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
