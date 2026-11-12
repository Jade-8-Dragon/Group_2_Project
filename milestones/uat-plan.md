# User Acceptance Test Plan — Reserve Music (Team 012-2)

This plan describes how real users will check that Reserve Music does what our user stories promise. It covers the three features our Lab 10 work touches: registration (#69 and its tests), logging in, and viewing your own profile (the `/api/profile` tests in #70). The results columns stay **Not run** until the project testing milestone; actual results are recorded with the final project report.

## 1. Scope

| Feature | User story | Issues | Automated tests (Lab 10) |
|---|---|---|---|
| F1. Register an account | As a customer or musician, I want to create an account so I can use the site. | #11, #23, #24 | `POST /register` positive and negative tests; `validateRegistration` unit test |
| F2. Log in and log out | As a registered user, I want to log in with my username or email and log out when I'm done, so my account stays private. | #11, #30 | Login step of the `/api/profile` positive test |
| F3. View my own profile | As a logged-in user, I want to see my profile page with my own details, and nobody else should see it without logging in. | #15, #16 | `GET /api/profile` positive and negative tests |

The automated tests check the server's responses. These UAT cases check the same features the way a user meets them: through the pages, in a browser.

Out of scope for this round: browsing and searching musicians, posting availability, editing a profile, reviews and messaging.

## 2. Acceptance criteria

**F1. Register**
- A1.1 Registering with a valid username (1–50 characters), a valid email, a password of 8–72 bytes with a number and a special character, and a role (customer or musician) takes the user to the login page within 3 seconds, and they can then log in with those credentials.
- A1.2 Registering with invalid input (for example a password with no number) keeps the user on the register page, shows a message saying which field is wrong, and creates no account.
- A1.3 Registering with a username or email that is already taken keeps the user on the register page with a message saying so, and does not create a second account.

**F2. Log in and log out**
- A2.1 A registered user who enters their username *or* email with the right password reaches the Discover page.
- A2.2 A wrong password keeps the user on the login page with an error message, and they cannot open Discover or Profile.
- A2.3 After logging out, opening `/discover` or `/profile` sends the user back to the login page.

**F3. View my own profile**
- A3.1 A logged-in musician who opens `/profile` sees the musician profile page with their own username and email, and "No bio yet." / "Not set" where they haven't filled something in.
- A3.2 A logged-in customer who opens `/profile` sees the user profile page, not the musician one.
- A3.3 Someone who is not logged in and opens `/profile` is sent to the login page.

## 3. Test environment

- **Where:** localhost, run with `docker compose up` from `ProjectSourceCode/`, opened at <http://localhost:3000>. Each test session starts from a fresh database (`docker compose down --volumes` first), so earlier test accounts are gone.
- **Accounts:** seeded accounts in `src/init_data/insert.sql` have placeholder passwords and can't log in, so testers register their own accounts as part of the cases below.
- **Browsers and devices:** current Chrome on a laptop for every case, and Safari on an iPhone for at least F1 and F2.
- **App version:** `main` after #69 and #70 are merged. Record the commit hash (`git rev-parse --short HEAD`) in the results at the start of each session.

## 4. Testers

- **Who:** 4 testers, T1–T4. Ideally two people who would hire a musician (customers) and two who play music (musicians). Team members don't test features they built.
- **Recruiting:** each team member brings at most one tester; the team confirms the list at the meeting before the testing milestone.
- **Privacy:** testers are recorded only by ID (T1–T4). Test accounts use made-up names and `@example.com` emails, never the tester's real ones.
- **Limits:** if classmates stand in for real customers and musicians, we note that in the results, because classmates already know how web apps like ours usually work.

## 5. Test cases

Every test case starts from the login page at <http://localhost:3000> unless its preconditions say otherwise. "Status" is one of Not run / Pass / Fail / Blocked.

### F1. Register an account

| Test ID | Feature/requirement | Acceptance criterion | Preconditions | Test data | User steps | Expected result | Tester ID | Actual result | Status | Issue/follow-up |
|---|---|---|---|---|---|---|---|---|---|---|
| UAT-01 | F1 Register | A1.1 | Fresh database; logged out | Username `uat_musician1`, email `uat_musician1@example.com`, password `StagePass1!`, role Musician | 1. Click "Register Here".<br>2. Enter the test data.<br>3. Click Register.<br>4. On the login page, log in with `uat_musician1` / `StagePass1!`. | After step 3 the login page opens within 3 seconds. After step 4 the Discover page opens. | T1 | | Not run | |
| UAT-02 | F1 Register | A1.2 | Logged out | Username `uat_badpass`, email `uat_badpass@example.com`, password `password` (no number or symbol), role Customer | 1. Open the register page.<br>2. Enter the test data.<br>3. Click Register.<br>4. Try to log in with `uat_badpass` / `password`. | Step 3 stays on the register page and says the password needs a number and a special character. Step 4 fails, showing no account was created. | T2 | | Not run | |
| UAT-03 | F1 Register | A1.3 | UAT-01 done (`uat_musician1` exists) | Username `uat_musician1`, email `another@example.com`, password `StagePass1!`, role Customer | 1. Open the register page.<br>2. Enter the test data.<br>3. Click Register. | Stays on the register page with a message that the username or email is already taken. | T2 | | Not run | |

### F2. Log in and log out

| Test ID | Feature/requirement | Acceptance criterion | Preconditions | Test data | User steps | Expected result | Tester ID | Actual result | Status | Issue/follow-up |
|---|---|---|---|---|---|---|---|---|---|---|
| UAT-04 | F2 Log in | A2.1 | Account `uat_customer1` / `uat_customer1@example.com` / `ShowTime2!` (Customer) registered; logged out | Email `UAT_Customer1@example.com` (mixed case), password `ShowTime2!` | 1. Enter the email and password.<br>2. Click Log in. | The Discover page opens. Email matching ignores case. | T3 | | Not run | |
| UAT-05 | F2 Log in | A2.2 | Same account as UAT-04; logged out | Username `uat_customer1`, password `WrongPass9!` | 1. Enter the username and wrong password.<br>2. Click Log in.<br>3. Type `localhost:3000/discover` in the address bar. | Step 2 stays on the login page with an error message. Step 3 goes back to the login page. | T3 | | Not run | |
| UAT-06 | F2 Log out | A2.3 | Logged in as `uat_customer1` | — | 1. Go to `localhost:3000/logout`.<br>2. Type `localhost:3000/discover` in the address bar.<br>3. Type `localhost:3000/profile`. | Step 1 shows the logout page. Steps 2 and 3 each go to the login page. | T4 | | Not run | |

### F3. View my own profile

| Test ID | Feature/requirement | Acceptance criterion | Preconditions | Test data | User steps | Expected result | Tester ID | Actual result | Status | Issue/follow-up |
|---|---|---|---|---|---|---|---|---|---|---|
| UAT-07 | F3 Profile | A3.1 | UAT-01 done; logged in as `uat_musician1` | — | 1. Go to `localhost:3000/profile`. | The musician profile page shows `@uat_musician1` and `uat_musician1@example.com`, with "No bio yet." for bio and "Not set" for location and price. | T1 | | Not run | |
| UAT-08 | F3 Profile | A3.2 | UAT-04 done; logged in as `uat_customer1` | — | 1. Go to `localhost:3000/profile`. | The user (customer) profile page opens, not the musician page. | T3 | | Not run | |
| UAT-09 | F3 Profile | A3.3 | Logged out | — | 1. Type `localhost:3000/profile` in the address bar. | The login page opens. | T4 | | Not run | |

## 6. Results

Fill in **Actual result**, **Status** and **Issue/follow-up** in the tables above during the testing milestone, along with:

- the date and commit hash of each session
- for every Fail or Blocked: what happened, a screenshot if useful, and the GitHub issue opened for it

Known gaps when this plan was written, so testers aren't surprised: the register and login pages don't display the `?error=` message the server sends yet (UAT-02, UAT-03, UAT-05), and no page links to Log out yet (UAT-06 uses the `/logout` address directly). These cases describe the behaviour we're committing to; if the gaps are still there at testing time, the cases will fail and we record that.
