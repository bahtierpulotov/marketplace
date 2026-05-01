import requests
from django.conf import settings

GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_MODEL = 'llama-3.1-8b-instant'


def groq_complete(messages: list, max_tokens: int = 600) -> str:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        return 'AI калид нест. GROQ_API_KEY ро ба .env илова кунед.'
    try:
        response = requests.post(
            GROQ_API_URL,
            json={'model': GROQ_MODEL, 'messages': messages,
                  'temperature': 0.7, 'max_tokens': max_tokens},
            headers={'Authorization': f'Bearer {api_key}',
                     'Content-Type': 'application/json'},
            timeout=20,
        )
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content'].strip()
    except requests.exceptions.Timeout:
        return 'AI ҷавоб надод. Дубора кӯшиш кунед.'
    except requests.exceptions.RequestException as e:
        return f'AI хато: {str(e)}'
    except (KeyError, IndexError):
        return 'AI ҷавоби нодуруст.'


def build_system_prompt(product) -> str:
    # location — ForeignKey объект аст, name-ашро мегирем
    if product.location:
        loc = product.location.name if hasattr(product.location, 'name') else str(product.location)
    else:
        loc = 'Нишон дода нашудааст'

    return (
        'You are a helpful marketplace assistant. '
        'Help buyers make informed decisions.\n\n'
        f'PRODUCT:\n'
        f'- Title: {product.title}\n'
        f'- Price: {product.price}\n'
        f'- Category: {product.category.name if product.category else "N/A"}\n'
        f'- Location: {loc}\n'
        f'- Description: {product.description}\n\n'
        'You can: answer questions, evaluate price fairness, '
        'give recommendations, compare with alternatives.\n'
        'Be concise and friendly. Reply in the same language the user uses.'
    )