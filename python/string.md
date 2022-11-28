# ***String Library***
## **文字列に関連するメソッドや知識まとめ**
---

## **■デバッグログに使えそうな便利なPrint**
```python
a = 'a'
print(f'a is {a}')  // a is a
 
x, y, z = 1, 2, 3
print(f'a is {x}, {y}, {z}')  // a is 1, 2, 3
print(f'a is {z}, {y}, {x}')  // a is 3, 2, 1
 
name = 'Ancerise'
family = 'Sacred'
print(f'My name is {name} {family}. In Japan {family} {name}')
// My name is Ancerise Sacred. In Japan Sacred Ancerise
```

## **■ printの出力方法や文字列についていろいろ**
### **空白で繋いでくれる**
```python
print('Hi', 'Python') // Hi Python
```

### **sepで記述したもので、繋いでくれる**
```python
print('Hi', 'Python', sep=',') // Hi,Python
```

### **endで終端を指定できる、下記例だと改行して終わる**
```python
print('Hi', 'Python', sep=',', end='\n') // Hi,Python
```

### **rを先頭につけることで改行コードを認識しないでできるようになる**
```python
print(r'C:\name\name')  // C:\name\name
```

### **改行コードなしで改行できる、見た目通りの出力が可能**
&emsp; **\を入れているのは###とLine1の間に空白が出来てしまうのを消すため**
```python
print(######)
print("""\
Line1
Line2\
""")
```

### **文字の連結**
```python
long_str = ('longlonglonglonglonglong'
            'temptemptemptemptemptemp')
// longlonglonglonglonglongtemptemptemptemptemptemp
```

### **string型は添字指定で見れる**
```python
word = 'python'
print(word[2])   // t
print(word[-1])  // n
print(word[0:2]) // py
print(word[:2])  // py
print(word[4:])  // on
```

### **文字列の一部を変えるときは？**
```python
word = 'python'
wordに対して、word[0] = 't'と添字指定でtythonにすることは"出来ない"
word = 't' + word[1:] こうすることで、tythonに変更可能
```

### **文字列の長さを知る**
```python
word = 'python'
print(len(word)) // 6
```

### **文字列始まりを検査する**
```python
word = 'python is programming lang'
print(word.startswitch('python')) // True
```

### **文字列がどこにあるか検索する**
```python
word = 'Hello World , Hello Python'
print(word.find('Hello')) // 0

// 後ろから検索する
print(word.rfind('Hello')) // 14
```

### **文字列があるか確認**
```python
word = 'Hello World , Hello Python'
print(word.count('Python'))  // 1
```

### **文字列の頭文字だけを大文字にする**
```python
word = 'Hello World , Hello Python'
print(word.capitalize()) // Hello world , hello python
```

### **文字列の単語の頭文字を大文字にしてくれる**
```python
word = 'Hello world , hello python'
print(word.title())  // Hello World , Hello Python
```

### **文字列をすべて大文字にする、小文字にする**
```python
word = 'Hello world , hello python'
print(word.upper())  // HELLO WORLD , HELLO PYTHON
print(word.lower())  // hello world , hello python
```

### **文字列の置換**
```python
word = 'Hello world , hello python'
print(word.replace('python', 'NextJs'))  // Hello world , hello NextJs
```