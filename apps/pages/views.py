from django.shortcuts import render


def home(request):
    return render(request, 'pages/home.html')


def page_login(request):
    return render(request, 'pages/login.html')


def page_register(request):
    return render(request, 'pages/register.html')


def page_verify(request):
    return render(request, 'pages/verify.html')


def page_forgot_password(request):
    return render(request, 'pages/forgot_password.html')


def page_restore(request):
    return render(request, 'pages/restore.html')


def page_profile(request):
    return render(request, 'pages/profile.html')


def page_create_product(request):
    return render(request, 'pages/create_product.html')


def page_product_detail(request, product_id):
    return render(request, 'pages/product_detail.html', {'product_id': str(product_id)})


def page_product_edit(request, product_id):
    return render(request, 'pages/edit_product.html', {'product_id': str(product_id)})


def page_direct_chat(request, product_id):
    return render(request, 'pages/direct_chat.html', {'product_id': str(product_id)})


def page_public_profile(request, user_id):
    return render(request, 'pages/public_profile.html', {'public_user_id': str(user_id)})


def page_not_found(request, path=None):
    return render(request, 'pages/not_found.html', status=404)
