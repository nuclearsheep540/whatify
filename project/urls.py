"""project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from spotify_auth.views import cookie_session

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('rest/', include('rest_framework.urls')),
    path('api/', include('spotify_auth.urls')),
    path('db/', include('user.urls')),
    path('api/db/', include('user.urls')),
    path('', include('frontend.urls')),
    path('test', cookie_session)
    # path('api/', include('stations.urls')), REMEMBER TO CHANGE STATIONS
    # path('api/', include('jwt_auth.urls')), JWT?!
]
