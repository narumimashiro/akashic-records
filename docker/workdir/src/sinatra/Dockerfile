FROM ubuntu:20.04

RUN apt update
# 以下の-yオプションはYes/NoのYesを実行という意味
RUN apt install -y ruby ruby-bundler

# bundle installのために必要のためコピー
COPY Gemfile .

RUN apt install -y ruby-dev build-essential libmariadb-dev
RUN bundle install

RUN apt install -y iproute2