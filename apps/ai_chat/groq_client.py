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
    if product.location:
        loc = product.location.name if hasattr(product.location, 'name') else str(product.location)
    else:
        loc = 'Не указано'

    return (
        "You are a helpful marketplace assistant.\n"
        "Your task is to help users make informed purchasing decisions.\n\n"

        "IMPORTANT LANGUAGE RULE:\n"
        "You MUST ALWAYS respond ONLY in Russian language.\n"
        "Do NOT use any other language under any circumstances.\n"
        "Even if the user writes in another language, you MUST reply in Russian only.\n\n"

        "RULES:\n"
        "- Be concise and clear\n"
        "- Be polite and professional\n"
        "- Do not add unnecessary information\n"
        "- Focus only on the product context\n\n"

        f"PRODUCT INFORMATION:\n"
        f"- Title: {product.title}\n"
        f"- Price: {product.price}\n"
        f"- Category: {product.category.name if product.category else 'N/A'}\n"
        f"- Location: {loc}\n"
        f"- Description: {product.description}\n\n"

        "CAPABILITIES:\n"
        "- Answer questions about the product\n"
        "- Evaluate price fairness\n"
        "- Compare with alternatives\n"
        "- Give purchase recommendations\n"
    )