ARG TIMEOUT_ALIVE
ARG WORKER_NUM

FROM python:3.12

ENV PYTHONUNBUFFERED 1

EXPOSE 8018

WORKDIR /work

COPY requirements.txt /work

RUN pip install -r requirements.txt

COPY . /work

RUN pybabel compile -d i18n

CMD python main.py
