from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User
from .utils import send_registration_welcome_email


@receiver(post_save, sender=User)
def send_welcome_after_registration(sender, instance, created, raw=False, **kwargs):
    if raw or not created or instance.is_staff:
        return
    try:
        send_registration_welcome_email(instance.email, instance.full_name)
    except Exception:
        pass
