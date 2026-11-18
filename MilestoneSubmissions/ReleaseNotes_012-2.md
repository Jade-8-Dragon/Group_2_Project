# Release Notes, Team 012-2 (Reserve Music)

A list of updates made since the last TA meeting. Newest week first.


## Week 3: 2026-11-11 (TA meeting)

Work from after the 11/11 TA meeting up to the 11/18 TA meeting.

### Added
#### WED 11/11:
- Fio added reviews to the musician profile (#68, `aa446c4`)
- Jade added Express routes for the Discover and Create pages, plus redirects from the old .html names to the new routes (#67, `0a4422f`)
- Seth added the Lab 10 UAT plan (milestones/uat-plan.md) (#71, `7a23acc`)
- Colin added the 11/11 meeting minutes (`f6287d9`, `9fa2959`, direct to main)
- Misha added keyboard focus outlines and a nav bar that wraps on small screens (#78, `b3ff199`)
- Cody added JavaScript for the home page (#73, `f52584c`)
- Cody started the Discover and Create page JavaScript (#73, `148ebe2`)

#### THU 11/12:
- Seth added register errors under the field they belong to (#97, `d85b1a9`)
- Seth added login error messages above the Login button (#101, `717247f`)
- Cody added an About page file (empty for now) (#103, `0245ff5`)

#### TUE 11/17:
- Colin added password reset (forgot password and reset password pages) (#107, `f07efb2`)



### Changed
#### WED 11/11:
- Seth narrowed the UAT plan to the features the Lab 10 PRs cover (#71, `59325ac`)
- Misha updated the website colors (#78, `f22c2a6`)

#### THU 11/12:
- Seth merged jade_testing into main: registration validation check and UAT plan (#95, `730372a`)
- Colin changed the password creation error message (#102, `6f48c53`)
- Cody moved the Discover and Create page buttons around (#103, `0245ff5`)
- Cody updated how the Discover and Create pages look (#106, `c97fef6`)
- Misha updated the CSS (#78, `419bbaa`)



### Fixed
#### WED 11/11:
- Fio fixed bio editing on the musician profile (#68, `adc88ef`)
- Fio fixed the Discover nav for when the Create page is added (#68, `71232d9`)
- Fio added the musicians_profile file that didn't move the first time (#68, `19f6651`)
- Seth restored the registration validation check lost in a merge (#69, `6899d6c`)
- Misha fixed a wrong password creating a new account, added her tests and README (#78, `7e973e6`)

#### THU 11/12:
- Fio fixed registration inserting the user twice (#104, `514afcc`)



### Removed
#### THU 11/12:
- Fio removed the duplicate src/musicians_profile.js (#104, `514afcc`)
- Cody deleted the home page and its JavaScript (#103, `0245ff5`)



### Next week
- Deploy the website to Render (Lab 12).
- Finish the small things left on the website (from the 11/18 meeting).
- In review: Logout button on the profile pages (#108) and color theme for the profile pages (#109).


## Week 2: 2026-11-04 (TA meeting)

Work from after the 11/4 TA meeting up to the 11/11 TA meeting.

### Added
#### WED 11/4:
- Fio added JavaScript that fills the profile pages with the user's info (#54, `a96a0f6`; #56, `0f66db0`)
- Cody added the summary of the 11/4 meeting to the meeting minutes (#44, `f533391`)

#### THU 11/5:
- Jade set up a runnable Express server and connected the existing pages (#55, `82db85f`)
- Jade added registration validation and secure login sessions (#55, `da35c99`)
- Jade added the logged-in musician directory and profile APIs (#55, `5987f77`)
- Jade added Mocha and Chai for testing (#61, `d1ed7e3`, `9cf8137`)
- Misha added CSS for the login and registration pages (#78, `bb22337`)

#### SUN 11/8:
- Cody started the Discover and Create pages (#64, `085be0a`)

#### MON 11/9:
- Fio added JavaScript for the musician profile and for changing the bio (#68, `ab63339`)

#### TUE 11/10:
- Misha added the orange and purple color theme (#78, `bafced0`)

#### WED 11/11:
- Jade added the Lab 10 Mocha test files (#65, `a4419f3`)



### Changed
#### THU 11/5:
- Misha refactored the pages (`f59652e`, direct to main)
- Misha reworked the error messages (#62, `07ec87a`)
- Colin split the server: app.js holds the API routes and index.js starts the server (#63, `5d9779b`)



### Fixed
#### WED 11/4:
- Fio fixed the JavaScript and GET routes (#54, `a96a0f6`)
- Cody fixed the meeting minutes formatting (#50, `49a5f43`; #51, `19ddd68`)

#### THU 11/5:
- Colin fixed the paths for links (#63, `262cafa`)

#### TUE 11/10:
- Colin fixed a bug with register and login (#66, `eb63898`)



### Removed
#### WED 11/4:
- Fio removed duplicate HTML pages (#54, `a96a0f6`)


## Week 1: 2026-10-26 (TA meeting)

### Added
#### MON 10/26:
- Misha added starter stylesheet and blank login/registration page files (`ec0091e`, direct to main)

#### TUE 10/27:
- Misha added 10-26 meeting notes (`82fedd4`, direct to main)
- Misha finished the login wireframe (`2ca620d`, direct to main)
- Misha worked on the login page (`bee174e`, direct to main)
- Misha added lab 8 details to the meeting notes. (`1d9bb58`, direct to main)
- Misha finished the login & registration wireframes (`c14ad7f`, `e43f9b1`, direct to main)
- Colin added README (#3, `40380da`)
- Cody added home page wireframe (#4, `a045091`)

#### WED 10/28:
- Colin added more README (#5, `bdb67aa`)
- Misha added email and customer/musician role on registration and email on login (`2006f7b`, direct to main)
- Seth added README: app description, contributors, tech stack (#6, `209330e`, `35b8311`, `9c07f59`)
- Misha completed extra-credit component of the meeting notes. (`9f112d2`, direct to main)
- Misha drew login and register wireframes (`046233b`, direct to main)
- Misha drew musician profile and user profile page HTML starters. (`0845f36`, direct to main)
- Colin finished the README (#7, `096d14d`)
- Colin uploaded the use case diagram PDF and renamed it (`8beff7f`, `0c11d3d`, direct to main)
- Seth completed Lab 8 project proposal, discover/create/user profile wireframes, and meeting minutes. (#20, `afc01c7`)
- Seth completed project proposal, Discord, team name, emails, meeting times, TA contact, project board link. (#20, `ecc9e57`, `d763e81`, `bed5190`, `10938e5`)

#### THUR 10/29:
- Misha brought in index.js from lab 7 without handlebars and added starter CSS (`fc6bb03`, `6b744df`, `f5c9633`, direct to main)

#### MON 11/2:
- Seth added the user profile page (#43, `1787102`)
- Colin added secure password rules to the registration logic (#45, `55594ad`)

#### TUE 11/3:
- Misha added nav bar on the home and profile pages. (`1124487`, direct to main)
- Seth added Musician profile page (#46, `2a63797`)

#### WED 11/4:
- Colin added email on login and registration (#48, `ad9b9ce`)
- Misha added logout redirect and page JS (`6bc70ca`, `e60c3b6`, direct to main)
- Misha shared CSS stylesheet, linked by every page. (`c52422e`, direct to main)
- Seth added releaseNotes_12-2.md




### Changed
#### WED 10/28:
- Seth switched to colin's use case diagram and added the team number to the filename (#20, `800ed02`)
- Misha added team number to the wireframes (`f993ce2`, direct to main)
- Seth added README description matched to the use case diagram (#20, `e414048`)
- Seth added all six members to the proposal collaborator list (`87be5e2`, direct to main)

#### MON 11/2:
- Fio moved the HTML pages into ProjectSourceCode/pages/ (#42, `bd31b01`)

#### TUE 11/3:
- Colin centered the login and registration text (also committed .DS_Store) (#47, `36d34b4`)




### Fixed
#### WED 10/28:
- Cody fixed the home wireframe (#21, `c4df84c`)




### Removed
#### WED 10/28:
- Misha removed extra CSS file (`ac3f4ab`, direct to main)

### Next week
