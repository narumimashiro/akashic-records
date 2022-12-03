# ***Dictionary Library***
## **辞書型に関連するメソッドや知識まとめ**

## **■ 辞書型はObjectみたいなもの**
```typescript
dict = {'x': 10, 'y': 20}
```
### **keyやvalueを一覧で取得する**
```typescript
dict.keys() // dict_keys(['x', 'y'])
dict.values() // dict_values([10, 20])
```

### **辞書型は合体だったり中身を取得、削除したりできる**
```typescript
dict2 = {'x': 30, 'z': 100}
// update()で同じKeyは上書き、違うものは挿入
dict.update(dict2) // {'x': 30, 'y': 20, 'z': 100}
// get(key)でValueの取得
dict.get('x') // 30
// pop(key)で要素の削除
dict.pop('x') // 30, dict = {'y': 20, 'z': 100}
```

### **辞書型の中身をチェックしたり**
```typescript
'y' in dict // True
```

## **■ 辞書型もリスト型と同じで参照渡しでコピーするので、値渡しにしたい場合はcopy()を使う**




dict = {'x': 10, 'y': 20}

fot k,v in dict.items()
.items()はリストにしてくれるよう