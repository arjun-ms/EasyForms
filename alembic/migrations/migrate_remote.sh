#!/bin/bash

# 🚀 Alembic Migration Script for Remote DB (Render)
# ---------------------------------------------------

# Step 1: Make this script executable (only needs to run once per system)
chmod +x "$0"

# Step 2: Load environment variables from .env
if [ -f .env ]; then
  source .env
else
  echo "❌ .env file not found. Create one with RENDER_DB_URL"
  exit 1
fi

# Step 3: Validate RENDER_DB_URL is set
if [ -z "$RENDER_DB_URL" ]; then
  echo "❌ RENDER_DB_URL is not set in .env"
  exit 1
fi

# Step 4: Run Alembic migration
echo "🚀 Running Alembic migration to remote Render DB..."
python -m alembic -x dburl="$RENDER_DB_URL" upgrade head

# Step 5: Exit status
if [ $? -eq 0 ]; then
  echo "✅ Migration successful!"
else
  echo "❌ Migration failed!"
fi

# Step 6: Sleep so we can see output
sleep 3