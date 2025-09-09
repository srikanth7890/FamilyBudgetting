from django.contrib import admin
from .models import Category, Budget


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'family', 'color', 'created_by', 'created_at')
    list_filter = ('family', 'created_at')
    search_fields = ('name', 'description', 'family__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'family', 'amount', 'period', 'start_date', 'end_date', 'is_active')
    list_filter = ('period', 'is_active', 'start_date', 'end_date', 'family')
    search_fields = ('name', 'description', 'category__name', 'family__name')
    readonly_fields = ('created_at', 'updated_at', 'spent_amount', 'remaining_amount', 'spent_percentage')
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'family', 'category')
        }),
        ('Budget Details', {
            'fields': ('amount', 'period', 'start_date', 'end_date', 'is_active')
        }),
        ('Statistics', {
            'fields': ('spent_amount', 'remaining_amount', 'spent_percentage'),
            'classes': ('collapse',)
        }),
        ('Meta', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )