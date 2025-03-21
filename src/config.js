import configJson from "./auth_config.json";

export function getConfig() {
  // Configure the audience here. By default, it will take whatever is in the config
  // (specified by the `audience` key) unless it's the default value of "YOUR_API_IDENTIFIER" (which
  // is what you get sometimes by using the Auth0 sample download tool from the quickstart page, if you
  // don't have an API).
  // If this resolves to `null`, the API page changes to show some helpful info about what to do
  // with the audience.
  const audience =
    configJson.audience && configJson.audience !== "YOUR_API_IDENTIFIER"
      ? configJson.audience
      : null;

  console.log("REACT_APP_CLIENT_ID", process.env.REACT_APP_CLIENT_ID);
  console.log("audience", audience);
  const clientId = process.env.REACT_APP_CLIENT_ID || configJson.clientId;

  return {
    domain: configJson.domain,
    clientId: clientId,
    ...(audience ? { audience } : null),
  };
}
