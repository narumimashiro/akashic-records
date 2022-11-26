# ***CSS Library***

## **`最強なサイトたち`**
***■ Official References : [MDN Web doc](https://developer.mozilla.org/ja/docs/Web/CSS)***  
***■ デザインアイディア帳 : [動くWebデザイン](https://coco-factory.jp/ugokuweb/)***

## **`CSS / SCSS  / SASSの違い`**
```
CSSを拡張して便利にしたり、メンテナンスがしやすいようにしたものが、SCSSとSASSである。
SCSSとSASSではスタイルの記述を入れ子形式にすることができる。
そのため、波括弧分のStep数が減らせる!! 

SCSSとSASSの違いは書式の違いにあり、SASSは波括弧でスタイルを囲う必要はなくなり、セミコロンで最後を閉じる必要がなくなっている。
SASSはインデントを主としている記法。
```
## **`CSSでは出来ない様々なこと一例`**

1. **`変数の利用`**
```scss
$var-css:red
h1
  color:$var-css
```
2. **`mixin 関数みたいなやつ`**  
&emsp; ※@mixinはSASSでは=で省略可能
```scss
@mixin func($color: #fff, $f-size: normal)
  color: $color
  font-size: $f-size
.cont-btn
  @include func(red, 20px)
```
3. **`inheritance 継承`**
```scss
%css-share
  font-family: "Comic Sans MS"
  color: #fdeeef
.nav-text
  @extend %css-share
  font-size: 1em
```
> **参考サイト : <https://www.fenet.jp/dotnet/column/language/html-css/5245/>**