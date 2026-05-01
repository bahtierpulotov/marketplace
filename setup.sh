#!/bin/bash
# Backend quick setup script

set -e

echo "🛍️  Marketplace Backend Setup"
echo "================================"

cd "$(dirname "$0")"

# Check Python
python3 --version || { echo "❌ Python 3 not found"; exit 1; }

# Virtual env
if [ ! -d "venv" ]; then
  echo "📦 Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

echo "📦 Installing dependencies..."
pip install -r requirements.txt --quiet

# .env
if [ ! -f ".env" ]; then
  echo "📝 Creating .env from example..."
  cp .env.example .env
  echo "⚠️  Edit .env with your database and API credentials before continuing."
  read -p "Press Enter when ready..."
fi

echo "🗄️  Running migrations..."
python manage.py makemigrations accounts products ai_chat
python manage.py migrate

echo ""
echo "👤 Create superuser (admin)?"
read -p "[y/N] " create_admin
if [[ "$create_admin" =~ ^[Yy]$ ]]; then
  python manage.py createsuperuser
fi

echo ""
echo "✅ Backend ready!"
echo "Run with: source venv/bin/activate && python manage.py runserver"
echo "Admin:    http://localhost:8000/admin/"
