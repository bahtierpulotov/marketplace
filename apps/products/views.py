import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Category, Product, ProductImage, Like, View
from middleware.jwt_auth import require_auth


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def product_to_dict(product, user=None):
    images = [
        {'id': str(img.id), 'url': img.image.url, 'is_primary': img.is_primary}
        for img in product.images.all()
    ]
    liked = False
    if user:
        liked = Like.objects.filter(user=user, product=product).exists()
    return {
        'id': str(product.id),
        'title': product.title,
        'description': product.description,
        'price': str(product.price),
        'location': {'id': str(product.location.id), 'name': product.location.name} if product.location else None,
        'views_count': product.views_count,
        'likes_count': product.likes_count,
        'is_active': product.is_active,
        'created_at': product.created_at.isoformat(),
        'updated_at': product.updated_at.isoformat(),
        'category': {
            'id': str(product.category.id),
            'name': product.category.name,
            'slug': product.category.slug,
            'icon': product.category.icon,
        } if product.category else None,
        'owner': {
            'id': str(product.owner.id),
            'full_name': product.owner.full_name,
            'phone': product.owner.phone,
            'avatar': product.owner.avatar.url if product.owner.avatar else None,
        },
        'images': images,
        'liked_by_me': liked,
    }


def get_client_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


# ─── CATEGORIES ───────────────────────────────────────────────────────────────

@csrf_exempt
def categories(request):
    if request.method == 'GET':
        cats = list(Category.objects.values('id', 'name', 'slug', 'icon'))
        for c in cats:
            c['id'] = str(c['id'])
        return JsonResponse({'categories': cats})

    if request.method == 'POST':
        if not request.user_jwt or not request.user_jwt.is_staff:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        name = data.get('name', '').strip()
        slug = data.get('slug', '').strip()
        icon = data.get('icon', '').strip()
        if not name or not slug:
            return JsonResponse({'error': 'Name and slug are required'}, status=400)
        if Category.objects.filter(slug=slug).exists():
            return JsonResponse({'error': 'Slug already exists'}, status=400)
        cat = Category.objects.create(name=name, slug=slug, icon=icon)
        return JsonResponse({'id': str(cat.id), 'name': cat.name, 'slug': cat.slug, 'icon': cat.icon}, status=201)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def category_detail(request, category_id):
    if not request.user_jwt or not request.user_jwt.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    cat = get_object_or_404(Category, id=category_id)

    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        cat.name = data.get('name', cat.name)
        cat.icon = data.get('icon', cat.icon)
        cat.save()
        return JsonResponse({'id': str(cat.id), 'name': cat.name, 'slug': cat.slug, 'icon': cat.icon})

    if request.method == 'DELETE':
        cat.delete()
        return JsonResponse({'message': 'Category deleted'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ─── PRODUCTS LIST + CREATE ───────────────────────────────────────────────────

@csrf_exempt
def product_list(request):
    if request.method == 'GET':
        qs = Product.objects.filter(
            is_active=True,
            owner__is_active=True,
            owner__is_banned=False,
        ).select_related('owner', 'category').prefetch_related('images')

        # Search
        q = request.GET.get('q', '').strip()
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))

        # Filters
        category = request.GET.get('category', '').strip()
        if category:
            qs = qs.filter(category__slug=category)

        location = request.GET.get('location', '').strip()
        if location:
            qs = qs.filter(location__id=location)

        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        if min_price:
            try:
                qs = qs.filter(price__gte=float(min_price))
            except ValueError:
                pass
        if max_price:
            try:
                qs = qs.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # Sort
        sort = request.GET.get('sort', 'newest')
        if sort == 'popular':
            qs = qs.order_by('-views_count')
        elif sort == 'price_asc':
            qs = qs.order_by('price')
        elif sort == 'price_desc':
            qs = qs.order_by('-price')
        else:
            qs = qs.order_by('-created_at')

        # Pagination
        try:
            page = max(1, int(request.GET.get('page', 1)))
        except ValueError:
            page = 1
        page_size = 20
        total = qs.count()
        products = qs[(page - 1) * page_size: page * page_size]

        user = getattr(request, 'user_jwt', None)
        return JsonResponse({
            'products': [product_to_dict(p, user) for p in products],
            'total': total,
            'page': page,
            'pages': (total + page_size - 1) // page_size,
        })

    if request.method == 'POST':
        if not request.user_jwt:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        price = data.get('price')
        category_id = data.get('category_id')
        location_id = data.get('location_id')

        if not title or not description or price is None:
            return JsonResponse({'error': 'title, description, and price are required'}, status=400)
        try:
            price = float(price)
        except (TypeError, ValueError):
            return JsonResponse({'error': 'Invalid price'}, status=400)

        category = None
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                return JsonResponse({'error': 'Category not found'}, status=404)

        location = None
        if location_id:
            try:
                from .models import Location
                location = Location.objects.get(id=location_id)
            except Exception:
                return JsonResponse({'error': 'Location not found'}, status=404)

        product = Product.objects.create(
            owner=request.user_jwt,
            category=category,
            title=title,
            description=description,
            price=price,
            location=location,
        )
        return JsonResponse(product_to_dict(product), status=201)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ─── PRODUCT DETAIL ───────────────────────────────────────────────────────────

@csrf_exempt
def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    user = getattr(request, 'user_jwt', None)

    if request.method == 'GET':
        # Track view (once per IP per product)
        ip = get_client_ip(request)
        from django.utils import timezone
        from datetime import timedelta
        recently = timezone.now() - timedelta(hours=1)
        if not View.objects.filter(product=product, ip_address=ip, viewed_at__gte=recently).exists():
            View.objects.create(product=product, ip_address=ip)
            Product.objects.filter(id=product_id).update(views_count=product.views_count + 1)
            product.refresh_from_db()
        return JsonResponse({'product': product_to_dict(product, user)})

    if request.method in ('PUT', 'PATCH'):
        if not user or str(product.owner_id) != str(user.id):
            return JsonResponse({'error': 'Permission denied'}, status=403)
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        product.title = data.get('title', product.title)
        product.description = data.get('description', product.description)
        product.price = data.get('price', product.price)
        if 'location_id' in data:
            try:
                from .models import Location
                product.location = Location.objects.get(id=data['location_id']) if data['location_id'] else None
            except Exception:
                pass
        if 'category_id' in data:
            try:
                product.category = Category.objects.get(id=data['category_id'])
            except Category.DoesNotExist:
                return JsonResponse({'error': 'Category not found'}, status=404)
        product.save()
        return JsonResponse({'product': product_to_dict(product, user)})

    if request.method == 'DELETE':
        if not user:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        if str(product.owner_id) != str(user.id) and not user.is_staff:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        product.delete()
        return JsonResponse({'message': 'Product deleted'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ─── UPLOAD IMAGES ────────────────────────────────────────────────────────────

@csrf_exempt
@require_auth
def upload_images(request, product_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    product = get_object_or_404(Product, id=product_id)
    if str(product.owner_id) != str(request.user_jwt.id):
        return JsonResponse({'error': 'Permission denied'}, status=403)

    images = request.FILES.getlist('images')
    if not images:
        return JsonResponse({'error': 'No images provided'}, status=400)

    created = []
    for i, img in enumerate(images):
        is_primary = i == 0 and not product.images.exists()
        pi = ProductImage.objects.create(product=product, image=img, is_primary=is_primary)
        created.append({'id': str(pi.id), 'url': pi.image.url, 'is_primary': pi.is_primary})

    return JsonResponse({'images': created}, status=201)


# ─── LIKE TOGGLE ──────────────────────────────────────────────────────────────

@csrf_exempt
@require_auth
def toggle_like(request, product_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    product = get_object_or_404(Product, id=product_id)
    user = request.user_jwt

    existing = Like.objects.filter(user=user, product=product).first()
    if existing:
        existing.delete()
        Product.objects.filter(id=product_id).update(likes_count=max(0, product.likes_count - 1))
        liked = False
    else:
        Like.objects.create(user=user, product=product)
        Product.objects.filter(id=product_id).update(likes_count=product.likes_count + 1)
        liked = True

    product.refresh_from_db()
    return JsonResponse({'liked': liked, 'likes_count': product.likes_count})


# ─── MY PRODUCTS ──────────────────────────────────────────────────────────────

@require_auth
def my_products(request):
    products = Product.objects.filter(
        owner=request.user_jwt
    ).select_related('category').prefetch_related('images')
    return JsonResponse({
        'products': [product_to_dict(p, request.user_jwt) for p in products]
    })


# ─── LOCATIONS ────────────────────────────────────────────────────────────────

def location_list(request):
    """GET: list all locations (admin-created). Public."""
    from .models import Location
    locs = list(Location.objects.values('id', 'name', 'region'))
    for l in locs:
        l['id'] = str(l['id'])
    return JsonResponse({'locations': locs})


@csrf_exempt
def location_admin(request):
    """POST: admin creates a location."""
    if not request.user_jwt or not request.user_jwt.is_staff:
        return JsonResponse({'error': 'Admin only'}, status=403)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    from .models import Location
    loc = Location.objects.create(
        name=data.get('name', '').strip(),
        region=data.get('region', '').strip(),
        order=data.get('order', 0),
    )
    return JsonResponse({'id': str(loc.id), 'name': loc.name, 'region': loc.region}, status=201)