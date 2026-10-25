CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL
    CHECK (user_type IN ('customer', 'musician')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE musician_profiles (
    user_id INTEGER PRIMARY KEY
        REFERENCES users(user_id) ON DELETE CASCADE,

    stage_name VARCHAR(100),
    bio TEXT,
    location VARCHAR(100),
    starting_price NUMERIC(10, 2)
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,

    musician_id INTEGER NOT NULL
        REFERENCES users(user_id) ON DELETE CASCADE,

    rating INTEGER NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (customer_id <> musician_id)
);