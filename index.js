const core = require("@actions/core");
const wait = require("./wait");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const apiKey = core.getInput("api_key");
    core.setSecret(apiKey);

    core.info("Authenticating with Testkit...");

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
