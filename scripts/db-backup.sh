#!/bin/bash

# Ensure backups directory exists
mkdir -p prisma/backups

echo "Backing up database to prisma/backups/base_save_point.sql..."
docker exec vallecito-db pg_dump -U postgres -d vallecito > prisma/backups/base_save_point.sql

echo "Backup complete!"
