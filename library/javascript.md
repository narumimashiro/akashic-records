# ***JavaScript Library***  

## ***[Array.prototype.fill()](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)***
```javascript
配列の最初から最後の要素まで値を詰める
Array(3).fill(null)のように書くと、配列の全要素をnullで初期化している
Array(9).fill(3,3,9)、引数を3つ持てて「第1引数の値で、配列の第2引数位置から第3引数位置までセットする」
```
## ***[Array.prototype.slice()](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)***
```javascript
配列の一部をコピーすることができる
Array.slice()すべての配列要素を返す
Array.slice(3)3つ目の要素から後ろすべてを返す
Array.slice(3,9)3つ目の要素から8つ目の要素までを返す
　※Array.slice(start,end):startの要素を含むが、end部分は返さず、直前まで返す
```
## ***[Array.prototype.push()](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/push)***
```javascript
配列の末尾に要素を追加することができる、戻り値で要素数を返す
var Array = ['a', 'b']
Array.push('c')
console.log(Array) // Array['a', 'b', 'c']
```
## ***[Array.prototype.concat()](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)***
```javascript
配列の末尾に要素を連結することができる、戻り値は新しい配列
var Array = ['a', 'b']
var newArray = Array.concat['c', 'd']
console.log(Array)    // Array['a', 'b']
console.log(newArray) // newArray['a', 'b', 'c', 'd']
```
## ***[Array.prototype.map()](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/map)***
```javascript
与えられた関数をすべての配列要素に適応して新しい配列を戻り値として返す
var Array = [1, 2, 3]
var newArray = Array.map((x, y) => 処理内容);
xは今処理しようとしている要素
yはそのインデックス
```

