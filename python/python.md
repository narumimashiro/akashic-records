# ***Python Library***

## **■ PythonAutoGUIで " @ ", " ^ ", " : " を使える用にする**
**> 修正ファイル : `C:\Python310\Lib\site-packages\pyautogui\_pyautogui_win.py`**
<br>

&emsp; *`// 修正前`*
```python
needsShift = pyautogui.isShiftCharacter(key)
```
&emsp; *`// 修正後`*
```python
needsShift = pyautogui.isShiftCharacter(key)
if key == '@': needsShift = False
if key == '^': needsShift = False
if key == ':': needsShift = False
```

## **■ Pythonのprintについて豆知識**
### **変数の型を知ることができる**
```python
type(XXX)のように記述する
print(num, type(num)) // 1 <class 'int'>
print(lang, type(lang)) // Python <class 'str'>
print(is_ok, type(is_ok)) // True <class 'bool'>
```

## **■ Pythonの計算いろいろ**
```python
17 / 3 
>> 5.66666666667

17 // 3
>> 5

5 * 5 * 5
>> 125

5 ** 3
>> 125
```
