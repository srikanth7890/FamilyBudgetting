from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with additional fields for family budgeting"""
    CURRENCY_CHOICES = [
        ('USD', 'US Dollar ($)'),
        ('EUR', 'Euro (€)'),
        ('GBP', 'British Pound (£)'),
        ('JPY', 'Japanese Yen (¥)'),
        ('CAD', 'Canadian Dollar (C$)'),
        ('AUD', 'Australian Dollar (A$)'),
        ('CHF', 'Swiss Franc (CHF)'),
        ('CNY', 'Chinese Yuan (¥)'),
        ('INR', 'Indian Rupee (₹)'),
        ('BRL', 'Brazilian Real (R$)'),
        ('MXN', 'Mexican Peso ($)'),
        ('KRW', 'South Korean Won (₩)'),
        ('SGD', 'Singapore Dollar (S$)'),
        ('HKD', 'Hong Kong Dollar (HK$)'),
        ('NZD', 'New Zealand Dollar (NZ$)'),
        ('SEK', 'Swedish Krona (kr)'),
        ('NOK', 'Norwegian Krone (kr)'),
        ('DKK', 'Danish Krone (kr)'),
        ('PLN', 'Polish Zloty (zł)'),
        ('CZK', 'Czech Koruna (Kč)'),
        ('HUF', 'Hungarian Forint (Ft)'),
        ('RUB', 'Russian Ruble (₽)'),
        ('TRY', 'Turkish Lira (₺)'),
        ('ZAR', 'South African Rand (R)'),
        ('AED', 'UAE Dirham (د.إ)'),
        ('SAR', 'Saudi Riyal (﷼)'),
        ('QAR', 'Qatari Riyal (﷼)'),
        ('KWD', 'Kuwaiti Dinar (د.ك)'),
        ('BHD', 'Bahraini Dinar (د.ب)'),
        ('OMR', 'Omani Rial (﷼)'),
        ('JOD', 'Jordanian Dinar (د.ا)'),
        ('LBP', 'Lebanese Pound (ل.ل)'),
        ('EGP', 'Egyptian Pound (ج.م)'),
        ('ILS', 'Israeli Shekel (₪)'),
        ('THB', 'Thai Baht (฿)'),
        ('MYR', 'Malaysian Ringgit (RM)'),
        ('IDR', 'Indonesian Rupiah (Rp)'),
        ('PHP', 'Philippine Peso (₱)'),
        ('VND', 'Vietnamese Dong (₫)'),
        ('TWD', 'Taiwan Dollar (NT$)'),
        ('PKR', 'Pakistani Rupee (₨)'),
        ('BDT', 'Bangladeshi Taka (৳)'),
        ('LKR', 'Sri Lankan Rupee (₨)'),
        ('NPR', 'Nepalese Rupee (₨)'),
        ('MMK', 'Myanmar Kyat (K)'),
        ('KHR', 'Cambodian Riel (៛)'),
        ('LAK', 'Lao Kip (₭)'),
        ('BND', 'Brunei Dollar (B$)'),
        ('FJD', 'Fijian Dollar (FJ$)'),
        ('PGK', 'Papua New Guinea Kina (K)'),
        ('SBD', 'Solomon Islands Dollar (SI$)'),
        ('VUV', 'Vanuatu Vatu (Vt)'),
        ('WST', 'Samoan Tala (WS$)'),
        ('TOP', 'Tongan Paʻanga (T$)'),
        ('XPF', 'CFP Franc (₣)'),
    ]

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class Family(models.Model):
    """Family model to group users together"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_families')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class FamilyMember(models.Model):
    """Model to manage family members and their roles"""
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    ]

    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='family_memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ['family', 'user']

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.family.name} ({self.role})"