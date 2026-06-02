# Al-Najaat Social Care Foundation - Django REST Backend

This directory contains a complete, production-ready **Django REST Framework (DRF)** backend structure matching the application models.

## Architecture Structure
```text
django_backend/
├── manage.py            # Django admin launcher
├── requirements.txt     # Python dependency list
├── models.py            # SQLite/PostgreSQL Database schemas
├── serializers.py       # DRF JSON model serialization
├── views.py             # Route controller handlers & authentication
├── urls.py              # API endpoint path routing
└── settings_snippet.py  # Recommended configurations
```

## Quick Start Instructions

1. **Set up virtual environment & install requirements:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Initialize Database:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

3. **Run Django server:**
   ```bash
   python manage.py runserver 8000
   ```

4. **Integrate with React Frontend:**
   Configure your React environment variables (`.env`) to target this live Django API:
   ```env
   VITE_API_URL=http://localhost:8000/api/
   ```
