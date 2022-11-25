# jQueryとは
**参考 : <https://www.sejuku.net/blog/6436>**

## ■ jQueryとは
```
jQueryとはプログラム言語であるJavaScriptを基に作成されたWebサイト製作に便利なツール。
JavaScriptのライブラリである。
```
## ■ 3つの特徴
```
1.HTMLやCSSを簡単に操作できる。
2.どんなブラウザでも使用できる。
3.プラグインで拡張できる。
```
### 1.HTMLやCSSを簡単に操作できる。
```
スクロールをすると画像がフェードインして来たり、カーソルを当てると説明が浮かんでくる。といったアニメーションが簡単に製作可能
```
### 2.どんなブラウザでも使用できる。
```
Edge,InternetExplore,Google Chrome,Safari,Firefox、ブラウザに合わせて動きを変えて対応してくれる。
```
### 3.プラグインで拡張できる。
```
jQuery UIでダイアログ、ウィジェット、アニメーションが簡単に作れる。
```
## ■ jQueryとJavaScriptの違い
```
1.プログラムの書き方。
2.クロスブラウザ対応。
3.実行速度の違い。
```
### 1.プログラムの書き方。
```
JavaScriptは書き方が複数ある。一方jQueryは
HTMLの要素と実行したい処理 " $('セレクタ').メソッド(引数); "と統一されている。
```
### 2.クロスブラウザ対応。
```
JavaScriptはブラウザによって動きが変わるため、動作確認をする必要がある。
jQueryは複数ブラウザに対して動作保証があらかじめされているため、気にせずコーディングが可能。
```
### 3.実行速度の違い。
```
jQueryは複数ブラウザ対応やコードの書きやすさ重視のため、実行速度が"やや遅い"ので、速度重視のサイトには不向きである。
```






## ■ jQueryの使用方法
### 1.ダウンロードする。
```
公式サイトからダウンロード
https://jquery.com/download/
```
### 2.CDNを使用する。
```
//jQueryのCDN
<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
 
//GoogleのCDN
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min."></script>
 
//MicrosoftのCDN
<script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.5.0.min.js"></script>
```