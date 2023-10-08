# **Dockerについて**

## **Agenda**

  - [**参照ページ**](#参照ページ)
  - [**dockerとは何か(AWSより)**](#dockerとは何かAWSより)
  - [**Dockerのメリットと恩恵**](#Dockerのメリットと恩恵)
  - [**Dockerの基礎知識**](#Dockerの基礎知識)
    - [**Dockerコンテナ**](#Dockerコンテナ)
    - [**Dockerイメージ**](#Dockerイメージ)
    - [**Dockerfile**](#Dockerfile)
    - [**Docker Hub(Dockerレジストリ)**](#Docker-HubDockerレジストリ)
  - [**雰囲気DockerとVirtualBoxの違い**](#雰囲気DockerとVirtualBoxの違い)

### **参照ページ**

- [AWS Docker](https://aws.amazon.com/jp/docker/)
- [Kagoyaサーバー教室](https://www.kagoya.jp/howto/cloud/container/docker/)

## **dockerとは何か(AWSより)**

Dockerとは、アプリケーションをすばやく構築、テスト、デプロイできるソフトウェアプラットフォーム

コンテナと呼ばれる標準化されたユニットにソフトウェアをパッケージ化する

コンテナにはライブラリ、システムツール、コード、ランタイムなど、ソフトウェアの実行に必要なものすべてが含まれている





## **Dockerのメリットと恩恵**

- 手軽かつスピーディにアプリケーションの実行環境を確保できる
- 処理速度が早い(CPUやメモリーの使用量を節約できる)
- アプリケーション実行環境の移転が簡単

上記メリットの恩恵とした以下の用途でよく利用されている

- 他エンジニアと開発環境の共有
- 複数ＯＳでアプリけーしょの動作確認
- バージョイン管理システム

## **Dockerの基礎知識**

### **Dockerコンテナ**

Dockerコンテナとは、Dockerによって構築されるアプリケーションの実行完了(仮想環境)のこと

Dockerコンテナは独立環境として存在していて、他のコンテナやホストの環境に影響を及ぼすことはない

Dockerは従来の仮想環境と違ってゲストOSの起動がいらないため、軽快な動作が可能となっている

従来の仮想環境は仮想環境用のホストOSがあり、仮想環境内で動作させるアプリそれぞれが持つゲストOSを起動していたため、起動に時間が掛かっていた

### **Dockerイメージ**

DockerイメージとはDockerコンテナの動作環境についてまとめたテンプレートファイル

Dockerイメージには、コンテナに使われるアプリケーションから実行用のコマンド、メタデータまで含まれる

Dockerコンテナの作成のためにはDockerイメージが必須

静的なDockerイメージを専用コマンドで実行することで、コンテナが起動され、アプリケーションの実行環境として使用できる状態になる

### **Dockerfile**

DockerfileはDockerイメージを作成するための設計図にあたるテキストファイル

Dockerfileにはコンテナ設計内容がコマンド形式でまとめられている

Dockerfileを専用コマンドでbuildして、イメージの作成を行う

出来上がったものを実行(run)することでコンテナが作成される

### **Docker Hub(Dockerレジストリ)**

Dockerレジストリとはイメージを保存、共有する場所のこと

Dockerレジストリ上にイメージの作成をしたり、他のユーザーが作成したDockerイメージを取得して使用したりできる

##　**雰囲気で綴るDockerとVirtualBoxの違い**

VirtualBoxなどの仮想環境はPC内に、仮想的なPCをシミュレートするもの

具体的には自前のWindowsOSのPCにLinuxOS環境を作るためにVirturaｌBoxを導入して、起動している感じ

なので、前述にあったDockerは通常仮想環境より起動が早いという話につながり、仮想環境は処理を行うのにワンクッション挟む形となり、遅い

一方、Dockerは現実のOSをそのまま使って実行(※つまりLinuxOSが良ければ現実のPCもLinuxでなければならないことになる)するので、遅延が起きることがない

## **環境構築の再現性を高める2つの方法**

### **Infrastrructure as Code**

環境構築の内容をコード化する

ツール例 : Ansible,Chef

#### **デメリット**

- 実行時にエラーになる場合がある
- サーバー起動時に実行すると時間がかかる

### **構築した環境をイメージ化**

動く環境をイメージ化して運搬

ツール例 : Amazon AMI

#### **デメリット**

- VMイメージは作成に時間がかかる
- サイズが大きく、転送にかかる時間が長い

> Dockerは両者のメリットをいいとこどりしている。

## **実際にDockerを使って環境構築、保存してみた**

### **dockerのインストール**

Docker Documentと検索して書いてある通りにインストール
WindowsだとWSLが必要

### **UbuntuのイメージをDockerHubからインストール**

WSLコンソールを開き、`docker run ubuntu:20.04 echo hello world`を打ち込む。

これはUbuntuのイメージファイルをダウンロードしつつ、Hello worldを出力している

### **UbuntuのコンテナからRubyをインストール**

`docker run -it ubuntu:20.04 bash`

`apt update`

`apt install ruby ruby-bundler`

これでUbuntuのコンテナ内にRubyなどのインストールが完了した

`exit`

でコンテナから抜ける

### **コンテナ一覧を確認する**

`docker ps`これでコンテナを確認することができる

停止したコンテナも表示させる場合は`-a`オプションをつける

### **コンテナをイメージ化する**

`docker commit ${CONTAINER ID}　my-ruby-container:commit`

上記コマンドで指定したコンテナをイメージ化する

`docker run -it my-ruby:commit bash`

上記コマンドで作成したイメージをもとにコンテナを起動することができる

入った直後に`ruby -v`を打ち込むとまだインストールコマンドの手順を踏んでいなくても、Versionが表示されるはず

### **dockerfileを作成する**

dockerfileを作成することで、環境構築をコード化することができる

作成したdockerfileは`docker build -t ${NAME}:dockerfile .`でimageファイルができる

### **dockerのボリューム機能を使う**

コンテナを起動するとコンテナ内部で作成したファイルなどは削除され、消えてしまうが

ボリュームを使うことで保持することができる

```
docker run -it -v $PWD:/opt/myapp -w /opt/myp my-ruby:dockerfile
```

上記コマンドでボリュームの作成ができる

ここでlsなどを行うとカレントディレクトリと同じ構成が見えるはず

#### **コマンドの意味**

- -vは$PWDカレントディレクトリをコンテナの/opt/myappに`マウント`する

- -wはコンテナ内のカレントディレクトリを/opt/myappにするということ

### **Docker buildがうまくいかない**

`docker build --no-cathe -t my-ruby:dockerfile .`

キャッシュが残っている可能性

変更がない箇所はキャッシュを利用してしまう

またsudo apt install ~は始めにsudo apt updateと情報を更新してから実行しないといけないコマンドなので、Dockerfileの上部が変更なしでキャッシュ利用されてしまうと

apt updateが実行されず、下の部分でエラーになる

### **コンテナでRubyファイルを実行しつつ、作業をする方法**

Dockerコンテナの中でサーバーの起動をしつつ、でも作業がしたい場合などがある

そんなときには`-d`オプションをつけることで解決する

`
docker run -it -v $PWD:/opt/myapp -w /opt/myapp -d my-ruby:dockerfile ruby myapp.rb
`

上記コマンドを打ったあとに`docker ps`と打つと、rubyファイルを実行中のコンテナの存在が確認できる

その後、`docker exec ${UID} bash`などでコンテナに入ることができる

### **コンテナの中とホストはネットワークが別物**

sinatraを起動したのち、ホストのchromeなどでhttps://localhost:4567にアクセスしようとしてもつながらないはず

それはコンテナで起動していても、ネットワークが別物のため、ポートを正しく指定してもホスト側で正しくアクセスできない

そのときにはコンテナのportとホストのportをマッピングして、つなげてあげれば良い

そのためのコマンドは`-p`オプションをつけて、ポートとポートをしていてつなげれる

`docker run -it -v $PWD:/opt/myapp -w /opt/myapp -d -p 4567:4567 my-ruby:dockerfile ruby myapp.rb`

これで転送が可能になったが、次はコンテナ内のlocalhostが自身から自身への通信のみで、外部からのlocalhost宛てはまだ受け付けられていない問題の解決が必要

`docker run -it -v $PWD:/opt/myapp -w /opt/myapp -d -p 4567:4567 my-ruby:dockerfile ruby myapp.rb -o 0.0.0.0`

コンテナ起動コマンドに対して、`-o 0.0.0.0`オプションをつける

コンテナの中に入り、ss -antupすると

`0.0.0.0:4567`と表記が変わっており、これは自分宛先ならすべてを受け入れるという意味

## **MySQLコンテナを作成する**

### **環境構築**

Dockerコンテナは一つにつき、一つのことを行うのがベストなので、Sinatra用とは別で、MySQL用のコンテナを作成する

また、有名どころはDockerの公式に行くとImageがすでに用意されていたりする

`docker run --name my-db -e MYSQL_ROOT_PASSWORD=rootpassword -d --platform linux/x86_64 mysql:8.0.29`

これでイメージファイルなどをダウンロードして、コンテナの起動ができる

### **コンテナ起動してそのままシェルスクリプトなどを実行してくれるように作られているよう**

以下コマンドを実行することで、用意したシェルスクリプトなどがコンテナ起動と同時に実行される

`docker run --name my-db -e MYSQL_ROOT_PASSWORD=rootpassword -d --platform linux/x86_64 -v $PWD/mysql/docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d mysql:8.0.29`

### **MySQLとSinatraのコンテナ疎通**

`
docker network create my-net
`

`
docker run --name my-db -e MYSQL_ROOT_PASSWORD=rootpassword -d --platform linux/x86_64 -v $PWD/mysql/docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d --net my-net mysql:8.0.29
`

`
docker run -it -v $PWD:/opt/myapp -w /opt/myapp 
-d -p 4567:4567 --net my-net my-ruby:dockerfile ruby myapp.rb -o 0.0.0.0
`