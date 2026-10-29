# Project Proposal: Team 012-2

## 1. Team Number

**012-2**

## 2. Team Name

**Super Flying Airplane Team**

## 3. Team Members

| Name | GitHub username | Email |
|---|---|---|
| Jade Lerch | [Jade-8-Dragon](https://github.com/Jade-8-Dragon) | jade.lerch@colorado.edu |
| Fio Stepanuga | [FioStepanuga](https://github.com/FioStepanuga) | fio.stepanuga@colorado.edu |
| Misha Oberdorfer | [MishaOberdorfer](https://github.com/MishaOberdorfer) | misha.oberdorfer@colorado.edu |
| Colin Voress | [colinvoress6](https://github.com/colinvoress6) | colin.voress@colorado.edu |
| Cody Murschel | [Going-Merry-Crypto](https://github.com/Going-Merry-Crypto) | cody.murschel@colorado.edu |
| Seth Ciancio | [Setherino](https://github.com/Setherino) | seth.ciancio@colorado.edu |

## 4. Application Name

**Music Identifier**

## 5. Application Description

Music Identifier is a musician booking website that connects people who want live music with local musicians who are available to perform. Customers can browse musicians and open a musician's profile to see who they are, where they play, what they charge and when they are available, so they can find the right performer for a party, wedding, restaurant night or other event without searching across social media.

Musicians register an account, build a profile and use the Create page to post their availability: the dates and times they are free, the area they can play in, and their price for that slot. Their posted availability appears on their profile and in the browse list, so customers looking for a performer on a given day can see right away who is free. This gives independent and early-career performers a simple way to fill their calendar and be found by people who are actively looking to hire, without needing their own website or a booking agent.

Both customers and musicians can view and edit their own profile at any time to keep their information up to date. The application stores accounts, musician profiles and availability in a PostgreSQL database, served by a Node.js/Express back end with Handlebars pages, all running in Docker containers.

## 6. Audience

The application has two kinds of users:

- **Customers:** people planning an event (private parties, weddings, small venues, restaurants, community events) who want to hire a musician but don't know where to find local talent or who is free on their date. Their problem is that musicians are scattered across social media and word of mouth, with no single place to compare performers, prices and availability.
- **Musicians:** local and independent performers who want more paid gigs. Their problem is visibility: they need a simple way to show when they are available, where they play and what they charge to people who are actively looking to hire.

Usability and accessibility: most customers will browse on a phone, so pages use a simple mobile-first layout with a fixed Home / Discover / Create navigation bar, large tap targets, a single search box instead of complex search forms, readable text, labelled form fields and alt text on images.

## 7. Vision Statement

For event planners and venues **who** want to hire live local music, **Music Identifier** is a musician booking website **that** shows which local musicians are available, where they play and what they charge, all in one place. **Unlike** searching social media or relying on word of mouth, **our product** lets customers see at a glance who is free for their event and lets musicians fill their calendar by simply posting their availability.

## 8. Version Control

Public GitHub repository: <https://github.com/Jade-8-Dragon/Group_2_Project>

All team members have been invited as collaborators and have accepted, except Seth Ciancio (`Setherino`), whose invite is pending.

Repository root:

- `TeamMeetingLogs/`: weekly TA meeting minutes (`MeetingMinutes_012-2.md`)
- `MilestoneSubmissions/`: this proposal, the use case diagram and the wireframes
- `ProjectSourceCode/`: application source code, `docker-compose.yaml`, and the project `.gitignore`
- `README.md`

## 9. Development Methodology

We will use a hybrid **Agile** approach for the 4-week project:

- **Kanban board:** our GitHub Projects board, <https://github.com/users/Setherino/projects/1>, with Todo / In Progress / Done columns. Each feature or page is a GitHub issue (user story) in our repository, picked up by one team member.
- **Branches and pull requests:** each member works on their own branch and opens a pull request into `main`; another team member reviews and merges it.
- **Weekly sprint check-in:** at each team meeting we review the board, move finished work to Done, and assign the next week's tasks.
- **Commit cadence:** each member commits regularly (at least one commit per week, aiming for several days per week).

## 10. Communication Plan

Our team communicates through our **Discord** server, which we use to coordinate work, share updates and plan meetings. Task-level discussion is tracked as comments on the GitHub issues on our project board, and we communicate with our TA in our weekly meeting and by email.

## 11. Meeting Plan

- **Team meeting:** Tuesdays at 6:30 PM, in person at Norlin Library.
- **Weekly meeting with TA:** Mondays at 9:00 AM, online over Zoom.

## 12. Use Case Diagram

See [`Use_Case_Diagram_012-2.pdf`](Use_Case_Diagram_012-2.pdf) (drawn by Colin Voress).

Key features shown (7): register an account, log in, browse musicians, post availability, view a musician's profile, view own profile, and edit own profile. Actors: Customer and Musician.

## 13. Wireframes

All files are in [`wireframes/`](wireframes/):

| Page | Use case(s) | Wireframe |
|---|---|---|
| Home | Browse musicians | `Home_012-2.jpeg` |
| Login | Log in | `Login_012-2.png`, `login_012-2.html` |
| Register | Register account | `Register_012-2.png`, `register_012-2.html` |
| Discover | Browse musicians | `Discover_012-2.svg` |
| Musician Profile | View musician profile | `MusicianProfile_012-2.png`, `musicianProfile_012-2.html` |
| Create | Post availability | `Create_012-2.svg` |
| User Profile | View own profile | `UserProfile_012-2.svg`, `userProfile_012-2.html` |
| Edit Profile | Edit own profile | `EditProfile_012-2.svg` |

## Extra Credit: Risk Analysis

**This section is our submission for the Lab 8 extra credit.**

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | Sorting and filtering musician pages by the genre a customer wants is harder than expected (genre isn't stored in the current schema). | Medium | Add a `genre` column/table to the schema in week 1; build the Discover page with a single genre filter first, and add sorting only once filtering works. |
| 2 | The site is hacked and user information leaks (e.g. SQL injection, stolen passwords). | High | Hash passwords with bcrypt, never store plain text; use parameterized queries only; keep secrets in `.env` (git-ignored); protect pages with session-based authentication; add tests for login/registration edge cases. |
| 3 | The user profile page isn't finished on time. | Low | Keep the first version minimal (username, email, account type, posted availability) and assign it an owner and due date on the board in week 1. |
| 4 | Taking payment information for bookings (and a platform fee) is too complex and risky to build in 4 weeks. | High | Treat payments as out of scope for the MVP: customers contact or request a musician through the site; if time allows, use a hosted test-mode provider (e.g. Stripe Checkout) so we never handle card numbers ourselves. |
| 5 | The artist information page depends on several tables (users, musician profiles, availability), so it may slip. | Medium | Build it in stages: profile text from the database first, then posted availability, then extras such as photos; use the sample data in `insert.sql` so the page can be developed before the forms that fill it are finished. |

---

### Gen AI usage

Documented per the CSCI 3308 syllabus ("Usage of Gen AI tools"):

- **Tool:** Claude (Anthropic), via Claude Code, 2026-10-28
- **Plan:** No plan was written before this prompt.
- **Prompt:** "Complete all missing items and document your work properly per course instructions"
- **Response (significant parts):** Claude drafted this proposal's wording for items 4–7, 9, 13 and the extra-credit severities and mitigations, using only what was already in the repo: the README, `create.sql` / `insert.sql`, the team's wireframes, and the risks the team listed in `Meeting_Notes_10-26_012-2.txt`. Team number, names and GitHub usernames come from file names and commit history. Team name, emails (first.last@colorado.edu), meeting times, TA contact and invite status were provided by Seth Ciancio. Claude left every team decision it could not verify as "TEAM TO FILL". It also generated the Discover, Create and User Profile wireframe SVGs with a Python script. (An AI-generated use case diagram was replaced by the team's hand-drawn one, which Claude only renamed to add the team number.)
- **Second prompt (Claude, 2026-10-28):** "Make the github actions board now and document what you did, just use this prompt as the prompt"
- **Plan:** No plan was written before this prompt.
- **Response (significant parts):** Claude created the GitHub Projects board <https://github.com/users/Setherino/projects/1> (Todo / In Progress / Done) on Seth's account. It opened issues #8–#19 in the team repository for the remaining project work: Lab 8 (In Progress); genre schema, Express/Handlebars setup, register/login with sessions, Home, Discover, Create, musician profile, user profile, reviews, tests and deployment (Todo). It also added five Done cards for work teammates had already finished, credited by name from the commit history. It updated item 9 of this proposal with the board link.
- **Third prompt (Claude, 2026-10-28):** "Fix 3, 4, 5, and 6. THen fix 8, 9. For 10, change the proposal in favor of the diagram. Properly document every change. Mode for meeting one was zoom, meeting 2 was in Norlin Library."
- **Plan:** No plan was written before this prompt.
- **Response (significant parts):**
  - Filled in item 11 with the meeting modes and locations Seth gave (TA meeting on Zoom, team meeting at Norlin Library).
  - Removed every "TEAM TO FILL" placeholder and the pre-submission notes.
  - Rewrote items 5–7 and the extra-credit mitigations for risks 3 and 5 so they describe the features in the team's use case diagram (register, log in, browse musicians, post availability, view a musician's profile, view and edit own profile), replacing earlier AI-drafted text about songs, genres and reviews.
  - Regenerated the Discover and Create (post availability) and User Profile wireframes to match the diagram, and added an Edit Profile wireframe.
  - Renamed the team's wireframe files and the 10-26 meeting notes to include team number 012-2, and updated the links between the login and register HTML wireframes.
  - Removed `LICENSE` from the repository root so it holds only the folders and README the lab lists.
  - Filled in the date and mode of the 10/26 meeting in `MeetingMinutes_012-2.md`.
- **Reviewed by:** Seth Ciancio.
