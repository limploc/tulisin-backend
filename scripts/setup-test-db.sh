#!/bin/bash

echo "Setting up test database..."

if [ -f .env.test ]; then
    export $(cat .env.test | grep -v '#' | xargs)
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-password}"
DB_NAME="${DB_NAME:-tulisin_test}"

echo "Using database configuration:"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo "Database: $DB_NAME"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo "Error: PostgreSQL is not running or not accessible with user $DB_USER"
    echo "Please check your PostgreSQL installation and user credentials"
    exit 1
fi

# Create test database if it doesn't exist
echo "Creating test database: $DB_NAME"
PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null && echo "Database $DB_NAME created successfully" || echo "Database $DB_NAME already exists"

# Run migrations
echo "Running migrations..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/001_create_users_table.sql; then
    echo "✓ Users table migration completed"
else
    echo "✗ Users table migration failed"
fi

if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/002_create_sections_table.sql; then
    echo "✓ Sections table migration completed"
else
    echo "✗ Sections table migration failed"
fi

if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/003_create_notes_table.sql; then
    echo "✓ Notes table migration completed"
else
    echo "✗ Notes table migration failed"
fi

echo "Test database setup complete!"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
