import React, { useState } from "react";
import { Button, Alert } from "reactstrap";
import Highlight from "../components/Highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import axios from "axios"

export const ExternalApiComponent = () => {
  const { apiOrigin = `http://localhost:${process.env.REACT_APP_API_PORT}`, audience } = getConfig();

  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const [weatherData, setWeatherData] = useState(null);

  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
  } = useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const callApi = async () => {
    setState({
      ...state,
      showResult: false,
    });
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${apiOrigin}/api/external`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response.ok ? await response.json() : await response.text();
      console.log("responseData: ", responseData);

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });
    } catch (error) {
      const errorMessage = error.response?.headers?.get('www-authenticate') || error.message || error;
      setState({
        ...state,
        error: errorMessage,
      });
    }
  };

  const callWeatherForecastApi = async () => {
    setState({
      ...state,
      showResult: false,
    });
    let response = null;
    try {
      const token = await getAccessTokenSilently();

      const instance = axios.create({
        headers: {
          'Authorization': `Bearer ${token}`,
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          mode: 'no-cors'
        }
      });

      response = await instance.get(`${process.env.REACT_APP_EXTERNAL_API_URL}`);
      const result = response.data;
      setWeatherData(result);
    } catch (error) {
      console.log("setting error state with error: ", response);
      setState({
        ...state,
        showResult: true,
        apiMessage: null,
        error: response,
      });
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}

        <h1>External API</h1>
        <p className="lead">
          Ping an external API by clicking the button below.
        </p>

        <p>
          This will call a local API on port 3001 that would have been started
          if you run <code>npm run dev</code>. An access token is sent as part
          of the request's `Authorization` header and the API will validate it
          using the API's audience value.
        </p>

        {!audience && (
          <Alert color="warning">
            <p>
              You can't call the API at the moment because your application does
              not have any configuration for <code>audience</code>, or it is
              using the default value of <code>YOUR_API_IDENTIFIER</code>. You
              might get this default value if you used the "Download Sample"
              feature of{" "}
              <a href="https://auth0.com/docs/quickstart/spa/react">
                the quickstart guide
              </a>
              , but have not set an API up in your Auth0 Tenant. You can find
              out more information on{" "}
              <a href="https://auth0.com/docs/api">setting up APIs</a> in the
              Auth0 Docs.
            </p>
            <p>
              The audience is the identifier of the API that you want to call
              (see{" "}
              <a href="https://auth0.com/docs/get-started/dashboard/tenant-settings#api-authorization-settings">
                API Authorization Settings
              </a>{" "}
              for more info).
            </p>

            <p>
              In this sample, you can configure the audience in a couple of
              ways:
            </p>
            <ul>
              <li>
                in the <code>src/index.js</code> file
              </li>
              <li>
                by specifying it in the <code>auth_config.json</code> file (see
                the <code>auth_config.json.example</code> file for an example of
                where it should go)
              </li>
            </ul>
            <p>
              Once you have configured the value for <code>audience</code>,
              please restart the app and try to use the "Ping API" button below.
            </p>
          </Alert>
        )}

        <Button
          color="primary"
          className="mt-5"
          onClick={callApi}
          disabled={!audience}
        >
          Ping API
        </Button>

        <div></div>

        <Button
          color="primary"
          className="mt-5"
          onClick={callWeatherForecastApi}
          disabled={!audience}
        >
          Ping WeatherForecast
        </Button>

      </div>
      {weatherData && (
        <div>
          <h2>Weather Forecast</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Temperature (°C)</th>
                <th>Temperature (°F)</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {weatherData.map((forecast, index) => (
                <tr key={index}>
                  <td>{forecast.date}</td>
                  <td>{forecast.temperatureC}</td>
                  <td>{forecast.temperatureF}</td>
                  <td>{forecast.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="result-block-container">
        {state.showResult && (
          <div className="result-block" data-testid="api-result">
            <h6 className="muted">Result</h6>
            <Highlight>
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace' }}>
                {typeof state.apiMessage === "object"
                  ? JSON.stringify(state.apiMessage, null, 2)
                  : <span dangerouslySetInnerHTML={{ __html: state.apiMessage }} />}
              </pre>
            </Highlight>
          </div>
        )}
        {state.error && (
          <div className="error-block" data-testid="api-error">
            <h6 className="text-danger">Error</h6>
            <Highlight>
              <span>state.error</span>
            </Highlight>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuthenticationRequired(ExternalApiComponent, {
  onRedirecting: () => <Loading />,
});
