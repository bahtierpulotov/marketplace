import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

from .models import ChatSession, ChatMessage
from .groq_client import groq_complete, build_system_prompt
from apps.products.models import Product
from middleware.jwt_auth import require_auth
from apps.ai_chat.models import DirectChat,DirectMessage

@csrf_exempt
@require_auth
def ai_chat(request, product_id):
    """POST: Send a message and get AI response. GET: Get chat history."""
    product = get_object_or_404(Product, id=product_id, is_active=True)
    session, _ = ChatSession.objects.get_or_create(
        user=request.user_jwt, product=product
    )

    if request.method == 'GET':
        messages = session.messages.all()
        return JsonResponse({
            'session_id': str(session.id),
            'product_id': str(product.id),
            'messages': [
                {
                    'id': str(m.id),
                    'role': m.role,
                    'content': m.content,
                    'timestamp': m.timestamp.isoformat(),
                }
                for m in messages
            ]
        })

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        user_message = data.get('message', '').strip()
        if not user_message:
            return JsonResponse({'error': 'Message cannot be empty'}, status=400)
        if len(user_message) > 2000:
            return JsonResponse({'error': 'Message too long (max 2000 chars)'}, status=400)

        # Load history (last 20 messages for context window efficiency)
        history = list(
            session.messages.order_by('-timestamp')[:20]
        )
        history.reverse()

        # Build messages for Groq
        groq_messages = [{'role': 'system', 'content': build_system_prompt(product)}]
        groq_messages += [{'role': m.role, 'content': m.content} for m in history]
        groq_messages.append({'role': 'user', 'content': user_message})

        # Get AI response
        ai_reply = groq_complete(groq_messages)

        # Persist both messages
        user_msg = ChatMessage.objects.create(
            session=session, role='user', content=user_message
        )
        ai_msg = ChatMessage.objects.create(
            session=session, role='assistant', content=ai_reply
        )

        return JsonResponse({
            'user_message': {
                'id': str(user_msg.id),
                'role': 'user',
                'content': user_message,
                'timestamp': user_msg.timestamp.isoformat(),
            },
            'ai_response': {
                'id': str(ai_msg.id),
                'role': 'assistant',
                'content': ai_reply,
                'timestamp': ai_msg.timestamp.isoformat(),
            },
        })

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
@require_auth
def delete_chat(request, product_id):
    """DELETE: Clear chat history for this product."""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    product = get_object_or_404(Product, id=product_id)
    try:
        session = ChatSession.objects.get(user=request.user_jwt, product=product)
        session.messages.all().delete()
        return JsonResponse({'message': 'Chat history cleared'})
    except ChatSession.DoesNotExist:
        return JsonResponse({'message': 'No chat history found'})


# ─── DIRECT CHAT (buyer ↔ seller) ─────────────────────────────────────────────

def _buyer_query_param(request, post_payload):
    """For seller threading: buyer id from ?buyer= or JSON buyer_id."""
    return request.GET.get('buyer') or (post_payload or {}).get('buyer_id')


@csrf_exempt
@require_auth
def direct_chat(request, product_id):
    """GET history | POST message. Buyer: /chat/<product>/. Seller: ...?buyer=<buyer_uuid>"""
    product = get_object_or_404(Product, id=product_id, is_active=True)
    user = request.user_jwt
    uid = str(user.id)
    owner_id = str(product.owner_id)
    post_data = {}
    if request.method == 'POST':
        try:
            post_data = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    buyer_ref = _buyer_query_param(request, post_data)

    if owner_id == uid:
        if not buyer_ref:
            return JsonResponse({'error': 'buyer_required'}, status=400)
        chat = get_object_or_404(
            DirectChat.objects.select_related('buyer', 'product'),
            product_id=product_id,
            buyer_id=buyer_ref,
        )
        other_user = chat.buyer
    else:
        if buyer_ref and str(buyer_ref) != uid:
            return JsonResponse({'error': 'Forbidden'}, status=403)
        chat, _ = DirectChat.objects.get_or_create(product=product, buyer=user)
        other_user = product.owner

    if request.method == 'GET':
        msgs = chat.messages.select_related('sender').all()
        chat.messages.filter(is_read=False).exclude(sender=user).update(is_read=True)
        ou_avatar = (
            other_user.avatar.url if getattr(other_user, 'avatar', None) and other_user.avatar else None
        )
        return JsonResponse({
            'chat_id': str(chat.id),
            'buyer_id': str(chat.buyer_id),
            'product': {'id': str(product.id), 'title': product.title},
            'other_user': {
                'id': str(other_user.id),
                'full_name': other_user.full_name or other_user.email,
                'avatar': ou_avatar,
            },
            'you_are_seller': owner_id == uid,
            'messages': [
                {
                    'id': str(m.id),
                    'sender_id': str(m.sender_id),
                    'sender_name': m.sender.full_name,
                    'content': m.content,
                    'timestamp': m.timestamp.isoformat(),
                    'is_read': m.is_read,
                    'is_mine': str(m.sender_id) == uid,
                }
                for m in msgs
            ]
        })

    if request.method == 'POST':
        content = post_data.get('content', '').strip()
        if not content:
            return JsonResponse({'error': 'Empty message'}, status=400)
        if len(content) > 8000:
            return JsonResponse({'error': 'Message too long'}, status=400)
        msg = DirectMessage.objects.create(chat=chat, sender=user, content=content)
        chat.save()
        return JsonResponse({
            'id': str(msg.id),
            'sender_id': uid,
            'sender_name': user.full_name,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat(),
            'is_read': msg.is_read,
            'is_mine': True,
        }, status=201)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@require_auth
def my_chats(request):
    """GET: list all direct chats for current user (as buyer or seller)."""
    user = request.user_jwt
    # Chats where I am the buyer
    as_buyer = DirectChat.objects.filter(buyer=user).select_related('product', 'product__owner')
    # Chats where I am the seller
    as_seller = DirectChat.objects.filter(product__owner=user).select_related('product', 'buyer')

    def fmt(chat, role):
        last = chat.messages.last()
        unread = chat.messages.filter(is_read=False).exclude(sender=user).count()
        other = chat.product.owner if role == 'buyer' else chat.buyer
        ou_avatar = (
            other.avatar.url if getattr(other, 'avatar', None) and other.avatar else None
        )
        return {
            'chat_id': str(chat.id),
            'buyer_id': str(chat.buyer_id),
            'product_id': str(chat.product_id),
            'product_title': chat.product.title,
            'other_user': {
                'id': str(other.id),
                'full_name': other.full_name or other.email or '',
                'avatar': ou_avatar,
            },
            'last_message': last.content[:140] if last else None,
            'updated_at': chat.updated_at.isoformat(),
            'unread': unread,
            'role': role,
        }

    chats = [fmt(c, 'buyer') for c in as_buyer] + [fmt(c, 'seller') for c in as_seller]
    chats.sort(key=lambda x: x['updated_at'], reverse=True)
    return JsonResponse({'chats': chats})




@csrf_exempt
def general_ai_chat(request):
    """
    AI ёрдамчии умумӣ — маҳсулотҳои бозорро мебинад ва маслиҳат медиҳад.
    POST /api/ai/general/
    Body: { "message": "...", "history": [...] }
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    user_message = data.get('message', '').strip()
    history = data.get('history', [])

    if not user_message:
        return JsonResponse({'error': 'Empty message'}, status=400)

    # Бозорда мавҷуд маҳсулотҳоро гирем (50 та охирин)
    products = Product.objects.filter(
        is_active=True,
        owner__is_active=True,
        owner__is_banned=False,
    ).select_related('category', 'location').order_by('-created_at')[:50]

    # Маҳсулотҳоро ба матн табдил медиҳем
    products_text = ''
    for i, p in enumerate(products, 1):
        loc = ''
        if p.location:
            loc = p.location.name if hasattr(p.location, 'name') else str(p.location)
        cat = p.category.name if p.category else 'Дигар'
        products_text += (
            f'{i}. {p.title} | {p.price} TJS | '
            f'Категория: {cat} | '
            f'Ҷойгоҳ: {loc or "Номаълум"}\n'
        )

    system_prompt = (
        'Ту AI ёрдамчии бозори онлайн ҳастӣ. '
        'Номи бозор: Bozor.tj\n\n'
        'Вазифаи ту:\n'
        '1. Ба корбар маслиҳат диҳӣ — чӣ харидан, бо кадом буҷет\n'
        '2. Маҳсулотҳои мавҷударо тавсиф диҳӣ\n'
        '3. Нархҳоро муқоиса кунӣ\n'
        '4. Ба ҳар гуна савол дар бораи харид ҷавоб диҳӣ\n\n'
        f'МАҲСУЛОТҲОИ МАВҶУД ДАР БОЗОР ({len(products)} та):\n'
        f'{products_text}\n'
        'Ба забони корбар ҷавоб деҳ. Муфид, мухтасар ва дӯстона бош.'
    )

    messages = [{'role': 'system', 'content': system_prompt}]

    # Таърихи чатро илова мекунем (охирин 10 паём)
    for msg in history[-10:]:
        if msg.get('role') in ('user', 'assistant') and msg.get('content'):
            messages.append({'role': msg['role'], 'content': msg['content']})

    messages.append({'role': 'user', 'content': user_message})

    reply = groq_complete(messages, max_tokens=800)

    return JsonResponse({'reply': reply})