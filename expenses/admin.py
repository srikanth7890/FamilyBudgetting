from django.contrib import admin
from .models import Expense, RecurringExpense, ExpenseShare


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'amount', 'category', 'family', 'paid_by', 'date', 'payment_method')
    list_filter = ('category', 'family', 'payment_method', 'date', 'created_at')
    search_fields = ('title', 'description', 'tags', 'category__name', 'family__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date'
    
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'amount', 'category', 'family')
        }),
        ('Payment Details', {
            'fields': ('paid_by', 'date', 'payment_method', 'receipt_image')
        }),
        ('Additional Info', {
            'fields': ('tags',),
            'classes': ('collapse',)
        }),
        ('Meta', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(RecurringExpense)
class RecurringExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'amount', 'category', 'family', 'frequency', 'start_date', 'is_active')
    list_filter = ('category', 'family', 'frequency', 'is_active', 'start_date')
    search_fields = ('title', 'description', 'category__name', 'family__name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'amount', 'category', 'family')
        }),
        ('Recurrence Details', {
            'fields': ('frequency', 'start_date', 'end_date', 'is_active')
        }),
        ('Payment Details', {
            'fields': ('paid_by', 'payment_method')
        }),
        ('Meta', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ExpenseShare)
class ExpenseShareAdmin(admin.ModelAdmin):
    list_display = ('expense', 'user', 'amount', 'is_paid', 'paid_at')
    list_filter = ('is_paid', 'paid_at', 'created_at')
    search_fields = ('expense__title', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at',)