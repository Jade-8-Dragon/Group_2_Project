<!--
Gen AI usage: ChatGPT (OpenAI).
I used ChatGPT to help write this testing README and provide the
Docker commands to install dependencies and run the tests.
I wrote the project code and ran the commands myself.
-->

# Testing

We use Mocha, Chai, and Chai HTTP to test registration and make sure
the app gives the right responses.

# Setup

Make sure Docker Desktop is running. Create `.env.test` using
`.env.test.example`. The tests use `db-test` as the database host,
and the database name must end in `_test`.

Do not upload `.env` or `.env.test` to GitHub.

Run these commands from the `ProjectSourceCode` folder.

Install the test dependencies:

```powershell
docker compose -p lab10-tests -f docker-compose.test.yaml run --rm --no-deps tests npm ci
```

Run the tests:

```powershell
docker compose -p lab10-tests -f docker-compose.test.yaml up --abort-on-container-exit --exit-code-from tests
```

# Registration

The registration form sends a POST request to `/register` with:
- username
- email
- password
- role

The username must be 1–50 characters after removing extra spaces.
The email must be valid and no longer than 255 characters.
The password must have at least 8 characters, fit within 72 UTF-8
bytes, and include a number and a supported special character.
The role must be `customer` or `musician`.

Successful registration returns a 302 redirect to `/login` and saves
one user in the database. The password is saved as a bcrypt hash.

Invalid input returns a 302 redirect to `/register?error=...`.

# What We Test

- `/welcome` returns status 200 and the expected welcome message.
- The validation function rejects a missing password without making
  an HTTP request or using the database.
- Valid registration redirects to login and creates exactly one user
  with the correct email, role, and password hash.
- Registration without a password is rejected and does not create a user.

The registration route uses the same validation function as the unit test.

# Test Data and Cleanup

The tests use a separate database from the website's development database.

Each registration test uses a generated username. That user's record
is deleted before and after each test so the tests can run again
without manually fixing the database. The database connection pool
closes when the tests finish.

# Results

We ran the tests twice without manually changing any database records.

- First run: 4 passing, exit code 0.
- Second run: 4 passing, exit code 0.

# Stopping the Test Containers

```powershell
docker compose -p lab10-tests -f docker-compose.test.yaml down
```

This removes the test containers but keeps their volumes.