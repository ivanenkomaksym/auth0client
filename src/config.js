export function getConfig() {
  // Configure the audience here. By default, it will take whatever is in the config
  // (specified by the `audience` key) unless it's the default value of "YOUR_API_IDENTIFIER" (which
  // is what you get sometimes by using the Auth0 sample download tool from the quickstart page, if you
  // don't have an API).
  // If this resolves to `null`, the API page changes to show some helpful info about what to do
  // with the audience.

  console.log("REACT_APP_CLIENT_ID", process.env.REACT_APP_CLIENT_ID);
  const clientId = process.env.REACT_APP_CLIENT_ID;

  process.env.REACT_APP_SERVER_PORT = process.env.PORT;
  console.log("REACT_APP_API_PORT", process.env.REACT_APP_API_PORT);
  console.log("REACT_APP_SERVER_PORT", process.env.REACT_APP_SERVER_PORT);
  const port = process.env.REACT_APP_API_PORT || 3001;
  const appPort = process.env.REACT_APP_SERVER_PORT || 3000;
  const appOrigin = `http://localhost:${appPort}`;
  const domain = process.env.REACT_APP_DOMAIN;
  const audience = process.env.REACT_APP_AUDIENCE;
  console.log("domain", domain);
  console.log("audience", audience);

  return {
    domain: domain,
    clientId: clientId,
    ...(audience ? { audience } : null),
    port: port,
    appOrigin: appOrigin
  };
}
