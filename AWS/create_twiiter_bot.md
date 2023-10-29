# X(Twitter)のBotを作ってみた件

- [X(Twitter)のBotを作ってみた件](#XTwitterのBotを作ってみた件)
      - [関連技術](#関連技術)
  - [製作物概要](#製作物概要)
  - [設計概要](#設計概要)
  - [製作過程](#製作過程)
    - [まずはスクレイピング処理を実装していく](#まずはスクレイピング処理を実装していく)
  - [S3にとりあえずの情報をstoreinfo.jsonで保存しておく](#S3にとりあえずの情報をstoreinfojsonで保存しておく)
    - [AWS Management Consoleを開いて、サービスの中からS3見つけ、サービスに移動する。](#AWS-Management-Consoleを開いて、サービスの中からS3見つけ、サービスに移動する。)
    - [バケットを作成ボタンがあると思うので、押下する](#バケットを作成ボタンがあると思うので、押下する)
    - [作成したバケットにJsonファイルをアップロードする](#作成したバケットにJsonファイルをアップロードする)
  - [IAMロールの作成](#IAMロールの作成)
    - [AWS Management Consoleを開いて、サービスの中からIAM見つけ、サービスに移動する。](#AWS-Management-Consoleを開いて、サービスの中からIAM見つけ、サービスに移動する。)
    - [ロールメニューに行き、ロールの作成を押下](#ロールメニューに行き、ロールの作成を押下)
  - [TwitterAPIの準備](#TwitterAPIの準備)
    - [Dashboardに移動して、認証設定を行う](#Dashboardに移動して、認証設定を行う)
    - [アクセスキーなどの発行](#アクセスキーなどの発行)
    - [自動ツイートの実装](#自動ツイートの実装)
  - [AWS Lambda関数の作成](#AWS-Lambda関数の作成)
    - [AWS Management Consoleを開いて、サービスの中からLambdaを見つけ、サービスに移動する。](#AWS-Management-Consoleを開いて、サービスの中からLambdaを見つけ、サービスに移動する。)
    - [関数の作成](#関数の作成)
  - [S3からJsonファイルを取得する実装](#S3からJsonファイルを取得する実装)
  - [最終的に出来上がったコード](#最終的に出来上がったコード)
  - [AWS Lambdaの環境構築およびデプロイ](#AWS-Lambdaの環境構築およびデプロイ)
    - [PythonライブラリのZip化＆アップロード](#PythonライブラリのZip化＆アップロード)
    - [lambdaハンドラ関数作成](#lambdaハンドラ関数作成)
    - [環境変数設定](#環境変数設定)
  - [Amazon EventBridgeの設定](#Amazon-EventBridgeの設定)
    - [スケジュールの詳細の指定](#スケジュールの詳細の指定)
    - [ターゲットの設定](#ターゲットの設定)
    - [設定オプション](#設定オプション)

#### 関連技術

- AWS Lambda
- Amazon S3
- Amazon EventBridge
- IAM
- Python

## 製作物概要

プロジェクトセカイのオフィシャルグッズ販売サイト[ColorFul Palette Store](https://store.colorfulpalette.jp/)の新着商品を1日1度自動でチェックして、前日と差分があれば、Twitterにて自動投稿してくれるBotの製作

## 設計概要

1. Amazon EventBridgeを用いて、1日の特定の時間でAWS Lambda関数を実行させる
2. AWS LambdaにPythonで書いた処理をデプロイする
- Amazon S3にStoreの情報がJsonファイルで保存されているので取得する
- スクレイピングして取得した最新情報と比較し差分のチェックを行う
- 最新情報と比較して、差分のチェックを行い、新規追加された商品がないかチェックする
- 差分が見つかれば、差分があった最新情報をTwitterAPIを用いて、自動ツイートする

## 製作過程

### まずはスクレイピング処理を実装していく

スクレイピング処理と言えば、Pythonだと思うので、言語はPythonとし調べて実装

完成したスクリプトは以下

```py
import requests
from bs4 import BeautifulSoup

topPage = 'https://store.colorfulpalette.jp'
storePage = 'https://store.colorfulpalette.jp/collections/rp_cpstore'

def getStoreNewLineup():
    res = requests.get(storePage)
    data = []
    if(res.status_code == 200):
        soup = BeautifulSoup(res.text, 'html.parser')
        # 商品一覧の要素取得
        itemList = soup.find('div', class_='grid grid--uniform')
        # 商品名
        itemNames = itemList.find_all('div', class_='grid-product__title')
        # 値段
        itemPrices = itemList.find_all('div', class_='grid-product__price')
        # 個々商品リンク
        itemLinks = itemList.find_all('a', class_='grid-product__link')
        # リストにまとめる
        for n in range(len(itemNames)):
            data.append({'name': itemNames[n].get_text(),
                         'price': itemPrices[n].get_text().replace('\n', ''),
                         'link': topPage + itemLinks[n].get('href')})
        return data
```

```py
res = requests.get(storePage)
```

requestsモジュールを用いて、Webサイトにアクセスする

```py
soup = BeautifulSoup(res.text, 'html.parser')
```

ステータスコードが200だったら、そのページのhtmlを取得する

```py
# 商品一覧の要素取得
itemList = soup.find('div', class_='grid grid--uniform')
# 商品名
itemNames = itemList.find_all('div', class_='grid-product__title')
# 値段
itemPrices = itemList.find_all('div', class_='grid-product__price')
# 個々商品リンク
itemLinks = itemList.find_all('a', class_='grid-product__link')
```

開発者用メニューを開いて、商品の要素がどこにあるかを
チェック

findやfind_all関数を用いて、要素やClassを指定して、欲しい情報を取得していく

```py
# リストにまとめる
for n in range(len(itemNames)):
    data.append({'name': itemNames[n].get_text(),
                 'price': itemPrices[n].get_text().replace('\n', ''),
                 'link': topPage + itemLinks[n].get('href')})
```

取得してきた情報をリストにまとめておく

## S3にとりあえずの情報をstoreinfo.jsonで保存しておく

### AWS Management Consoleを開いて、サービスの中からS3見つけ、サービスに移動する。

### バケットを作成ボタンがあると思うので、押下する

`一般的な設定`

バケット名 : なんでも

AWSリージョン ： 東京がいいと思う

`オブジェクト所有者`

デフォルトのACL(推奨)でいいと思う

`このバケットのブロックパブリックアクセス設定`

デフォルト

すべてブロックでヨシｯ

`その他`

以降全部デフォルトでいじっていないため、割愛。

### 作成したバケットにJsonファイルをアップロードする

アップロードボタンがあるかと思うので、そこから先ほど作成したJsonファイルをアップロードする。

## IAMロールの作成

IAMロールの作成。

これを設定し、先ほど作成したS3へのアクセス許可を取らないとJsonファイルが取得できない

### AWS Management Consoleを開いて、サービスの中からIAM見つけ、サービスに移動する。

### ロールメニューに行き、ロールの作成を押下

`信頼されたエンティティを選択`

AWSのサービスにチェック

`ユースケース`

Lambdaを選択し、次へ

`許可ポリシー`

検索画面にS3を入れる

S3のオブジェクトに対して読み書きができるようにしたい。

今回は「AmazonS3FullAccess」を選択した。

`名前決めなど`

最後に名前決めのページに遷移すると思うが、何のロールか自分が認識できるように命名して

ロールの作成をし、完了

## TwitterAPIの準備

S3の設定をしたが、Lambda上でしか、動作確認ができないので、いったん先に自動ツイート機能を実装していく

[Developer Portal](https://developer.twitter.com/en/portal/products/free)

上記サイトがTwitterAPI利用する開発者のためのサイト

Freeで月に1500回まではAPI利用できる

### Dashboardに移動して、認証設定を行う

`User authentication settings`

Editを押して、編集画面に行き、AppPermissionsがReadになっているのをRead and Writeに変更

その他テキトーに入力して、Save

### アクセスキーなどの発行

ダッシュボードの鍵のｱｲｺﾝをクリックすると、Keys and tokensページに飛ぶ

この中から、`Consumer keys`と`Authentication Tokens`を発行する

### 自動ツイートの実装

以下、完成スクリプト

```py
import tweepy
import time
import os

def tweet_post(data_list):
    client = tweepy.Client(
        consumer_key = os.environ['consumer_key'],
        consumer_secret = os.environ['consumer_secret'],
        access_token = os.environ['access_token'],
        access_token_secret = os.environ['access_token_secret']
    )
    for el in data_list:
        name = el['name']
        price = el['price']
        link = el['link']
        text = f'【新着商品】{name} / {price} {link}'
        client.create_tweet(text=text)
        time.sleep(1)
```

```py
client = tweepy.Client(
    consumer_key = os.environ['consumer_key'],
    consumer_secret = os.environ['consumer_secret'],
    access_token = os.environ['access_token'],
    access_token_secret = os.environ['access_token_secret']
)
```

tweepyをimportして、先ほど準備したKeyやTokenを設定。

これらキーはPublicにさらされては行けないものなので、ローカルでお試しするときはベタ書きし、

アップロードする際には上記のように環境変数を用いることで隠す。

```py
client.create_tweet(text=text)
```

textにセットした文言がツイートされるので、好きなように設定。

## AWS Lambda関数の作成

### AWS Management Consoleを開いて、サービスの中からLambdaを見つけ、サービスに移動する。

### 関数の作成

`一から作成`

`基本的な情報`

関数名 : 好きな名前で大丈夫

ランタイム : Pythonを選択

`デフォルトの実行ロールの変更`

デフォルトの実行ロールの変更を開いて、既存のロールを使用するを選択

IAMのタイミングで作成したS3に対するロールを選択し、関数の作成ボタンを押下

## S3からJsonファイルを取得する実装

以下が完成スクリプト

```py
import boto3

# s3の設定
s3 = boto3.client('s3')
bucket_name = os.environ['bucket_name']
file_key='storeinfo.json'

# S3からファイルをダウンロード
response = s3.get_object(Bucket=bucket_name, Key=file_key)
content = response['Body'].read().decode('utf-8')
```

作成したS3バケット名とファイル名をセットしてあげる

## 最終的に出来上がったコード

<Details><Summary>lambda_function.py</Summary>

```py
import json
import boto3
import requests
from bs4 import BeautifulSoup
import tweepy
import time
import os

topPage = 'https://store.colorfulpalette.jp'
storePage = 'https://store.colorfulpalette.jp/collections/rp_cpstore'

def getStoreNewLineup():
    res = requests.get(storePage)
    data = []
    if(res.status_code == 200):
        soup = BeautifulSoup(res.text, 'html.parser')
        # 商品一覧の要素取得
        itemList = soup.find('div', class_='grid grid--uniform')
        # 商品名
        itemNames = itemList.find_all('div', class_='grid-product__title')
        # 値段
        itemPrices = itemList.find_all('div', class_='grid-product__price')
        # 個々商品リンク
        itemLinks = itemList.find_all('a', class_='grid-product__link')
        # リストにまとめる
        for n in range(len(itemNames)):
            data.append({'name': itemNames[n].get_text(),
                         'price': itemPrices[n].get_text().replace('\n', ''),
                         'link': topPage + itemLinks[n].get('href')})
        return data
    
def compare_file(pre, cur):
    diff = []
    pre_list = [item['name'] for item in pre]
    cur_list = [item['name'] for item in cur]
    diff_namelist = list(set(cur_list) - set(pre_list))
    
    for el in diff_namelist:
        for item in cur:
            if(item['name'] == el):
                diff.append(item)
    return diff
    
def tweet_post(data_list):
    client = tweepy.Client(
        consumer_key = os.environ['consumer_key'],
        consumer_secret = os.environ['consumer_secret'],
        access_token = os.environ['access_token'],
        access_token_secret = os.environ['access_token_secret']
    )
    for el in data_list:
        name = el['name']
        price = el['price']
        link = el['link']
        text = f'【新着商品】{name} / {price} {link}'
        client.create_tweet(text=text)
        time.sleep(1)

def lambda_handler(event, context):
    # s3の設定
    s3 = boto3.client('s3')
    bucket_name = os.environ['bucket_name']
    file_key='storeinfo.json'
    
    # S3からファイルをダウンロード
    response = s3.get_object(Bucket=bucket_name, Key=file_key)
    content = response['Body'].read().decode('utf-8')
    
    # ダウンロードしたJSONデータを読み込む
    pre_data = json.loads(content)
    cur_data = getStoreNewLineup()
    
    diff_data = compare_file(pre_data, cur_data)
    
    if(diff_data):
        tweet_post(diff_data)
        s3.put_object(Bucket=bucket_name, key=file_key, Body=json.dumps(cur_data))

```

</Details>

## AWS Lambdaの環境構築およびデプロイ

### PythonライブラリのZip化＆アップロード

Lambda関数でもPythonのライブラリが使用できるように、ローカルで`pip install`したものをアップロードする

```bash
pip install requests -t .
```

上記コマンドを実行することで、今いるディレクトリに対してInstallされるので、

requests, tweepy, beautifulsoup4の3つを一か所にInstallする。

インストールしたものをそのままLambdaにアップロードするには大きすぎるので、Zip化する

zipコマンド使えなければ、以下Pythonファイルを用意して実行すれば大丈夫、中の変数は自身の環境に合わせてください

```py
import zipfile
import os

def create_lambda_package(source_directory, output_filename):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_directory):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_directory)
                zipf.write(file_path, arcname)

# デプロイパッケージを作成
create_lambda_package('modules', 'my_lambda_function.zip')
```

Lambda関数のメインページから`コード`タブを開く、アップロード元というボタンがあると思うので、

そこからZip化したPythonのライブラリをアップロードする

### lambdaハンドラ関数作成

コードタブにあるFileから新規ファイルを作成して、先ほど完成した`lambda_function.py`をこの名前で作成し、Deployボタンを押下してデプロイする

### 環境変数設定

設定のページに環境変数の項目があるので、発行したTwitterAPIのKeyやTokenを設定する

## Amazon EventBridgeの設定

使用を開始するの選択肢の中から、EventBridgeスケジュールを選択

### スケジュールの詳細の指定

`スケジュール名と説明`

スケジュール名 : なんでも

`スケジュールパターン`

今回は定期的なスケジュールの予定なので、そちらを選択

cron式で事項のタイミングを指定する

「指定としては毎日19時に実行」としたいので、Cron式は以下

```
cron(0 19 * * ? *)
```

`フレックスタイムウィンドウ`

なんでも良いが、とりあえず15分とした

これにより19:00-19:15の間で実行されるようになった

### ターゲットの設定

`ターゲット詳細`

テンプレート化されたターゲットを選択状態にし、一覧からLambdaを選択

`Invoke`

作成したLambda関数を選択

### 設定オプション

ここは特に変更する必要はなさそうだったが、

再試行ポリシーはLambda関数の実行回数を増加させて、無料枠を超えてしまう原因になるかと思い、オフにした