const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const axios = require('axios');
const { auth } = require("express-oauth2-jwt-bearer");
const { getConfig } = require("./src/config");

const app = express();

const config = getConfig();

if (
  !config.domain ||
  !config.audience
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: config.appOrigin }));

const checkJwt = auth({
  audience: config.audience,
  issuerBaseURL: `https://${config.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});


// API to return all unique groups
app.get('/groups', async (req, res) => {
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
    const allGroups = users.flatMap(user => user?.groups || []);

    // Get unique groups
    const uniqueGroups = [...new Set(allGroups)];

    res.json(uniqueGroups);
  } catch (error) {
    console.error('Error fetching unique groups:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch unique groups' });
  }
});

app.get('/groups/:groupId/users', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header
  const { groupId } = req.params; // Get the groupId from the URL

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

    // Filter users who belong to the specified groupId
    const filteredUsers = users.filter(user => 
      user?.groups?.includes(groupId)
    );

    res.json(filteredUsers);
  } catch (error) {
    console.error(`Error fetching users for group ${groupId}:`, error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch users for the specified group' });
  }
});

const checkWeatherForecastJwt = auth({
  audience: "https://easyclean.contoso.com",
  issuerBaseURL: `https://${config.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/weatherforecast", checkWeatherForecastJwt, (req, res) => {
  res.send({
    msg: "You got access to 'WeatherForecast' API. Your access token was successfully validated!",
  });
});

app.listen(config.port, () => console.log(`API Server listening on port ${config.port}`));
