-- AfterPlot Database Schema
-- PostgreSQL

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  avatar_url VARCHAR(500),
  banner_url VARCHAR(500),
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(6),
  verification_token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Series Table
CREATE TABLE series (
  id BIGINT PRIMARY KEY, -- TMDB ID
  title VARCHAR(255) NOT NULL,
  description TEXT,
  poster_path VARCHAR(500),
  backdrop_path VARCHAR(500),
  first_air_date DATE,
  last_air_date DATE,
  status VARCHAR(50), -- Returning Series, Ended, Cancelled, etc
  vote_average DECIMAL(3,1),
  total_seasons INTEGER,
  genres JSONB, -- Array of genre IDs and names
  is_popular BOOLEAN DEFAULT FALSE,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Series (following/status tracking)
CREATE TABLE user_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  series_id BIGINT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'SIGUIENDO', -- SIGUIENDO, PAUSADA, COMPLETADA, ABANDONADA
  is_favorite BOOLEAN DEFAULT FALSE,
  custom_poster_path VARCHAR(500), -- User can choose different poster
  custom_backdrop_path VARCHAR(500), -- User can choose different banner
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_watched_at TIMESTAMP,
  UNIQUE(user_id, series_id)
);

-- Episodes Table
CREATE TABLE episodes (
  id BIGINT PRIMARY KEY, -- TMDB Episode ID
  series_id BIGINT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  title VARCHAR(255),
  description TEXT,
  air_date DATE,
  runtime INTEGER,
  still_path VARCHAR(500),
  vote_average DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(series_id, season_number, episode_number)
);

-- User Episode Logs (watch history and reactions)
CREATE TABLE episode_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id BIGINT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  is_watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  platform VARCHAR(50), -- Netflix, Prime Video, HBO Max, Otro, Pirata, etc
  emotion_emoji VARCHAR(10), -- Emoji representing emotion
  favorite_character VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emotions Mapping (for emoji selection)
CREATE TABLE emotions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  description VARCHAR(255)
);

-- Seed emotions
INSERT INTO emotions (name, emoji, description) VALUES
('Sorprendido', '😲', 'Surprised'),
('Enfadado', '😠', 'Angry'),
('Triste', '😢', 'Sad'),
('Pensativo', '🤔', 'Thoughtful'),
('Emocionado', '🤩', 'Excited'),
('Divertido', '😄', 'Funny'),
('Asustado', '😨', 'Scared'),
('Aburrido', '😒', 'Bored'),
('Previsible', '🙄', 'Predictable'),
('Entusiasmado', '🤗', 'Enthusiastic'),
('Confundido', '😵', 'Confused'),
('Intranquilo', '😰', 'Anxious');

-- Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id BIGINT NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  spoiler_warning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follows Table (social)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Streaming Providers Table
CREATE TABLE streaming_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  logo_path VARCHAR(500)
);

-- Series Streaming Providers (which platforms have the series)
CREATE TABLE series_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id BIGINT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  provider_id INTEGER NOT NULL REFERENCES streaming_providers(id),
  region VARCHAR(10) DEFAULT 'ES',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings Table (for aggregate series ratings)
CREATE TABLE series_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id BIGINT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(series_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_series_user_id ON user_series(user_id);
CREATE INDEX idx_user_series_series_id ON user_series(series_id);
CREATE INDEX idx_episode_logs_user_id ON episode_logs(user_id);
CREATE INDEX idx_episode_logs_episode_id ON episode_logs(episode_id);
CREATE INDEX idx_episode_logs_watched_at ON episode_logs(watched_at);
CREATE INDEX idx_episodes_series_id ON episodes(series_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_episode_id ON comments(episode_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_series_ratings_user_id ON series_ratings(user_id);
CREATE INDEX idx_series_ratings_series_id ON series_ratings(series_id);
