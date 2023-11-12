- [OpenAI Function Calling](#OpenAI-Function-Calling)
  - [Function Callingとは](#Function-Callingとは)
  - [具体的な使用イメージ](#具体的な使用イメージ)
  - [実際に使っている様子](#実際に使っている様子)
    - [モデルの呼び出し](#モデルの呼び出し)
    - [モデルからの応答](#モデルからの応答)
    - [応答を使用して、API呼び出し](#応答を使用して、API呼び出し)
    - [応答を元にAPI呼び出しを行った返答](#応答を元にAPI呼び出しを行った返答)
    - [API応答をモデルに送り返す](#API応答をモデルに送り返す)
    - [要約した結果](#要約した結果)
  - [最後に](#最後に)

# OpenAI Function Calling

## Function Callingとは

ユーザーが入力したプロンプトに応じて、特定の関数を呼び出すことができる機能です。

## 具体的な使用イメージ

User：「今日の予定を教えて」

GPT ：（Googleカレンダーを開き、今日の予定を表示）

User:「XX時からのMTGがブッキングしているみたいだから、〇〇さんに時間をずらせないか聞いておいて」

GPT ：（Gmailを開いて、〇〇さん宛先に予定調整を依頼するメールを作成、送信する）

Function Callingを使いこなすことで、上記のようなことが行えます。

ノーコードが流行り、仕事が奪われるのではないかといったことが何年か前に起きたかと思いますが、

ことchatGPTにおいては、すでに`人間の仕事を代行している`といっても過言ではないのではないかと思いました。

## 実際に使っている様子

OpenAIの公式ページに記載あった例を取り上げて、実際にFunction callingを使っている様子を見て行こうと思います

### モデルの呼び出し

chatGPTをすぐ用意できる方は「東京の今の天気を教えて」と入力してみてください。

そうするとchatGPTから以下のようにリアルタイム情報に関する返答はできないと返されるかと思います。

```text
申し訳ありませんが、私はリアルタイムの情報にアクセスできないため、現在の東京の天気を提供することはできません。天気情報を知りたい場合は、信頼性のある天気予報サイトやアプリ、または地元のニュースソースをチェックすることをお勧めします。
```

Function callingは先述した通り、プロンプトに応じた関数呼び出しを可能にするものなので、

User：「ボストンの今の天気は？」と打ち込みたいとします

Function callingを利用したAPI呼び出しコマンドは以下です

```bash
curl https://api.openai.com/v1/chat/completions -u :$OPENAI_API_KEY -H 'Content-Type: application/json' -d '{
  "model": "gpt-3.5-turbo-0613",
  "messages": [
    {"role": "user", "content": "What is the weather like in Boston?"}
  ],
  "functions": [
    {
      "name": "get_current_weather",
      "description": "Get the current weather in a given location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA"
          },
          "unit": {
            "type": "string",
            "enum": ["celsius", "fahrenheit"]
          }
        },
        "required": ["location"]
      }
    }
  ]
}'
```

```text
https://api.openai.com/v1/chat/completions
```

この部分はAPIエンドポイントです

そのあとに記述されているJsonファイルのうち

- messages

プロンプトの内容です。roleをUser、contentにボストンの天気は？と記述があるのがわかるかと思います

- functions

ここがFunction callingの肝です。

繰り返しますが、Function callingは、プロンプトに応じた関数呼び出しを可能にするものです

functionsはその関数呼び出しの対象になるかどうかの判定に必要な
定義を記述している部分になります。

今回のfunctionsの定義には

指定された場所に対する最新の天気情報を入手すると説明書きがあり、場所を要求すると定義されています

これらの定義をもとにGPTはUserからのプロンプトを読み取り、関数の呼び出しが必要かどうかを判断します

ですので、仮にUserのメッセージが「美味しいラーメン屋さんを教えて」などまったく関係ないプロンプトを入力された場合、

functionsの定義より、該当しないと判断し、GPTは通常の返答を行います（美味しいラーメン屋さんを提示してくる）

### モデルからの応答

リクエスト送信し、Function callingに該当した際のリクエストが以下です

```json
{
  "id": "chatcmpl-123",
  ...
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": null,
      "function_call": {
        "name": "get_current_weather",
        "arguments": "{ \"location\": \"Boston, MA\"}"
      }
    },
    "finish_reason": "function_call"
  }]
}
```

- function_call

Function callingが返答として含まれ、ロケーションもしっかりとBostonがピックアップできているのが分かるかと思います

### 応答を使用して、API呼び出し

応答を使用して、次の処理を行います。

ここでの例は以下のようにAPI呼び出しをしています

```bash
curl https://weatherapi.com/...
```

ここのフェーズに関しては、開発者に依存するもので、

function_callのnameにある`get_current_weather`これが次に呼び出される処理なので

例えば今回はcurlコマンドでしたが、Pythonでモデル呼び出し実装を行い、

```py
def get_current_weather():
    return 天気予報サイトをスクレイピングして最新の天気予報を取得
```

get_current_weather()では、スクレイピングして情報を入手し、レスポンスする

といったことも可能です

### 応答を元にAPI呼び出しを行った返答

```json
{ "temperature": 22, "unit": "celsius", "description": "Sunny" }
```

APIの処理によって、上記のJsonが返ってきました

### API応答をモデルに送り返す

```bash
curl https://api.openai.com/v1/chat/completions -u :$OPENAI_API_KEY -H 'Content-Type: application/json' -d '{
  "model": "gpt-3.5-turbo-0613",
  "messages": [
    {"role": "user", "content": "What is the weather like in Boston?"},
    {"role": "assistant", "content": null, "function_call": {"name": "get_current_weather", "arguments": "{ \"location\": \"Boston, MA\"}"}},
    {"role": "function", "name": "get_current_weather", "content": "{\"temperature\": "22", \"unit\": \"celsius\", \"description\": \"Sunny\"}"}
  ],
  "functions": [
    {
      "name": "get_current_weather",
      "description": "Get the current weather in a given location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA"
          },
          "unit": {
            "type": "string",
            "enum": ["celsius", "fahrenheit"]
          }
        },
        "required": ["location"]
      }
    }
  ]
}'
```

ここで行っているのは今までのやり取りを要約してもらっています

- messages

roleにUserやAssistantなど様々出てきていますが、見たらわかるように今までのやり取りが記述されています

```text
User:「今のボストンの天気は？」

Assistant：Function callingによって、get_current_weatherが呼び出します。場所はボストンです

function：気温は22度で晴れですという内容が返ってきました

functions：こういった定義によって呼び出されています
```

ざっくりこんな感じのことがモデルに送り返されています

### 要約した結果

```json
{
  "id": "chatcmpl-123",
  ...
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "The weather in Boston is currently sunny with a temperature of 22 degrees Celsius.",
    },
    "finish_reason": "stop"
  }]
}
```

上記Jsonが返されます

最終的にUserにはGPTからの返答として、messageの内容である

「現在のボストンの天気は晴れで、気温は22度です」が与えられています

以上がFunction callingの実際の利用例になります

## 最後に

個人的にchatGPTは欠かせない存在になってきました。

もうGoogleでの検索は基本的には行っていないです。

公式ドキュメントを読みに行くくらいです。

また先日のOpenAI Dev DayにてGPTsというものが発表されました

簡単に言うと、既存のchatGPTに加えて、独自のドメインを追加させられるGPTです

GPT4ユーザーでないと扱えないものですが、データの読み込みが可能になっているので

現在進行形で作成しているソースコードをすべてインプットさせて、最強の相棒として

開発のお手伝いをしてもらおうかなと思ったりしています