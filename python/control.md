# ***Python制御 Library***
## **制御に関連するメソッドや知識まとめ**

## **■ if文制御の基本的な形**
```typescript
if 条件:
    処理内容
elif 条件:
    処理内容
else:
    処理内容
```
### **論理式**
```typescript
==  : 同値だったら
!=  : 同値でなかったら
and : かつ条件(= &&)
or  : or条件(= ||)
```

### **in / not**
```typescript
x = [1, 2, 3]
if x in 2: // xに2があるなら
if x not in 3 // xに3がないなら
```

### **not ? それとも != ?**
```typescript
if not a == b
上記の書き方と
if a != b
だと書き方は同じ内容だが、読みづらいため!=の方を使う
```

### **notはどんなタイミングで使う?**
```typescript
if not boolean のようにTrue/False判定で使ったりする
```
### **Noneについて**
```typescript
他の言語のNULLに当たるものがNoneで存在している

if 変数 is None
if 変数 is not None
Noneの場合は'=='や'!='では判定をせずにis/is notを使う('==='みたいなイメージ)
```

### **while文制御**
```typescript
while count < 5:
    if count == 2:
        break
    print(count)
    count += 1
else:
    // whle文など制御文の中にあるelseは途中でbreakした場合は処理が行われない
    // 例えば今回の場合はcount==2が走りBreakするため、doneは出力されない
    print('done')
```

### **input関数:入力を受け付けるやつ**
okの入力を受け付けたらbreak文が走り無限ループを抜け出す。
```python
while True:
    word = input('Enter')
    if word == 'ok':
        break
    print('next')
```

### **for文を回す方法のアレコレ**
- 配列を回すとき
```python
list = [1, 2, 3, 4, 5]
for i in list:
    print('list item', i)
```
- for文を指定回数回したい！というとき
```python 
// 10回回す
for i in range(10):
    print(i) // 0,1,2,...9
// 2から9まで回す
for i in range(2,10):
    print(i) // 2,3,4,...9
// 2から3つ飛ばしで9までの範囲内で回す
for i in range(2,10,3):
    print(i) // 2,5,8
```

- for文でindexを使用しない場合
```python
for _ in range(10):
```

- listのindexも知りたいとき
```python
for i, v in enumrate(['apple', 'orange', ...]):
    print(i, v) // 0 apple, 1 orange, ...
```

- listはまとめてfor文で回せる
```python
days = ['Mon', 'Tue', 'Wed',...]
fruits = ['Apple', 'Orange', 'Lemon',...]
drinks = ['Coffee', 'Juice', 'Tea',...]

// 以下のように実装もできるが...
for i in rage(len(dats)):
    print(days[i],fruits[i], drinks[i])

// zipを使ってまとめられる
for day, fruit, drink in zip(days, fruits, drinks):
    print(day, fruit, drink)
```

