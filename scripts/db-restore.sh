#!/bin/bash

if [ ! -f "prisma/backups/base_save_point.sql" ]; then
    echo "Error: Backup file prisma/backups/base_save_point.sql not found."
    exit 1
fi

echo "Restoring database from prisma/backups/base_save_point.sql..."

# Drop and recreate schema to ensure a clean slate
docker exec -i unlockcusco-db psql -U postgres -d unlockcusco -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Import the SQL dump
cat prisma/backups/base_save_point.sql | docker exec -i unlockcusco-db psql -U postgres -d unlockcusco

echo "Restore complete!"
