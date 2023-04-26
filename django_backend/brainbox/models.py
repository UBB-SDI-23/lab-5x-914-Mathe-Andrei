from django.db import models


class User(models.Model):
    username = models.CharField(max_length=100, unique=True, db_index=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"username: {self.username}"


class Folder(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders')
    parent_folder = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='child_folders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"name: {self.name}"


class File(models.Model):
    name = models.CharField(max_length=100)
    content = models.TextField(blank=True, default='')
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True, related_name='files')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='personal_files')
    shared_users = models.ManyToManyField(User, through='SharedFile')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"name: {self.name}"


class SharedFile(models.Model):
    class Permissions(models.TextChoices):
        R = ('R', 'Read-Only')
        RW = ('RW', 'Read-Write')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_files')
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    permission = models.CharField(max_length=2, choices=Permissions.choices)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'file'], name='unique_shared_file')
        ]
