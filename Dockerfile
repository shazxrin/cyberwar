FROM fedora:38

RUN dnf update -y
RUN dnf install -y poetry nodejs nodejs-npm \
    && dnf clean packages

RUN mkdir /app
COPY ./ /app
WORKDIR /app

RUN cd ./webapp\
    && npm install \
    && npm run build \
    && cd ..

RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

ARG GS_CRED
ENV GS_CRED=$GS_CRED
ARG GS_SHEET_ID
ENV GS_SHEET_ID=$GS_SHEET_ID

ENTRYPOINT ["poetry", "run", "python3", "main.py"]
