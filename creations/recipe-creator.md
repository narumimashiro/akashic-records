- [Recipe Creator 創作まとめ](#Recipe-Creator-創作まとめ)
      - [関連技術](#関連技術)
  - [製作物概要](#製作物概要)
  - [制限事項](#制限事項)
  - [製作物](#製作物)
  - [設計概要](#設計概要)
  - [製作過程](#製作過程)
    - [Amazon DynamoDBの準備をする](#Amazon-DynamoDBの準備をする)
    - [IAMでDynamoDBに対するロールの作成](#IAMでDynamoDBに対するロールの作成)
    - [AWS Lambda関数を作成する](#AWS-Lambda関数を作成する)
    - [Amazon API Gateway経由でLambda関数を実行できるように設定する](#Amazon-API-Gateway経由でLambda関数を実行できるように設定する)
    - [NextJsのAPI Routes機能を用いて、API呼び出し](#NextJsのAPI-Routes機能を用いて、API呼び出し)
  - [最後に](#最後に)
    - [補足](#補足)
      - [UNIXタイム](#UNIXタイム)
      - [boto3 DynamoDB](#boto3-DynamoDB)
      - [API Routes](#API-Routes)
      - [OpenAI](#OpenAI)

# Recipe Creator 創作まとめ

#### 関連技術

- NextJs
- TypeScript
- Sass
- Recoil
- Material UI
- Amazon DynamoDB
- Amazon API Gateway
- AWS Lambda
- Python
- IAM
- chatGPT API

## 製作物概要

食材や人数、キーワードをWebページ上で入力し検索すると、chatGPTから一致するレシピを出力してもらえるサービス。

## 制限事項

- スマホ用にデザイン設計していないため、タブレットもしくはPCからアクセス(横画面推奨)
- Vercelでデプロイしたが、無料プランだとリクエストに対するタイムアウトが10秒だったため、公開ページではレシピ生成の動作確認不可
- AWSからのコストリスクに備え、履歴は3つまで

## 製作物

`公開ページ`

<https://recipe-creator-mauve.vercel.app/>

`動作確認の様子`

<https://youtu.be/xJbpM9GCc38>

## 設計概要

1. NextJs+TypeScript+Recoil、デザインはSass+MaterialUIを用いてFrontEndの作成を行う
2. BackEndをPython+AWS Lambdaを用いて実装
    - DynamoDBに検索したレシピを保存
    - DynamoDBから検索履歴を取得
    - 一定数履歴が溜まったら削除する
3. Lambda関数には、NextJsのAPI Routes機能を用いて、Amazon API Gateway経由で実行する
4. chatGPT APIはAPI Routes機能を用いて、直接呼び出す

## 製作過程


### Amazon DynamoDBの準備をする

AWS Management Consoleを開いて、サービスの中からDynamoDBを見つけ、サービスに移動する

テーブルを作成を押下して、新規でテーブルの作成を行う

`テーブル名`

プロジェクトに合わせて好き名前で

`パーティションキー`

テーブルを検索するときに用いるKey。プライマルキーの一部

`ソートキー`

テーブル検索で用いるKeyだが、プライマルキーの第二候補的存在。

以降の設定はすべてデフォルトにした。

### IAMでDynamoDBに対するロールの作成

AWS Management Consoleを開いて、サービスの中からIAMを見つけ、サービスに移動する

IAMのロールページに移動して、ロールの作成ボタンを押下する

`信頼されたエンティティタイプ`

AWSのサービス

`ユースケース`

Lambda

次への押下

`許可ポリシー`

- AWSLambdaDynamoDBExecutionRole

```text
AWSLambdaDynamoDBExecutionRoleAWSは次のような管理ポリシーです。DynamoDB ストリームへのリストアクセス権と読み取りアクセス権、 CloudWatch およびログへの書き込み権限を提供します。
```

- AmazonDynamoDBFullAccess

```text
AmazonDynamoDBFullAccessAWSは次のような管理ポリシーです。を経由して Amazon DynamoDB へのフルアクセスを提供しますAWS Management Console
```

上記の2つを検索して、セットする

次へを押下し、ロール名を分かりやすい好きな名前にしたら作成して完了

### AWS Lambda関数を作成する

DynamoDBとやり取りするClassを作成する

完成したスクリプトは以下

<Details><Summary>manage_database.py</Summary>

```python
# 検索履歴を取得および保存

import datetime
import os
import boto3
from boto3.dynamodb.conditions import Key

class ManageDatabase:
# data
    table_name = os.environ['TABLE_NAME']
    partition_key = os.environ['PARTITION_KEY']
    new_index = 3
    del_index = 1

# method
    def __init__(self):
        pass
      
    def __del__(self):
        pass

    @staticmethod
    def convertUnixTime(unix):
        # unixタイムを現在時間に変換
        date = datetime.datetime.utcfromtimestamp(unix)
        
        # ローカルタイムゾーンに変換
        local_date = date.astimezone()
        
        # 日時を文字列にフォーマット
        formatted_time = local_date.strftime('%Y-%m-%d %H:%M:%S')
        
        return formatted_time
    
    @classmethod
    def getQueryData(cls):
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ['TABLE_NAME'])
        
        # データ取得
        response = table.query(
            KeyConditionExpression=Key(os.environ['PARTITION_KEY']).eq(os.environ['PARTITION_KEY_VALUE'])
        )
        
        # dynamobdの返答
        return response['Items']

    @classmethod
    def convertToJson(cls, data):
        # DynamoDBのデータから必要な部分をピックアップしてJson形式にしていく
        res_data = []
        for item in data:
            index = item['item_index']
            create_date = cls.convertUnixTime(int(item['create_date']))
            context = item['context']
            res_data.append({
                'item_index': index,
                'create_date': create_date,
                'context': context
            })

        return res_data

    @classmethod
    def setQueryData(cls, unix, content):
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ['TABLE_NAME'])

        for i in range(2):
            response = table.get_item(
                Key={
                    'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
                    'item_index': i + 2
                }
            )
            
            # indexを変更のち、新規で作成
            if 'Item' in response:
                item = response['Item']
                item['item_index'] = i + 1
                table.put_item(Item=item)
                
                # 古い項目の削除
                table.delete_item(
                    Key={
                        'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
                        'item_index': i + 2
                    }
                )

        table.put_item(
            Item={
                'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
                'item_index': cls.new_index,
                'create_date': unix,
                'context': content,
            }
        )

    @classmethod
    def deleteQueryData(cls):
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ['TABLE_NAME'])
        table.delete_item(
            Key={
                'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
                'item_index': cls.del_index
            }
        )
```

</Details><br/>

`テーブル構造`

```ts
{
    'recipe_search_history': string,
    'item_index': number,
    'create_date': number,
    'context': string,
}
```

`UNIXタイムの変換`

```python
@staticmethod
def convertUnixTime(unix):
    # unixタイムを現在時間に変換
    date = datetime.datetime.utcfromtimestamp(unix)
    
    # ローカルタイムゾーンに変換
    local_date = date.astimezone()
    
    # 日時を文字列にフォーマット
    formatted_time = local_date.strftime('%Y-%m-%d %H:%M:%S')
    
    return formatted_time
```

chatGPTのレスポンスに生成した時間がUNIXタイムで返答が来るので、

[UNIXタイム](#UNIXタイム)をパッと見でわかる形式に変換する関数を用意した

`履歴を取得する`

```python
@classmethod
def getQueryData(cls):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['TABLE_NAME'])
    
    # データ取得
    response = table.query(
        KeyConditionExpression=Key(os.environ['PARTITION_KEY']).eq(os.environ['PARTITION_KEY_VALUE'])
    )
    
    # dynamobdの返答
    return response['Items']
```

boto3を用いて、DynamoDBを扱う

```py
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])
```

boto3のresourceにDynamoDBを指定、その後Table()に自身の作成したBDのテーブル名を設定することでアクセスができるようになる

```py
response = table.query(
    KeyConditionExpression=Key(os.environ['PARTITION_KEY']).eq(os.environ['PARTITION_KEY_VALUE'])
)
```

その後、パーティションキーを用いて、query関数を用いることで、パーティションキーと一致するデータをすべて取得できる

`履歴をデータベースから削除する`

```py
@classmethod
def deleteQueryData(cls):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['TABLE_NAME'])
    table.delete_item(
        Key={
            'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
            'item_index': cls.del_index
        }
    )
```

今回は仕様として、履歴は3つまでとしてるため、4つ以上になるタイミングで1つ目を削除する必要がある

履歴取得のとき同様にパーティションキーと今回はソートキーにindexを用意しているので、Keyに設定し

該当するテーブル要素を削除した。

`履歴の更新`

```py
@classmethod
def setQueryData(cls, unix, content):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['TABLE_NAME'])
    for i in range(2):
        response = table.get_item(
            Key={
                'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
                'item_index': i + 2
            }
        )
        
        # indexを変更のち、新規で作成
        if 'Item' in response:
            item = response['Item']
            item['item_index'] = i + 1
            table.put_item(Item=item)
            
            # 古い項目の削除
            table.delete_item(
                Key={
                    'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
                    'item_index': i + 2
                }
            )
    table.put_item(
        Item={
            'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
            'item_index': cls.new_index,
            'create_date': unix,
            'context': content,
        }
    )
```

履歴の更新は全体の流れとして、

1. テーブルのデータ取得
2. index2のデータを1に書き換え、保存しなおす
3. 元々の2のデータを削除
4. index3に対して同様の処理を行う
5. クライアント側から届いた新規のレシピ内容をindex3として、登録


- テーブルのデータ取得

```py
response = table.get_item(
    Key={
        'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
        'item_index': i + 2
    }
)
```

- index2のデータを1に書き換え、保存しなおす

```py
if 'Item' in response:
    item = response['Item']
    item['item_index'] = i + 1
    table.put_item(Item=item)
```

- 元々の2のデータを削除

```py
table.delete_item(
    Key={
        'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
        'item_index': i + 2
    }
)
```

- クライアント側から届いた新規のレシピ内容をindex3として、登録

```py
table.put_item(
    Item={
        'recipe_search_history': os.environ['PARTITION_KEY_VALUE'],
        'item_index': cls.new_index,
        'create_date': unix,
        'context': content,
    }
)
```

AWS Lambdaのメイン関数を用意する

完成したスクリプトは以下

<Details><Summary>lambda_function.py</Summary>

```py
from manage_database import ManageDatabase
import time

def lambda_handler(event, context):

    # パラメータの取得
    section = event['queryStringParameters']['param1']

    # 検索履歴を取得
    if(section == 'get_history'):
        # インスタンス生成
        manage_data = ManageDatabase()
        
        # DynamoDBからテーブルデータ取得
        data = manage_data.getQueryData()
    
        res_data = manage_data.convertToJson(data)
    
        return res_data
    
    elif(section == 'set_history'):
        recipe = event['queryStringParameters']['param2']

        # インスタンス生成
        manage_data = ManageDatabase()
        
        # UNIX タイムを取得
        unix_time = int(time.time())
        
        # 一番古いデータを削除
        manage_data.deleteQueryData()
        
        # DynamoDBのテーブルを更新
        manage_data.setQueryData(unix_time, recipe)
        
        return {'message': 'set database success'}
```

</Details><br>

```py
event['queryStringParameters']['param1']
```

APIGateway経由でアクセスする際のURLにパラメータを追加することができるため、そのパラメータを取得する処理

具体的にURLは`https://XXXX?param1=XYZ&param2=ABX`の用な形

詳細はURLパラメータなどで検索していただければと思いますが、簡潔にルールをまとめると

パラメータは「?」から書き始め、区切りは「&」、KeyとValueは「=」で繋ぐです

### Amazon API Gateway経由でLambda関数を実行できるように設定する

AWS Management Consoleを開いて、サービスの中からAPI Gatewayを見つけ、サービスに移動する

APIを作成ボタンを押下する

`APIタイプを選択`

今回はHTTP APIで作成するので、HTTP APIで構築ボタンを押下する

`統合を作成して設定`

統合を追加ボタンを押下して、Lambdaを選択

詳細を入力するUIに切り替わると思うので、作成したLambda関数を選択する

`API名`

テキトーな好きな名前に設定

次へを押下する

`ルートを設定`

メソッドやリソースパスなどを決めて次へを押下する

`ステージを設定`

今回はすべてデフォルトにした

次へを押すと確認画面が出てくるので、内容を確認し作成を押下する

### NextJsのAPI Routes機能を用いて、API呼び出し

NextJsのAPI Routesとは

`/pages/api`ディレクトリに配置したソースファイルを`/api/XXX`の形だけで呼び出せるようになる

すなわち、呼び出し箇所から丁寧にパスを引く必要なく呼び出せるということを抑えていただければ大丈夫です

`履歴取得`

<Details><Summary>履歴ボタンのコンポーネント内処理</Summary>

```ts
const [recipeHistory, setRecipeHistory] = useState<RecipeHistory[]>()
const [isModalOpen, setModalOpen] = useState(false)

const getHistory = async () => {
  const params = {
    section: 'get_history'
  }
  await axios.post('/api/get_history', {...params})
    .then(res => {
      setRecipeHistory(res.data)
    })
    .catch(err => {
      console.error('Failed fetch data', err)
    })
  setModalOpen(true)
}
```

</Details><br>

バックエンドPythonのコードのメイン部分を見ていただくと、パラメータを取得して処理分けしていたかと思います

ここでは履歴取得の処理を行うため、

```ts
const params = {
  section: 'get_history'
}
```

を用意し、リクエスト時にパラメータを送っている

そして、レスポンスが正常に返ってきた際に

```ts
setRecipeHistory(res.data)
```

コンポーネント内で状態管理ができるuseStateを用いて、レスポンスデータを保持している

<Details><Summary>pages/api/get_history.ts</Summary>

```ts
/**
 * DynamoDBとのやりとり
 * Recipe履歴取得 
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {

  const apiGateway = process.env.API_GATEWAY
  const { section } = req.body

  const api_url = apiGateway + `?param1=${section}`

  if (apiGateway) {
    try {
      const response = await axios.get(api_url)
      const resData = response.data
      res.status(200).json(resData)
    }
    catch (err) {
      console.error(err)
      res.status(500).json({'message': 'API Axios error'})
    }
  } else {
    res.status(400).json({ error: 'API_GATEWAY not defined' })
  }
}
export default handler
```

</Details><br>

```ts
const apiGateway = process.env.API_GATEWAY
const { section } = req.body
const api_url = apiGateway + `?param1=${section}`
```

上から、環境変数からAPI GatewayのURLを取得している処理

コンポーネント側からリクエストをパラメータ付きで送っていたかと思いますが、そちらを取得

上記2つの情報をもとに先述したURLパラメータルールのもと、呼び出しURLを作成

作成したURLにリクエストを飛ばすと、API Gatewayで設定したLambda関数が呼ばれ、処理が実行

今回の場合は履歴取得の処理が走り、データが返却されてくるので、成功を意味するステータスコード200でクライアント側にレスポンスする

`chatGPT API利用および履歴保存`

<Details><Summary>レシピ検索ボタンコンポーネント内処理</Summary>

```ts
const ingredients = useRecoilValue(IngredientsList)
const servings = useRecoilValue(Servings)
const inputKeyword = useRecoilValue(InputKeyword)
const keyList = useRecoilValue(KeyList)
const [_, setRecipe] = useRecoilState(Recipe)

const searchRecipe = async () => {
  setRecipe('')
  const prompt = createPrompt(
    {
      ingredients: ingredients,
      servings: servings,
      inputkeyword: inputKeyword,
      keylist: keyList
    }
  )
  const params = {
    prompt: prompt
  }
  await axios.post('/api/send_prompt', {...params})
    .then(async res => {
      setRecipe(res.data)
      const params = {
        section: 'set_history',
        recipe: converterNewLine(res.data)
      }
      await axios.post('/api/set_history', { ...params })
        .then(res => {
          console.log(res.data) // for debug
        })
        .catch(err => {
          console.error('Failed fetch', err)
      })
    })
    .catch(err => {
      console.error('Failed fetch', err)
      setRecipe(err.response.data)
    })
}
```

</Details><br>

```ts
const ingredients = useRecoilValue(IngredientsList)
const servings = useRecoilValue(Servings)
const inputKeyword = useRecoilValue(InputKeyword)
const keyList = useRecoilValue(KeyList)
```

これらはユーザーに入力された食材や人数、キーワードなどを定義している

Recoilという状態管理ライブラリが存在しており、先ほど状態管理としてチラっと登場したuseStateは

コンポーネント内だけのローカルなものだが、recoilはグローバルな状態管理が行え、アプリケーション全体で状態管理ができるものです

Reactはコンポーネント指向なのもあり、食材や人数、キーワードなどは別のコンポーネントで実装してあるため

useRecoilValueやuseRecoilStateを用いて、状態のやり取りをしています

```ts
const prompt = createPrompt(
  {
    ingredients: ingredients,
    servings: servings,
    inputkeyword: inputKeyword,
    keylist: keyList
  }
)
```

chatGPTに投げる入力文を生成している処理になります

以降の処理は履歴取得とほぼ同じなので、割愛します

<Details><Summary>pagegs/api/send_prompt.ts</Summary>

```ts
/**
 * chatGPT APIにプロンプトの送信
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {

  const { prompt } = req.body

  // chatGPTAPI利用のコスト肥大化を抑えるため環境変数で管理している
  if (process.env.PROD_ENV == process.env.CONST_API_STOP) {
    res.status(200).json('Sorry, u cannot use this service now')
  }

  const apiKey = process.env.OPENAI_APIKEY

  if (!apiKey) {
    res.status(500).json('API key not configured')
  } else {
    const openai = new OpenAI({ apiKey: apiKey })
    try {
      const response = await openai.chat.completions.create({
        messages: [{ "role": "user", "content": prompt }],
        model: "gpt-3.5-turbo",
      })
      res.status(200).json(response.choices[0].message.content)
    }
    catch(err) {
      res.status(500).json('cannot response chatGPT : ' + err)
    }
  }
}
export default handler
```

</Details><br>

```ts
const apiKey = process.env.OPENAI_APIKEY
const openai = new OpenAI({ apiKey: apiKey })
```

OpenAIの公式ページからAPI KEYを発行する

このキーは他人にバレてはいけないもののため、環境変数に設定して管理する

取得したAPIKEYをOpenAIに設定して、chatGPTを呼び出せるようにする

```ts
const response = await openai.chat.completions.create({
  messages: [{ "role": "user", "content": prompt }],
  model: "gpt-3.5-turbo",
})
```

modelをgpt3.5turboとして、プロンプトを送信


```ts
res.status(200).json(response.choices[0].message.content)
```

以下のような構成でレスポンスが返ってくるので、contentの部分をステータスコード200でレスポンスしてあげる

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo-0613",
  "system_fingerprint": "fp_44709d6fcb",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "\n\nHello there, how may I assist you today?",
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}

```

<Details><Summary>pages/api/set_history.ts</Summary>

```ts
/**
 * DynamoDBとのやりとり
 * Recipe履歴保存
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {

  const apiGateway = process.env.API_GATEWAY
  const { section, recipe } = req.body

  const api_url = apiGateway + `?param1=${section}` + `&param2=${recipe}`

  if (apiGateway) {
    try {
      const response = await axios.get(api_url)
      const resData = response.data
      res.status(200).json(resData)
    }
    catch (err) {
      console.error(err)
      res.status(500).json({'message': 'API Axios error'})
    }
  } else {
    res.status(400).json({ error: 'API_GATEWAY not defined' })
  }

}
export default handler
```

</Details><br>

履歴取得とほぼ同じなので、割愛

## 最後に

以上で、chatGPT APIを用いたWebサービス製作の流れになります

公式ドキュメントなどのURLを以下に記載してあるので、より深く知りたい方は参照ください

### 補足

#### UNIXタイム

UNIXタイムは、コンピューターシステムで時刻を表現するための一般的な方法の一つ

UNIXタイムは、1970年1月1日 00:00:00 UTC（協定世界時）からの経過時間を秒単位で表現します

#### boto3 DynamoDB

[公式ドキュメント](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/dynamodb.html)

#### API Routes

[公式ドキュメント](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

#### OpenAI

[公式Top](https://platform.openai.com/docs/overview)

[API Key発行ページ](https://platform.openai.com/api-keys)