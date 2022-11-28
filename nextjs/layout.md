# ***NextJs Library***  

## ***[Layout](https://nextjs.org/docs/basic-features/layouts)***
```typescript
ヘッダーの実装に関するページ
全ページ同じのは簡単
レイアウトが変わる可能性がある場合の実装は少し頭を使う...
(2022/11/23)時点ではNextJsのリポジトリ実装はdefaultのヘッダーを用意して、個別設定したい場合は各コンポーネントで用意するようにしている
```
***■ 各コンポーネントでの実装方法***
```typescript
import type {ReactElement} from 'react'
page.getLayout = (page: ReactElement) => {
  return <layout>{page}</layout>
}
```
***■ レイアウト側***
```typescript
import {ReactNode} from 'react'
interface props {
  children: ReactNode
}
const layout = ({children}: props) => {
  return <><h1>Hello NextJs</h1>{children}</>
}
export default layout;
```
***■ 描画箇所***
```typescript
export default function App({Component, pageProps}):AppPropsWithLayout {
  if(Component.getLayout) {
    return Components.getLayout(<Components {...pageProps} />)
  }
  return <defaultlayout><Component {...pageProps} /></defaultlayout>
}
```