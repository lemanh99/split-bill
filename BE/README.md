# project bill faster  backend

## Installation

### 1.1 Environment Variables (.env)

Then create a `.env` file in the `project` directory:

```shell
touch .env
cp .env.example .env
```

Install python, suggest python >=3.12.0

### 1.2 Install poetry

Install poetry:

```sh
pip install poetry
```

Verify:

```sh
poetry --version
```

### 1.3 Install dependencies

Install dependencies:

```sh
poetry install
```

### 1.4 Running server

Run the server:

```sh
python main.py
```

Check the server at `http://localhost:8000/docs`

## translations

    at terminal

### 1. extract messages

```sh
pybabel extract -F babel.cfg -o i18n/messages.pot .
```

### 2. update message to locale

```sh
pybabel update -i i18n/messages.pot -d i18n -l en
pybabel update -i i18n/messages.pot -d i18n -l ja
pybabel update -i i18n/messages.pot -d i18n -l vi
```

### 3. compile message

```sh
pybabel compile -d i18n
```

## export requirement.txt

```sh
pip freeze > requirements.txt
```

## precommit

### install precommit

```sh
pre-commit install
```

### run precommit

```sh
pre-commit run --all-files
```

## migrations

add models from app to alembic env


base on alembic sqlalchemy when migration management
### when add app to module app, please include models to file migrations/env.py. ex:

### 1. create migration

     alembic revision --autogenerate -m "{name of migration}"

### 2. run migration

     alembic upgrade head
     alembic downgrade base