# ***Python Library***

## ***■ Pythonで " @ ", " ^ ", " : " を使える用にする***
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