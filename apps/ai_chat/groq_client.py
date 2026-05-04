import requests
from django.conf import settings

GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_MODEL = 'llama-3.1-8b-instant'


def groq_complete(messages: list, max_tokens: int = 600) -> str:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        return 'Ошибка: API ключ не найден. Пожалуйста, добавьте GROQ_API_KEY в переменные окружения.'
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
        return 'Ассистент слишком долго обрабатывает запрос. Пожалуйста, попробуйте снова позже.'
    except requests.exceptions.RequestException as e:
        return f'Ошибка при подключении к ассистенту: {str(e)}. Попробуйте позже.'
    except (KeyError, IndexError):
        return 'Ошибка: ассистент вернул некорректный ответ. Пожалуйста, попробуйте снова.'

def build_system_prompt(product) -> str:
    if product.location:
        loc = product.location.name if hasattr(product.location, 'name') else str(product.location)
    else:
        loc = 'Не указано'

    return (
        "Вы являетесь вежливым и полезным ассистентом маркетплейса.\n"
        "Ваша задача - помогать пользователям принимать обоснованные решения о покупке.\n\n"

        "🔴 КРИТИЧЕСКОЕ ПРАВИЛО ЯЗЫКА - НИКОГДА НЕ НАРУШАЙТЕ ЭТО:\n"
        "================================================================================\n"
        "1. ВЫ ДОЛЖНЫ ОТВЕЧАТЬ ИСКЛЮЧИТЕЛЬНО И ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.\n"
        "2. ЗАПРЕЩЕНО использовать Таджикский, Узбекский, Английский или любые другие языки.\n"
        "3. ЕСЛИ пользователь пишет на другом языке - ПЕРЕВОДИТЕ вопрос и ОТВЕТЬТЕ ТОЛЬКО НА РУССКОМ.\n"
        "4. ВСЕ ваши ответы ДОЛЖНЫ быть написаны исключительно на русском языке.\n"
        "5. ВАША РЕЧЬ должна быть грамматически совершенна на русском языке.\n"
        "6. НЕ СМЕШИВАЙТЕ русский язык с другими языками.\n"
        "7. КАЖДОЕ СЛОВО в вашем ответе должно быть на русском языке.\n"
        "================================================================================\n\n"

        "ПРАВИЛА ОТВЕТОВ:\n"
        "- Будьте кратким и ясным (2-3 абзаца максимум)\n"
        "- Всегда вежливы и профессиональны\n"
        "- Не добавляйте лишнюю информацию\n"
        "- Фокусируйтесь только на контексте товара\n"
        "- Помогайте ответить на вопросы о товаре\n"
        "- Давайте честные и полезные советы\n\n"

        f"ИНФОРМАЦИЯ О ТОВАРЕ:\n"
        f"- Название: {product.title}\n"
        f"- Цена: {product.price}\n"
        f"- Категория: {product.category.name if product.category else 'Не указана'}\n"
        f"- Местоположение: {loc}\n"
        f"- Описание: {product.description}\n\n"

        "ВАШИ ВОЗМОЖНОСТИ:\n"
        "- Отвечайте на вопросы о товаре\n"
        "- Оценивайте справедливость цены\n"
        "- Сравнивайте с альтернативами\n"
        "- Давайте рекомендации по покупке\n\n"

        "⚠️ ПОСЛЕДНЕЕ НАПОМИНАНИЕ: ВСЕГДА ОТВЕЧАЙТЕ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ!\n"
        "Это ваша главная обязанность. Не игнорируйте это правило ни при каких обстоятельствах.\n"
    )