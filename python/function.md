# ***Function Library***
## **関数に関連する知識まとめ**

### 関数内容の説明文記述について
```python
def func(param1, param2):
    """Example Function

    Args:
        param1 (int) : ~~
        param2 (str) : ~~
    
    Returns:
        bool : 
    """

print(func.__doc__) // でdocumentが見れる

Python以外の言語は関数の上などに記述するかと思うが、Pythonは中に書く
```

### **引数はdefault値を設定できる**
```python
def order(entree, drink, dessert):
def order(entree='', drink='', dessert=''): // 空白がdefault
    print('entree is ', entree)
    print('drink is ', drink)
    print('dessert is ', dessert)

order(entree=beef, dessert='ice', drink='coffee')
```
### **参照渡しの変数はdefaultにすべきでない**
```python
def test(x,li=[]):
    li.append(x)
    return li

r = test(100)
print(r) // [100]
r = test(200)
print(r) // [100,200] // リスト型は参照渡しなので、前回の100が残ってしまっている
```

### **参照渡しをdefault引数に使いたい場合は**
Noneを使って、if文条件でやることを変える
```python
def test(x, li=None)
    if li is None:
        li = []
    li.append(x)
    return li
```

### **引数がたくさんあるときの便利なやり方**
大量の引数があるときに関数定義にいちいち記述するのが大変
写し間違えでバグにつながる
```python
def many(x,y,z,a,b,c):
は
def many(*args): // *args = (x,y,z,a,b,c)
で書ける
def many(x, *args):
上記のように書くとxのみ変数で取って、以降はtuple型で受け取ってくれる
```

### **オブジェクトもスプレッド構文ぽく受け取ったりできる**
```python
関数内では**kwargsで再度パッキングして辞書型にし、.items()でリスト化して出力している
def menu(**kwargs): // 
    if k, v in kwargs.items() // kwargs = (['x':'X'], ['y': 'Y'],...)
        print(k, v)

dict = {
  'x': 'X',
  'y': 'Y',
  'z': 'Z'
}

menu(**dict) **でdictを開いて x='X', y='Y', z='Z'を引数で渡している感じ
```

### インナー関数(ラムダ式みたいな感じ?)
関数内の中でしか使わない関数については中に書いてしまって良い
```python
def ...:
    def ...:
```

### **クロージャ―とは**
```python
def outer(a, b)
    def inner():
        return a + b
    return inner

f = outer(1,2)
// outerの戻りが関数オブジェクトなので、ここでようやく発火する
r = f() // 3

※具体的な使いどころ
def calc_circle_area(pi):
    def circle_area(radius):
        radius * radius * pi
    return circle_area

ca1 = calc_circle_area(3.14)
ca2 = calc_circle_area(3.1415926)
```

### **デコレーターとは**
処理の前後に何かしたいときに使う  
```python
def print_info(func):
    def wrapper(*args, **kwargs):
        print('start')
        result = func(*args, **kwargs)
        print('end')
        return result
    return wrapper

def add_num(a,b):
    return a + b

f = print_info(add_num)
r = f(1,2) // start end 3
```

### **デコレーター実際の使い方**
```python
@print_info
def add_num(a,b):
    return a + b

r = add_num(1,2)
```

### **lamdaで1行で処理を書く**
```python
cpt = lamda word: word.capitalize()
print(cpt("hello")) // Hello
```

### **ジェネレーターとは**
yieldを境に少しずつ実行していく  
重い処理があったりするが、それを一気に行うのではなく、小出しで少しずつ進めていきたいとき
```python
def greeting():
    yield 'good morning'
    yield 'good afternoon'
    yield 'good night'

g = greeting()

print(next(g)) // good morning
print(next(g)) // good afternoon
print(next(g)) // good night
```

### **リスト内包表記**
リストのみではなく、辞書型や集合型もできる
```python
t = (1,2,3,4)
r = []
for i in t
    // tuple型の中身をリストに詰めていく処理は...
    r.append(i)

r = [i for i in t] // for文でなく、左記のように書ける

// 条件もつけられる
r = [i for i in t if i % 2 == 0]

// for文を2重に内包させたりも可能だが、可読性が落ちるので原則1つのみ(条件と合わせて2個くらいまで)

k = [] y = []
d = {x: y for x, y in zip(k,v)}

s = {i for i in range(10) if i % 2 == 0}
```

### **try catch**
```python
l = [1,2,3]
i = 5

try:
    l[i]
// エラーがおきたらexceptの方に行く
except:
    print('error')

// 何のエラーだったら検出するかの指定もできる
// reasonでエラー内容を出力できる
except IndexError as reason
    print('error', .format(reason))
```
