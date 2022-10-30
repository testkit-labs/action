const core = require("@actions/core");
const http = require("@actions/http-client");

const BASE_URL = "https://app.testkit.app/api/v1";
const INITIAL_DELAY = 10000;
const POLL_INTERVAL = 3000;
const POLL_LIMIT = 1200;

let client;
let pollCount = 0;
let currentGroupRun;

// most @actions toolkit packages have async methods
async function run() {
  try {
    const apiKey = core.getInput("api_key");
    core.setSecret(apiKey);

    const authBearer = new http.BearerCredentialHandler(apiKey);
    client = new http.HttpClient("testkit-action", [authBearer]);

    await authenticate();
    await runTestSuites();
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function poll() {
  if (pollCount > POLL_LIMIT) {
    core.setFailed(
      "Polling limit reached. Tests are running for more than 60 minutes."
    );
    return;
  }

  const response = client.getJson(
    `https://app.testkit.app/api/v1/run/${currentGroupRun.id}`
  );

  if (response.message.statusCode !== 200) {
    throw new Error("Failed to poll for test results");
  }

  const { finished, id, runs } = await response.readBody();
  runs.forEach((run) => {
    const { id, status, name } = run;
    const previousRunState = currentGroupRun.runs.find((r) => r.id === id);
    if (status !== previousRunState.status) {
      core.info(`Test suite ${name} status: ${status}...`);
    }
  });

  currentGroupRun = { finished, id, runs };

  if (finished) {
    logSummary(runs);
    const didFail = runs.some((run) => run.status === "failed");
    didFail
      ? core.setFailed("Some test suites failed")
      : core.info("Test suite passed");
    return;
  }

  pollCount++;
  setTimeout(poll, POLL_INTERVAL);
}

async function authenticate() {
  core.info("Authenticating with Testkit...");
  const response = await client.postJson(`${BASE_URL}/ci_auth`);

  if (response.message.statusCode !== 200) {
    throw new Error(
      `Testkit authentication failed: ${response.message.statusMessage}`
    );
  }
  const { name } = await response.readBody();
  core.info(`Authenticated as Organization: ${name}`);
}

async function runTestSuites() {
  core.info("Running tests...");
  const testResponse = await client.postJson(`${BASE_URL}/run`);
  if (testResponse.message.statusCode !== 200) {
    throw new Error(
      `Testkit test run failed: ${testResponse.message.statusMessage}`
    );
  }

  const { id, runs } = await testResponse.readBody();
  currentGroupRun = { finished: false, id, runs };
  core.info(`Running ${runs.length} test suites...`);
  setTimeout(poll, INITIAL_DELAY);
}

function logSummary(runs) {
  runs.forEach((run) => {
    const { id, status, name } = run;
    core.info(
      `Test suite ${name} ${status}: https://app.testkit.app/test_suite_runs/${id}`
    );
  });
}

run();
