# useStateについて一つ賢くなった話

### Stateの状態更新方法

useStateで状態の更新をする方法は`直接値`と`関数型アップデート`の2つの方法がある。

### 直接値と関数型アップデートの違いとは

- 直接値

```text
名前の通りset関数を用いて、直接新しい値をセットするだけ
``````

- 関数型アップデート

```text
現在の状態をPreValueとして受け取り、新しい値をセットする関数を使用し値の更新を行うことができる。
``````

この更新方法の違いは特定のシナリオで役立ちます。

### 関数型アップデートが適するケース

1. 複数の非同期イベントが関与する場合

APIの呼び出しなど複数の非同期イベントが状態の更新に関与している場合は関数型アップデートを用いることで最新の状態に基づいて正確に値を更新できる

2. 状態の更新が競合する可能性があるとき

リアルタイム更新などタイミングが競合する可能性があるときにも上記同様関数型にすることで正確に更新可能

3. パフォーマンスの最適化

大量のデータや高頻度の更新が必要なケースでも関数型を用いることで不要なレンダリングをさけ、パフォーマンスを向上させることができる

### 実際にコードを見て確認

疑似APIを2つ作成を同じタイミングで呼び出し、先ほどのAPI呼び出しなどの非同期イベントが複数関与/状態の更新が競合する可能性があるという状態を作りだし、`直接値`と`関数型アップデート`の両パターンでStateを更新し、画面に描画させてみる

```ts
import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

import { SampleApi, sampleApiState } from '@/recoil/services/sampleApi'
import { SampleApi2, sampleApiState2 } from '@/recoil/services/sampleApi2'
import { API_STATUS } from '@/hooks/useApiStatus'

const Home = () => {

  // 直接値用のState
  const [count, setCount] = useState(0)

  // 関数型アップデート用のState
  const [countFunc, setCountFunc] = useState(0)

  // グローバルなState情報(useSelectorと同じ)
  const sample = useRecoilValue(sampleApiState)
  const sample2 = useRecoilValue(sampleApiState2)

  // サンプルAPI(コードは下記に記載してある)
  const { sampleApi, sampleApiFetchState } = SampleApi()
  const { sampleApi2, sampleApiFetchState2 } = SampleApi2()

  useEffect(() => {
    if(sampleApiFetchState === API_STATUS.SUCCESS) {
      // 直接countにAPIレスポンスの数値を足し算して更新
      setCount(count + sample.num)

      // 関数型として前回値にAPIレスポンス数値を足し算して更新する
      setCountFunc(preCount => preCount + sample.num)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[sampleApiFetchState])

  useEffect(() => {
    if(sampleApiFetchState2 === API_STATUS.SUCCESS) {
      setCount(count + sample2.num)
      setCountFunc(preCount => preCount + sample2.num)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleApiFetchState2])

  const callAPI = () => {
    sampleApi(true, 1.5)
    sampleApi2(true, 1.5)
  }

  return (
    <div>
      <button onClick={callAPI}>Call API</button>
      <p>count : {count}</p>
      <p>countFunc : {countFunc}</p>
    </div>
  )
}
export default Home
```

#### sample API

指定時間経過後にグローバルなStateの`num`を10に更新している

recoilはReduxからActionなどを排除して、より簡単に使えるようになったグローバルな状態管理ライブラリ

```ts
import { atom, useRecoilState } from 'recoil'

import { useApiStatus } from '@/hooks/useApiStatus'

type SampleApi = {
  text: string,
  num: number
}

export const sampleApiState = atom<SampleApi>({
  key: 'sample api response',
  default: {
    text: 'sample',
    num: 0
  }
})

export const SampleApi = () => {

  const {
    status: sampleApiFetchState,
    startLoading,
    setSuccess,
    setFailed,
    resetStatus: resetSampleApi
  } = useApiStatus()

  const [sampleState, setSampleState] = useRecoilState(sampleApiState)

  const sampleApi = async (result: boolean, seconds: number) => {

    startLoading()

    setTimeout(() => {
      if(result) {
        setSampleState({
          ...sampleState,
          num: 10
        })
        setSuccess()
      } else {
        setFailed()
      }
    }, seconds * 1000)
  }

  return { sampleApiFetchState, sampleApi, resetSampleApi }
}
```

#### sample API2

先ほどは10をセットしていたが、こちらは20をセットする

<Details><Summary>開いてコードを確認</Summary>

```ts
import { atom, useRecoilState } from 'recoil'

import { useApiStatus } from '@/hooks/useApiStatus'

type SampleApi = {
  text: string,
  num: number
}

export const sampleApiState2 = atom<SampleApi>({
  key: 'sample api2 response',
  default: {
    text: 'sample',
    num: 0
  }
})

export const SampleApi2 = () => {

  const {
    status: sampleApiFetchState2,
    startLoading,
    setSuccess,
    setFailed,
    resetStatus: resetSampleApi
  } = useApiStatus()

  const [sampleState, setSampleState] = useRecoilState(sampleApiState2)

  const sampleApi2 = async (result: boolean, seconds: number) => {

    startLoading()

    setTimeout(() => {
      if(result) {
        setSampleState({
          ...sampleState,
          num: 20
        })
        setSuccess()
      } else {
        setFailed()
      }
    }, seconds * 1000)
  }

  return { sampleApiFetchState2, sampleApi2, resetSampleApi }
}
```
</Details>

### 実行結果

上記コードを実際に実行して確認してみると、直接値で更新をしている方は「20」と表示され、関数型アップデートの方は「30」と表示され結果が変わっているのがわかる

この差分は非同期で行われる状態管理に対して、APIレスポンスが同タイミングで返ってきてしまったため

直接値側の更新は前回値のcountを用いてはいるもののあくまで実施タイミングでのcountのため、useEffectの後勝ちで+20する方の結果が残ってしまった

一方、関数型アップデート側はPreValueを引数にAPIレスポンス結果を加算する関数を渡しているため、
同時に状態の更新が走ったとしても((0 + 10) + 20)という計算を行うことができ、想定の30が出力されている

```text
count : 20

countFunc : 30
```

### 公式ページ

https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state