# Generated by Django 4.0.5 on 2022-06-10 17:01

from django.db import migrations, models
import tinymce.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='container',
            name='content',
            field=tinymce.models.HTMLField(verbose_name='Content'),
        ),
        migrations.AlterField(
            model_name='container',
            name='name',
            field=models.CharField(max_length=150, verbose_name='Name'),
        ),
    ]