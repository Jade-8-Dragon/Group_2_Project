-- Insert sample customers and musicians
INSERT INTO users (username, email, password_hash, user_type)
VALUES
    ('Alex Johnson', 'alex@example.com', 'placeholder_hash_1', 'customer'),
    ('Emily Davis', 'emily@example.com', 'placeholder_hash_2', 'customer'),
    ('Michael Smith', 'michael@example.com', 'placeholder_hash_3', 'musician'),
    ('Sarah Wilson', 'sarah@example.com', 'placeholder_hash_4', 'musician'),
    ('Daniel Brown', 'daniel@example.com', 'placeholder_hash_5', 'musician');


-- Insert sample reviews
INSERT INTO reviews (customer_id, musician_id, rating, comment)
VALUES
    (1, 3, 5, 'Amazing guitarist! Everyone loved the performance.'),
    (2, 3, 4, 'Great music and very professional.'),
    (1, 4, 5, 'Fantastic singer. Would absolutely hire again.'),
    (2, 5, 3, 'Good performance, but arrived a little late.');

