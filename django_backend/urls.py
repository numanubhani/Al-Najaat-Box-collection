# django_backend/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthenticationViewSet,
    CollectorViewSet,
    DonationBoxViewSet,
    CollectionRecordViewSet,
    ExpenseRecordViewSet,
    NotificationViewSet
)

router = DefaultRouter()
router.register(r'collectors', CollectorViewSet, basename='collector')
router.register(r'boxes', DonationBoxViewSet, basename='box')
router.register(r'collections', CollectionRecordViewSet, basename='collection')
router.register(r'expenses', ExpenseRecordViewSet, basename='expense')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Router views (crud actions)
    path('', include(router.urls)),
    
    # Custom interactive auth routes
    path('auth/login/', AuthenticationViewSet.as_view({'post': 'login'}), name='auth-login'),
]
