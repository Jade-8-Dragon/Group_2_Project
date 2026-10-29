# Group_2_Project
Group 2 project CSCI 3308 Music Identifier




# Application Description

Music identifier is a site for finding, hiring and reviewing musicians to perform for you.

# Contributors

- Jade Lerch, Jade-8-Dragon on GitHub
- Fio Stepanuga, FioStepanuga on GitHub
- Misha Oberdorfer, MishaOberdorfer on GitHub
- Colin Voress, colinvoress6 on GitHub
- Cody Murschel, Going-Merry-Crypto on GitHub
- Seth Ciancio, Setherino on GitHub

# Tech Stack

- Server Layer: Node.js with Express 4
- Pages & templates: Handlebars
- Styling: Bootstrap 5.3, and style.css
- Database: PostgreSQL
- Containers: Docker Compose
- Configuration: dotenv
- Testing: Mocha and Chai
- Version control and hosting: Git via GitHub

# Prerequisites

Make sure the following are installed in order to run the application (You will also need access to the project repository and any environment variables.):

## Node.js and npm

Used to run the application and install dependencies

## Git

Used to clone the project repository

## PostgreSQL

Used for the application's database.


# Running the application locally

## 1. Clone the repository

git clone <repository-url>

## 2. navigate to the project directory

cd Group_2_Project

## 3. Install dependencies

npm install

## 4. Environment

Configure the required environment variables in a .env file. These may include the database connection details and application configuration. Refer to the project's environment configuration instructions for the required variable names and values.

## 5. Make sure PostgreSQL is running

## 6. Start the application

npm start

## 7. Open the app in your browser

http://localhost:3000

# Application Deployment

The link to the deployed application will be posted here when the app is complete

# Running the Tests

## From the project root, run 'npm install', and 'npm test'


# Database Documentation

## Overview

The project uses PostgreSQL to store user accounts, musician profile information, and customer reviews. The database is managed through Docker Compose.

## Database Tables

### `users`

Stores account information for customers and musicians.

- `user_id`: Primary key; automatically generated.
- `username`: Unique username.
- `email`: Unique email address.
- `password_hash`: Stores the password hash.
- `user_type`: Identifies the account as either `customer` or `musician`.
- `created_at`: Timestamp indicating when the account was created.

### `musician_profiles`

Stores additional profile information for musicians.

- `user_id`: Primary key and foreign key referencing `users.user_id`.
- `stage_name`: Musician's stage name.
- `bio`: Musician's biography.
- `location`: Musician's location.
- `starting_price`: Musician's starting price.

Deleting a user also deletes their associated musician profile.

### `reviews`

Stores reviews submitted by customers about musicians.

- `review_id`: Primary key; automatically generated.
- `customer_id`: Foreign key referencing the customer account in `users`.
- `musician_id`: Foreign key referencing the musician account in `users`.
- `rating`: Integer between 1 and 5.
- `comment`: Optional written feedback.
- `created_at`: Timestamp indicating when the review was created.

The schema prevents users from reviewing themselves. The application should also validate that the reviewer is a customer and the reviewed account is a musician.

## Running the Database

From the `ProjectSourceCode` directory, start the services:

```bash
docker compose up -d
```

Connect to PostgreSQL:

```bash
docker compose exec db psql -U postgres -d group_project
```

## Inspecting the Database

Run these commands inside the PostgreSQL prompt:

```sql
\dt
```

Lists database tables.

```sql
\d users
\d musician_profiles
\d reviews
```

Displays each table's columns, types, and constraints.

## Example Query: View Reviews

```sql
SELECT
    r.review_id,
    customer.username AS customer_name,
    musician.username AS musician_name,
    r.rating,
    r.comment,
    r.created_at
FROM reviews AS r
JOIN users AS customer
    ON r.customer_id = customer.user_id
JOIN users AS musician
    ON r.musician_id = musician.user_id
ORDER BY r.created_at DESC;
```

## Schema Changes

The SQL initialization scripts are located in `src/init_data/`. PostgreSQL's Docker image runs these scripts when initializing a new, empty database data directory. Changes to these files do not automatically update an already-initialized database.

When changing the schema, apply the required SQL changes to existing databases and keep the initialization scripts up to date so new database setups have the correct schema.

**Important:** Do not delete the database's Docker volume just to apply a schema change unless you intend to erase its persisted data.
