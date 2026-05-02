import re

from django.conf import settings


def _telegram_href(raw):
    raw = (raw or '').strip()
    if not raw:
        return ''
    if raw.startswith('http://') or raw.startswith('https://'):
        return raw
    user = raw.lstrip('@').strip()
    if not user:
        return ''
    return f'https://t.me/{user}'


def _whatsapp_href(raw):
    raw = (raw or '').strip()
    if not raw:
        return ''
    digits = re.sub(r'\D', '', raw)
    if not digits:
        return ''
    return f'https://wa.me/{digits}'


def platform_contact(request):
    email = (getattr(settings, 'PLATFORM_CONTACT_EMAIL', None) or '').strip()
    tg_raw = (getattr(settings, 'PLATFORM_TELEGRAM', None) or '').strip()
    wa_raw = (getattr(settings, 'PLATFORM_WHATSAPP', None) or '').strip()

    tg_href = _telegram_href(tg_raw)
    wa_href = _whatsapp_href(wa_raw)
    if tg_raw.startswith('http'):
        m = re.search(r'(?:t\.me/)([^/?#]+)', tg_raw, re.I)
        tg_label = m.group(1) if m else 'Telegram'
    elif tg_raw:
        tg_label = tg_raw.lstrip('@')
    else:
        tg_label = ''

    return {
        'platform_contact': {
            'email': email,
            'email_href': f'mailto:{email}' if email else '',
            'telegram_href': tg_href,
            'telegram_label': tg_label or 'Telegram',
            'whatsapp_href': wa_href,
            'whatsapp_display': wa_raw or '',
            'has_any': bool(email or tg_href or wa_href),
        }
    }
