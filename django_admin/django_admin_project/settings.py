import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key")
DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() == "true"

DEFAULT_ALLOWED = [
    "localhost",
    "127.0.0.1",
    "192.168.1.151",
    "185.120.251.246",
]
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", ",".join(DEFAULT_ALLOWED)).split(",")

DEFAULT_CSRF = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://192.168.1.151:3000",
    "http://192.168.1.151:8000",
    "http://185.120.251.246:3000",
]
CSRF_TRUSTED_ORIGINS = os.environ.get("DJANGO_CSRF_TRUSTED", ",".join(DEFAULT_CSRF)).split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "core",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "django_admin_project.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "django_admin_project.wsgi.application"

DATABASES = {
    "default": dj_database_url.parse(
        os.environ.get(
            "DATABASE_URL",
            "postgresql://Amin:8229376Amin@localhost:5432/Amin",
        )
    )
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "fa-ir"
TIME_ZONE = "Asia/Tehran"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
