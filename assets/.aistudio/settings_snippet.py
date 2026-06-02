# django_backend/settings_snippet.py
# Paste this setup block into your standard django project settings.py file.

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third Party Packages
    'rest_framework',
    'corsheaders',
    
    # Local App
    # 'api', 
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # MUST be load-placed before common middleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS settings for high-speed local dev and target cloud deployments
CORS_ALLOW_ALL_ORIGINS = True # Set to False in production and list domains below:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "https://your-production-app.run.app",
# ]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# Simple JWT Token expiration
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
}
