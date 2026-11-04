-- Insert sample customers and musicians
INSERT INTO users (username, email, password_hash, user_type, avatar_url)
VALUES
    ('Alex Johnson', 'alex@example.com', 'placeholder_hash_1', 'customer', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6Ynjy4iPPiK4kwSMrsXcCd_DAyftiF1G2D6PCkZUYbQ&s=10'),
    ('Emily Davis', 'emily@example.com', 'placeholder_hash_2', 'customer', NULL),
    ('Michael Smith', 'michael@example.com', 'placeholder_hash_3', 'musician', NULL),
    ('Sarah Wilson', 'sarah@example.com', 'placeholder_hash_4', 'musician', NULL),
    ('Daniel Brown', 'daniel@example.com', 'placeholder_hash_5', 'musician', NULL);


-- Insert sample reviews
INSERT INTO reviews (customer_id, musician_id, rating, comment)
VALUES
    (1, 3, 5, 'Amazing guitarist! Everyone loved the performance.'),
    (2, 3, 4, 'Great music and very professional.'),
    (1, 4, 5, 'Fantastic singer. Would absolutely hire again.'),
    (2, 5, 3, 'Good performance, but arrived a little late.');

