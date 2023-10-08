#!/bin/bash

how_to_use() {
  echo "Usage Option"
  echo "run : to start the container"
  echo "build : to create image from dockerfile"
}

if [ $# -lt 1 ]; then
  how_to_use
  exit 1
fi

if [ $1 == "--help" ]; then
  how_to_use
  exit 1
elif [ $1 == "run" ]; then
  echo "starting the container..."
  # Dockerコンテナ起動コマンド
  docker run -it -v $PWD:/opt/myapp -w /opt/myapp -d -p 4567:4567 my-ruby:dockerfile ruby myapp.rb -o 0.0.0.0
elif [ $1 == "build" ]; then
  echo "creating image from dockerfile"
  # Docker imageの作成
  docker build --no-cathe -t my-ruby:dockerfile .
else
  echo "idk this option"
  echo "pls type ./docker.sh --help"
  exit 1
fi