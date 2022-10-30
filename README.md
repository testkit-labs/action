# Testkit GitHub Action

This is a GitHub action to run your Testkit tests in CI.
You will need to have an account on [Testkit](https://app.testkit.app) to use this action.

**NOTE:** Testkit is currently in private beta. If you want to use Testkit while in private beta, [sign up for the waitlist on testkit.app](https://testkit.app).

## Usage

Create an API Key in the Testkit Dashboard by clicking on "Settings" in the navigation and then on "API Keys"

Copy the API Key and add it to your GitHub repository as an actions secret named `TESTKIT_API_KEY`.

Then include the following in your workflow file:

```yaml
- uses: testkit-labs/action@latest
  with:
    api_key: ${{ secrets.TESTKIT_API_KEY }}
```

A full example workflow file:

```yaml
name: "units-test"
on:
  pull_request:
  push:
    branches:
      - main
      - 'releases/*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: testkit-labs/action
      with:
        api_key: ${{ secrets.TESTKIT_API_KEY }} 
```

### Bugs and feature requests

This action is currently in beta, just like Testkit itself.

Feel free to open a new issue for any bugs or feature requests.
You can also contact us at [support@testkit.app](mailto:support@testkit.app).
