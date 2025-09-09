from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import Family
from budgets.models import Category

User = get_user_model()


class Expense(models.Model):
    """Expense model for tracking family expenses"""
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('digital_wallet', 'Digital Wallet'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='expenses')
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='expenses')
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses_paid')
    date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    receipt_image = models.ImageField(upload_to='receipts/', blank=True, null=True)
    tags = models.CharField(max_length=200, blank=True, null=True)  # Comma-separated tags
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.date})"

    @property
    def tag_list(self):
        """Return tags as a list"""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',')]
        return []


class RecurringExpense(models.Model):
    """Model for recurring expenses like subscriptions"""
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='recurring_expenses')
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='recurring_expenses')
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_expenses_paid')
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='monthly')
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=Expense.PAYMENT_METHOD_CHOICES, default='cash')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.frequency})"


class ExpenseShare(models.Model):
    """Model for sharing expenses among family members"""
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expense_shares')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['expense', 'user']

    def __str__(self):
        return f"{self.user.first_name} - {self.expense.title} ({self.amount})"
