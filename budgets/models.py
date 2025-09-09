from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import Family

User = get_user_model()


class Category(models.Model):
    """Expense categories for better organization"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color code
    icon = models.CharField(max_length=50, blank=True, null=True)  # Icon name for UI
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='categories')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['name', 'family']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.name} ({self.family.name})"


class Budget(models.Model):
    """Budget model for tracking monthly/yearly budgets"""
    PERIOD_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES, default='monthly')
    start_date = models.DateField()
    end_date = models.DateField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.category.name} ({self.amount})"

    @property
    def spent_amount(self):
        """Calculate total spent amount for this budget"""
        from expenses.models import Expense
        return Expense.objects.filter(
            category=self.category,
            family=self.family,
            date__gte=self.start_date,
            date__lte=self.end_date
        ).aggregate(total=models.Sum('amount'))['total'] or 0

    @property
    def remaining_amount(self):
        """Calculate remaining budget amount"""
        return self.amount - self.spent_amount

    @property
    def spent_percentage(self):
        """Calculate percentage of budget spent"""
        if self.amount == 0:
            return 0
        return (self.spent_amount / self.amount) * 100