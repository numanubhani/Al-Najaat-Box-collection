# django_backend/serializers.py
from rest_framework import serializers
from .models import Collector, DonationBox, CollectionRecord, ExpenseRecord, Notification

class CollectorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Collector
        fields = ['collector_id', 'name', 'phone', 'city', 'status', 'username', 'email']


class DonationBoxSerializer(serializers.ModelSerializer):
    collector_name = serializers.CharField(source='collector.name', read_only=True)

    class Meta:
        model = DonationBox
        fields = [
            'box_id',
            'donor_name',
            'address',
            'city',
            'contact_number',
            'status',
            'installation_date',
            'collector',
            'collector_name',
            'map_link',
            'notes'
        ]


class CollectionRecordSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donation_box.donor_name', read_only=True)
    collector_name = serializers.CharField(source='collector.name', read_only=True)

    class Meta:
        model = CollectionRecord
        fields = [
            'collection_id',
            'donation_box',
            'donor_name',
            'collector',
            'collector_name',
            'amount',
            'date',
            'status',
            'notes'
        ]


class ExpenseRecordSerializer(serializers.ModelSerializer):
    collector_name = serializers.CharField(source='collector.name', read_only=True)

    class Meta:
        model = ExpenseRecord
        fields = [
            'expense_id',
            'collector',
            'collector_name',
            'title',
            'amount',
            'date',
            'status',
            'notes',
            'attachment_base64'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'date', 'is_read']
