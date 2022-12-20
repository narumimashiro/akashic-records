# **非同期処理 Promise async/await**

## **非同期処理の歴史**

- 初期非同期処理
- Promiseの誕生
- async/await

## **初期非同期処理**

非同期処理と言ったら’Promise’や’aync/await’を思い浮かべるが、それらは「ES2015(ES6)」で追加された機能であり、2015年以前は非同期処理はコールバック関数で実現していた。

例) setTimeout()
```ts
setTimeout(() => console.log('First'), 1000)
console.log('Second')

// 出力結果
Second
First
```

しかしバックグラウンド処理が増えるとソースコードの記述がとても複雑になっていき、「**コールバック地獄**」と呼ばれることとなった。

例)コールバック地獄
```ts
type Callback<T> = (result: T) => void

const Api1 = (callback: Callback<number>) => {
  setTimeout(() => {
    callback(1)
  }, 1000)
}

const Api2 = (result: number, callback: Callback<number>) => {
  setTimeout(() => {
    callback(result + 1)
  }, 1000)
}

const Api3 = (result: number, callback: Callback<number>) => {
  setTimeout(() => {
    callback(result + 2)
  }, 1000)
}

// ネストし過ぎていてわかりづらい...
Api1((result1) => {
  Api2(result1, (result2) => {
    Api3(result2, (result3) => {
      console.log(result3) // 4
    })
  })
})
```

## **Promiseの誕生**

「ES2015(ES6)」で追加された非同期処理を扱うオブジェクト。  
Promiseオブジェクトを返し、resolveやrejectを実行する。

例) Promise
```ts
new Promise((resolve, reject) => {
  try {
    fs.readFile('promise.md', (err, data) => resolve(data))
  } catch (err) {
    reject(err)
  }
})
```

resolveやrejectすると次の処理に行ける。
次の処理に行くには「.then」で処理を書いていく。

これによりネストして読みづらくなっていたコールバック地獄を抜け出すことになった。

コールバック地獄のときに例にあげた処理をPromiseを使ってリメイクしてみる。

```ts
const ApiPromise1 = (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  })
}

const ApiPromise2 = (result: number): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result + 1)
    }, 1000)
  })
}

const ApiPromise3 = (result: number): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result + 2)
    }, 1000)
  })
}

ApiPromise1()
.then((result)=> {
  return ApiPromise2(result)
})
.then((result) => {
  return ApiPromise3(result)
})
.then((result) => {
  console.log(result) // 4
})
```

## **async/await**

Promiseを使った書き方よりももっと簡単に記述することを可能にしたのが、async/awaitである。

### **asyncとは**

非同期関数を定義する関数宣言のこと。
書き方は以下の通り
```ts
async function asyncFunc() {} // function式
const asycnFunc = async() => {} // アロー関数
```
async functionにすることでどう変わるのか...
- 関数を呼び出すとPromiseオブジェクトを返す。
- 処理を行い、値をreturnした場合、Promiseは戻り値をresolveする。
- 処理を行い、例外や値をthrowした場合、Promiseはその値をrejectする。

### **awaitとは**

awaitとは、指定した関数のPromise結果が返されるまでasync functionの処理を一時停止する。

役割の通り、asyncを一時停止するので、awaitはasyncとセットでないと利用できない。

asyncとawaitのことがわかったところで、Promiseを使った具体例をasync/awaitを使った処理にリメイクする。

```ts
const main = async () => {
  const result1 = await ApiPromise1()
  const result2 = await ApiPromise2(result1)
  const result3 = await ApiPromise3(result2)
  console.log(result3) // 4
}

main()
```

Promiseでの実装でも比較的見やすくはなっていたが、上記例を見たらわかるように、async/awaitを使うと同期処理のような記述方式になっておて、見慣れた姿ではないでしょうか