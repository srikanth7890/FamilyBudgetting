from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import os

@csrf_exempt
def api_root(request):
    """API root endpoint with available endpoints information"""
    return JsonResponse({
        'message': 'Family Budget API',
        'version': '1.0.0',
        'endpoints': {
            'authentication': '/api/auth/',
            'families': '/api/auth/families/',
            'budgets': '/api/budgets/',
            'expenses': '/api/expenses/',
            'admin': '/admin/',
        },
        'documentation': 'See README.md for detailed API documentation'
    })

def frontend_view(request):
    """Serve the frontend HTML file"""
    frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'index.html')
    try:
        with open(frontend_path, 'r') as f:
            content = f.read()
        return HttpResponse(content, content_type='text/html')
    except FileNotFoundError:
        return JsonResponse({
            'message': 'Frontend not found. Please run the React development server.',
            'instructions': 'cd frontend && npm install && npm start'
        })
