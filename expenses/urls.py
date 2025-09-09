from django.urls import path
from . import views

app_name = 'expenses'

urlpatterns = [
    path('expenses/', views.ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('expenses/<int:pk>/', views.ExpenseDetailView.as_view(), name='expense-detail'),
    
    path('recurring-expenses/', views.RecurringExpenseListCreateView.as_view(), name='recurring-expense-list-create'),
    path('recurring-expenses/<int:pk>/', views.RecurringExpenseDetailView.as_view(), name='recurring-expense-detail'),
    
    path('expenses/<int:expense_id>/shares/', views.ExpenseShareListCreateView.as_view(), name='expense-share-list-create'),
    
    path('statistics/', views.expense_statistics, name='expense-statistics'),
    path('recent/', views.recent_expenses, name='recent-expenses'),
]

