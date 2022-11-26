# ***NextJs Library***  

## ***[Router](https://nextjs.org/docs/api-reference/next/router)***
```
Reactだとページ遷移をするためのRouterはDOMを用意して行わないといけなかったが、NextJsはpagesディレクトリに配置することでPagesからのPathがそのままURLになる。凄く便利!!
```

## ***[Link](https://nextjs.org/docs/api-reference/next/link)***
```javascript
Linkをimportして、pathを指定してあげることで呼び出せる
import Link from 'next/link' ...
<Link href="/">ルートディレクトリに移動</Link>
```

### **Linkタグとaタグの違いは？**
```
リロードが入るか入らないかの違いがある。
なので、基本的にはLinkタグを用いる。
```

### ***ちなみに...***
```javascript
<Link href="/"><a>to Home</a></Link>
のようにaタグを入れても良い、SEOの観点ではaタグを挿入した方が良い
```