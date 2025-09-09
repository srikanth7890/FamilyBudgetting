from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Expense, RecurringExpense, ExpenseShare
from .serializers import ExpenseSerializer, ExpenseCreateSerializer, RecurringExpenseSerializer, ExpenseShareSerializer


class ExpenseListCreateView(generics.ListCreateAPIView):
    """List and create expenses"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['family', 'category', 'paid_by', 'payment_method', 'date']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['title', 'amount', 'date', 'created_at']
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExpenseCreateSerializer
        return ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Expense detail, update, and delete"""
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()


class RecurringExpenseListCreateView(generics.ListCreateAPIView):
    """List and create recurring expenses"""
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['family', 'category', 'frequency', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'amount', 'start_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return RecurringExpense.objects.filter(
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()


class RecurringExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Recurring expense detail, update, and delete"""
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RecurringExpense.objects.filter(
            family__members__user=self.request.user,
            family__members__is_active=True
        ).distinct()


class ExpenseShareListCreateView(generics.ListCreateAPIView):
    """List and create expense shares"""
    serializer_class = ExpenseShareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        expense_id = self.kwargs['expense_id']
        return ExpenseShare.objects.filter(
            expense_id=expense_id,
            expense__family__members__user=self.request.user,
            expense__family__members__is_active=True
        ).distinct()

    def perform_create(self, serializer):
        expense_id = self.kwargs['expense_id']
        expense = Expense.objects.get(id=expense_id)
        serializer.save(expense=expense)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def expense_statistics(request):
    """Get expense statistics for dashboard"""
    family_id = request.query_params.get('family_id')
    period = request.query_params.get('period', 'month')  # month, year, week
    
    # Calculate date range based on period
    today = timezone.now().date()
    if period == 'week':
        start_date = today - timedelta(days=7)
    elif period == 'year':
        start_date = today - timedelta(days=365)
    else:  # month
        start_date = today - timedelta(days=30)
    
    # Base queryset
    queryset = Expense.objects.filter(
        family__members__user=request.user,
        family__members__is_active=True,
        date__gte=start_date,
        date__lte=today
    )
    
    if family_id:
        queryset = queryset.filter(family_id=family_id)
    
    # Calculate statistics
    total_expenses = queryset.aggregate(total=Sum('amount'))['total'] or 0
    expense_count = queryset.count()
    
    # Expenses by category
    expenses_by_category = queryset.values('category__name').annotate(
        total=Sum('amount'),
        count=Count('id')
    ).order_by('-total')
    
    # Expenses by payment method
    expenses_by_payment = queryset.values('payment_method').annotate(
        total=Sum('amount'),
        count=Count('id')
    ).order_by('-total')
    
    # Daily expenses for the period
    daily_expenses = queryset.extra(
        select={'day': 'date'}
    ).values('day').annotate(
        total=Sum('amount')
    ).order_by('day')
    
    return Response({
        'total_expenses': total_expenses,
        'expense_count': expense_count,
        'period': period,
        'start_date': start_date,
        'end_date': today,
        'expenses_by_category': list(expenses_by_category),
        'expenses_by_payment': list(expenses_by_payment),
        'daily_expenses': list(daily_expenses),
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_expenses(request):
    """Get recent expenses for dashboard"""
    limit = int(request.query_params.get('limit', 10))
    family_id = request.query_params.get('family_id')
    
    queryset = Expense.objects.filter(
        family__members__user=request.user,
        family__members__is_active=True
    ).select_related('category', 'paid_by', 'family')
    
    if family_id:
        queryset = queryset.filter(family_id=family_id)
    
    recent_expenses = queryset.order_by('-date', '-created_at')[:limit]
    serializer = ExpenseSerializer(recent_expenses, many=True)
    
    return Response(serializer.data)