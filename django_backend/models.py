# django_backend/models.py
from django.db import models
from django.contrib.auth.models import User

class Collector(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Disabled', 'Disabled'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='collector_profile')
    collector_id = models.CharField(max_length=50, unique=True, primary_key=True) # e.g. COL-001
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=50)
    city = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    def __str__(self):
        return f"{self.name} ({self.collector_id})"


class DonationBox(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Damaged', 'Damaged'),
        ('Missing', 'Missing'),
    ]
    box_id = models.CharField(max_length=50, unique=True, primary_key=True) # e.g. BOX-0001
    donor_name = models.CharField(max_length=200)
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    installation_date = models.DateField()
    collector = models.ForeignKey(Collector, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_boxes')
    map_link = models.URLField(max_length=500, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.donor_name} - {self.box_id}"


class CollectionRecord(models.Model):
    STATUS_CHOICES = [
        ('Settled', 'Settled'),
        ('Pending', 'Pending Review'),
    ]
    collection_id = models.CharField(max_length=50, unique=True, primary_key=True) # e.g. COL-REC-84
    donation_box = models.ForeignKey(DonationBox, on_delete=models.PROTECT, related_name='records')
    collector = models.ForeignKey(Collector, on_delete=models.PROTECT, related_name='collections')
    amount = models.DecimalField(max_digits=12, decimal_digits=2, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Settled')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Collection {self.collection_id} - ${self.amount}"


class ExpenseRecord(models.Model):
    STATUS_CHOICES = [
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Pending', 'Pending'),
    ]
    expense_id = models.CharField(max_length=50, unique=True, primary_key=True) # e.g. EXP-001
    collector = models.ForeignKey(Collector, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=150) # e.g. "Fuel claim" or "Lock Repair"
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, null=True)
    attachment_base64 = models.TextField(blank=True, null=True) # supports camera snapshot uploading

    def __str__(self):
        return f"{self.title} - ${self.amount} ({self.status})"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('demand', 'Task Demand'),
        ('collection', 'Action Settled'),
        ('issue', 'Damaged/Missing Report'),
    ]
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"
