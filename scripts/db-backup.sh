#!/bin/bash

# Ensure backups directory exists
mkdir -p prisma/backups

echo "Backing up database to prisma/backups/base_save_point.sql..."
docker exec unlockcusco-db pg_dump -U postgres -d unlockcusco > prisma/backups/base_save_point.sql

echo "Backup complete!"
