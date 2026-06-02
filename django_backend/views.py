# django_backend/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Collector, DonationBox, CollectionRecord, ExpenseRecord, Notification
from .serializers import (
    CollectorSerializer,
    DonationBoxSerializer,
    CollectionRecordSerializer,
    ExpenseRecordSerializer,
    NotificationSerializer
)

class AuthenticationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticating based on username mirroring the pre-filled accounts in Al-Najaat app
        username = email.split('@')[0] if '@' in email else email
        
        # Real authenticate logic (or simulation fallbacks)
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            role = 'Admin' if user.is_staff else 'Collector'
            
            # Try to grab collector profile metadata
            collector_id = None
            try:
                collector_profile = user.collector_profile
                collector_id = collector_profile.collector_id
            except Collector.DoesNotExist:
                # If they are staff/admin, it is fine
                pass

            return Response({
                "token": str(refresh.access_token),
                "user": {
                    "email": user.email,
                    "name": user.get_full_name() or user.username,
                    "role": role,
                    "collectorId": collector_id
                }
            })
        
        # Friendly feedback to maintain simulation fidelity
        return Response(
            {"error": "Invalid database credentials or email not registered."},
            status=status.HTTP_401_UNAUTHORIZED
        )


class CollectorViewSet(viewsets.ModelViewSet):
    queryset = Collector.objects.all()
    serializer_class = CollectorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class DonationBoxViewSet(viewsets.ModelViewSet):
    queryset = DonationBox.objects.all()
    serializer_class = DonationBoxSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['patch'])
    def change_status(self, request, pk=None):
        box = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            box.status = new_status
            box.save()
            
            # Fire an automated internal notification for damage
            if new_status in ['Damaged', 'Missing']:
                Notification.objects.create(
                    notification_type='issue',
                    title=f"Box {box.box_id} Flagged as {new_status}",
                    message=f"Collector reports that {box.donor_name}'s location in {box.city} is {new_status.lower()}.",
                )
            return Response(DonationBoxSerializer(box).data)
        return Response({"error": "No status provided"}, status=status.HTTP_400_BAD_REQUEST)


class CollectionRecordViewSet(viewsets.ModelViewSet):
    queryset = CollectionRecord.objects.all().order_dict_by('-date') if hasattr(models.query.QuerySet, 'order_dict_by') else CollectionRecord.objects.all().order_by('-date')
    serializer_class = CollectionRecordSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ExpenseRecordViewSet(viewsets.ModelViewSet):
    queryset = ExpenseRecord.objects.all()
    serializer_class = ExpenseRecordSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-date')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({"status": "notification read success"})
