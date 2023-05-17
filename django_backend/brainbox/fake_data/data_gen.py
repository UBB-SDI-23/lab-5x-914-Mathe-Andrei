import hashlib
import time
import random

from faker import Faker
from mdgen import MarkdownPostProvider

fake = Faker()
fake.add_provider(MarkdownPostProvider)
fake.seed_instance(random.random())
unique_number = 0


# FOR ALL
def generate_date_times(num_entities: int, created_dates: list, updated_dates: list):
    for i in range(num_entities):
        created_at = fake.date_time_between()
        updated_at = fake.date_time_between(start_date=created_at)
        created_dates.append(created_at)
        updated_dates.append(updated_at)


# USER
def generate_user_usernames(num_entities, usernames: set):
    global unique_number
    for i in range(num_entities):
        username = fake.user_name()
        if username in usernames:
            username = username + str(unique_number)
            unique_number += 1
        usernames.add(username)


def generate_user_emails(num_entities: int, emails: set):
    global unique_number
    for i in range(num_entities):
        email = fake.free_email()
        if email in emails:
            email = email.split('@')[0] + str(unique_number) + '@' + email.split('@')[1]
            unique_number += 1
        emails.add(email)


def generate_user_passwords(num_entities: int, passwords: list):
    for i in range(num_entities):
        password = fake.password(length=random.randint(8, 12))
        passwords.append(password)


def generate_user(num_entities: int, batch_size: int):
    print("Generating users...")

    usernames = set()
    emails = set()
    password = 'pbkdf2_sha256$390000$CZi9Saquw5Wk2233tcIs6g$fNzPOzg1RjASAah+yz+EZQHD0Q++6/Jstn4FUjJjAoI='
    created_dates = list()
    updated_dates = list()

    tic = time.perf_counter()

    generate_user_usernames(num_entities, usernames)
    generate_user_emails(num_entities, emails)
    # generate_user_passwords(num_entities, passwords)
    generate_date_times(num_entities, created_dates, updated_dates)

    print(len(usernames))
    print(len(emails))
    # print(len(passwords))
    print(len(created_dates))
    print(len(updated_dates))

    with open('user_data.sql', 'w') as f:
        for index, user in enumerate(zip(usernames, emails, created_dates, updated_dates)):
            username, email, created_at, updated_at = user
            if index % batch_size == 0:
                f.write(f"INSERT INTO brainbox_user (username, email, password, created_at, updated_at, last_login, is_superuser, is_staff, is_active) VALUES\n")
            f.write(f"('{username}', '{email}', '{password}', '{created_at}', '{updated_at}', null, 0, 0, 1){';' if (index + 1) % batch_size == 0 else ','}\n")

    toc = time.perf_counter()
    print(f"Generated users in {toc - tic:0.4f} seconds")


def generate_profile_bios(num_entities: int, bios: list):
    for i in range(num_entities):
        bio = fake.paragraph()
        bios.append(bio)


def generate_profile_websites(num_entities: int, websites: list):
    for i in range(num_entities):
        website = fake.url()
        websites.append(website)


def generate_profile(num_entities: int, batch_size: int):
    print("Generating profiles...")

    bios = list()
    websites = list()

    tic = time.perf_counter()

    generate_profile_bios(num_entities, bios)
    generate_profile_websites(num_entities, websites)

    print(len(bios))
    print(len(websites))

    with open('profile_data.sql', 'w') as f:
        for index, profile in enumerate(zip(bios, websites)):
            bio, website = profile
            birthday = fake.date_between()
            dark_mode = random.choice([0, 1])
            page_size = random.randint(10, 50)
            if index % batch_size == 0:
                f.write(f"INSERT INTO brainbox_userprofile (user_id, bio, birthday, website, dark_mode, page_size) VALUES\n")
            f.write(f"('{index + 1}', '{bio}', '{birthday}', '{website}', {dark_mode}, {page_size}){';' if (index + 1) % batch_size == 0 else ','}\n")

    toc = time.perf_counter()
    print(f"Generated profiles in {toc - tic:0.4f} seconds")


# FOLDER
def generate_folder_name(num_entities: int, names: list):
    names.extend(fake.words(nb=num_entities))


def generate_folder_user(num_entities: int, num_users: int, users: list, user_folders: dict):
    for i in range(num_entities):
        user = random.randint(0, num_users - 1)
        users.append(user)
        if user in user_folders:
            user_folders[user].append(i)
        else:
            user_folders[user] = [i]


def generate_folder_parent_folder(num_entities: int, parent_folders: list, users: list, user_folders: dict):
    for i in range(num_entities):
        user = users[i]
        parent_folder = None
        prob = random.uniform(0, 1)  # probability to have a parent folder
        if prob > 0.3:
            if user in user_folders and len(user_folders[user]) > 1:
                folders = user_folders[user][:]
                folders.remove(i)
                parent_folder = random.choice(folders)
        parent_folders.append(parent_folder)


def generate_folder(num_entities: int, num_users: int, batch_size: int, user_folders: dict):
    print("Generating folders...")

    names = list()
    users = list()
    parent_folders = list()
    created_dates = list()
    updated_dates = list()

    tic = time.perf_counter()

    generate_folder_name(num_entities, names)
    generate_folder_user(num_entities, num_users, users, user_folders)
    generate_folder_parent_folder(num_entities, parent_folders, users, user_folders)
    generate_date_times(num_entities, created_dates, updated_dates)

    print(len(names))
    print(len(users))
    print(len(parent_folders))
    print(len(created_dates))
    print(len(updated_dates))

    with open('folder_data.sql', 'w') as f:
        for index, folder in enumerate(zip(names, users, parent_folders, created_dates, updated_dates)):
            name, user, parent_folder, created_at, updated_at = folder
            if index % batch_size == 0:
                f.write(f"INSERT INTO brainbox_folder (name, user_id, parent_folder_id, created_at, updated_at) VALUES\n")
            f.write(f"('{name}', {user + 1}, {'null' if parent_folder is None else parent_folder + 1}, '{created_at}', '{updated_at}'){';' if (index + 1) % batch_size == 0 else ','}\n")

    toc = time.perf_counter()
    print(f"Generated folders in {toc - tic:0.4f} seconds")


# FILE
def generate_file_name(num_entities: int, names: list):
    for i in range(num_entities):
        name = fake.file_name(extension='')[:-1]
        names.append(name)


def generate_file_content(num_entities: int, contents: list):
    for i in range(num_entities):
        # content_length = random.choice(['small', 'medium'])
        # content = fake.post(size=content_length)
        content = fake.text()
        contents.append(content)


def generate_file_user(num_entities: int, num_users: int, users: list, file_user: dict):
    for i in range(num_entities):
        user = random.randint(0, num_users - 1)
        users.append(user)
        file_user[i] = user


def generate_file_folder(num_entities: int, folders: list, users: list, user_folders: dict):
    for i in range(num_entities):
        user = users[i]
        folder = None
        prob = random.uniform(0, 1)  # probability to have a parent folder
        if prob > 0.3:
            if user in user_folders:
                folder = random.choice(user_folders[user][:])
        folders.append(folder)


def generate_file(num_entities: int, num_users: int, batch_size: int, user_folders: dict, file_user: dict):
    print("Generating files...")

    names = list()
    contents = list()
    users = list()
    folders = list()
    created_dates = list()
    updated_dates = list()

    tic = time.perf_counter()

    generate_file_name(num_entities, names)
    generate_file_content(num_entities, contents)
    generate_file_user(num_entities, num_users, users, file_user)
    generate_file_folder(num_entities, folders, users, user_folders)
    generate_date_times(num_entities, created_dates, updated_dates)

    print(len(names))
    print(len(contents))
    print(len(users))
    print(len(folders))
    print(len(created_dates))
    print(len(updated_dates))

    with open('file_data.sql', 'w') as f:
        for index, file in enumerate(zip(names, contents, users, folders, created_dates, updated_dates)):
            name, content, user, folder, created_at, updated_at = file
            if index % batch_size == 0:
                f.write(f"INSERT INTO brainbox_file (name, content, user_id, folder_id, created_at, updated_at) VALUES\n")
            f.write(f"('{name}', '{content}', {user + 1}, {'null' if folder is None else folder + 1}, '{created_at}', '{updated_at}'){';' if (index + 1) % batch_size == 0 else ','}\n")

    toc = time.perf_counter()
    print(f"Generated files in {toc - tic:0.4f} seconds")


def generate_shared_file(num_entities: int, num_users: int, num_relations_per_entity: int, batch_size: int, file_user: dict):
    print("Generating shared files...")

    tic = time.perf_counter()

    with open('shared_file_data.sql', 'w') as f:
        index = 0
        for file_id in range(num_entities):
            user_ids = random.sample(range(num_users), num_relations_per_entity)
            for user_id in user_ids:
                if file_id in file_user:
                    while user_id == file_user[file_id]:
                        user_id = random.randint(0, num_users)
                if index % batch_size == 0:
                    f.write(f"INSERT INTO brainbox_sharedfile (user_id, file_id, permission) VALUES\n")
                f.write(f"({user_id + 1}, {file_id + 1}, '{random.choice(['R', 'RW'])}'){';' if (index + 1) % batch_size == 0 else ','}\n")
                index += 1

    toc = time.perf_counter()
    print(f"Generated shared files in {toc - tic:0.4f} seconds")


def main():
    user_folders = dict()
    file_user = dict()
    num_users = 10000
    num_entities = 1000000
    num_relations_per_entity = 10
    batch_size = 1000

    tic = time.perf_counter()

    generate_user(num_users, batch_size)
    print('\n')
    generate_profile(num_users, batch_size)
    print('\n')
    # generate_folder(num_entities, num_users, batch_size, user_folders)
    # print('\n')
    # generate_file(num_entities, num_users, batch_size, user_folders, file_user)
    # print('\n')
    # generate_shared_file(num_entities, num_users, num_relations_per_entity, batch_size, file_user)

    toc = time.perf_counter()
    print(f"Generated all in {toc - tic:0.4f} seconds")


if __name__ == '__main__':
    main()
