DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM ('draft','open','funded','repaying','closed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('artist','investor','admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status') THEN
    CREATE TYPE loan_status AS ENUM ('active','completed','defaulted');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tx_type') THEN
    CREATE TYPE tx_type AS ENUM ('investment','repayment','royalty','fee');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency_type') THEN
    CREATE TYPE currency_type AS ENUM ('USDC','BRL');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'revenue_source') THEN
    CREATE TYPE revenue_source AS ENUM ('streaming','sales','shows','others');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_type') THEN
    CREATE TYPE doc_type AS ENUM ('kyc','contract','media','other');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL,
  wallet_address VARCHAR(150) UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artists (
  artist_id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(user_id),
  vulgo VARCHAR(100) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  social_links JSONB NOT NULL,
  portfolio_links JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  project_id SERIAL PRIMARY KEY,
  artist_id INT REFERENCES artists(artist_id),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  collected_amount DECIMAL(12,2) DEFAULT 0,
  royalty_percentage DECIMAL(5,2) NOT NULL,
  funding_deadline DATE NOT NULL,
  status project_status NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loans (
  loan_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  project_id INT REFERENCES projects(project_id),
  terms JSONB NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status loan_status NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  tx_id SERIAL PRIMARY KEY,
  loan_id INT REFERENCES loans(loan_id),
  project_id INT REFERENCES projects(project_id),
  from_user INT REFERENCES users(user_id),
  to_user INT REFERENCES users(user_id),
  amount DECIMAL(12,2) NOT NULL,
  currency currency_type NOT NULL,
  tx_type tx_type NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revenue_sources (
  revenue_id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(project_id),
  source_type revenue_source NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) DEFAULT 0,
  oracle_tx_hash VARCHAR(150),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS docs (
  docs_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  project_id INT REFERENCES projects(project_id),
  type doc_type NOT NULL,
  doc_hash VARCHAR(150) NOT NULL,
  s3_storage TEXT,
  verified_by INT REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT now()
);
