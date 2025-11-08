#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
source .venv/bin/activate
export DJANGO_ALLOWED_HOSTS=${DJANGO_ALLOWED_HOSTS:-localhost,127.0.0.1,192.168.1.151,185.120.251.246}
export DJANGO_CSRF_TRUSTED=${DJANGO_CSRF_TRUSTED:-http://185.120.251.246:3000,http://192.168.1.151:3000,http://localhost:3000}
export DATABASE_URL=${DATABASE_URL:-postgresql://Amin:8229376Amin@localhost:5432/Amin}
exec gunicorn --workers 3 --bind 0.0.0.0:8000 django_admin_project.wsgi:application
