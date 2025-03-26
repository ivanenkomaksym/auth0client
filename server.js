const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const axios = require('axios');
const { join } = require("path");

const app = express();

console.log("REACT_APP_SERVER_PORT", process.env.REACT_APP_SERVER_PORT);
const port = process.env.REACT_APP_SERVER_PORT || 3000;

app.use(morgan("dev"));

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.static(join(__dirname, "build")));

// API to return all unique groups
app.get('/unique', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  try {
    // Fetch users from Auth0 Management API
    const usersResponse = await axios.get('https://mivanenko.eu.auth0.com/api/v2/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const users = usersResponse.data;

    // Extract all groups from user metadata
    const allGroups = users.flatMap(user => user.app_metadata?.groups || []);

    // Get unique groups
    const uniqueGroups = [...new Set(allGroups)];

    res.json(uniqueGroups);
  } catch (error) {
    console.error('Error fetching unique groups:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch unique groups' });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
