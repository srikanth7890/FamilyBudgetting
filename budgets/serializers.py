from rest_framework import serializers
from .models import Category, Budget
from accounts.models import Family


class CategorySerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    expense_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'color', 'icon', 'family', 'created_by', 'expense_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_expense_count(self, obj):
        return obj.expenses.count()


class BudgetSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    spent_amount = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    spent_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Budget
        fields = (
            'id', 'name', 'description', 'family', 'category', 'category_id',
            'amount', 'period', 'start_date', 'end_date', 'is_active',
            'created_by', 'spent_amount', 'remaining_amount', 'spent_percentage',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BudgetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ('name', 'description', 'family', 'category', 'amount', 'period', 'start_date', 'end_date', 'is_active')

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

