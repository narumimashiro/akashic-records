import difflib

# 2つのテキストファイルの内容を読み込みます
with open('file1.txt', 'r', encoding='utf-8') as file1, open('file2.txt', 'r', encoding='utf-8') as file2:
    text1 = file1.readlines()
    text2 = file2.readlines()

# テキストの差分を計算します
differ = difflib.Differ()
diff = list(differ.compare(text1, text2))

# 差分を表示し、差分がある場所に色を付けます
for line in diff:
    if line.startswith(' '):  # 一致する行
        print(line.strip())
    elif line.startswith('-'):  # file1にのみ存在する行
        print('\x1b[31m' + line.strip() + '\x1b[0m')  # 赤色で表示
    elif line.startswith('+'):  # file2にのみ存在する行
        print('\x1b[32m' + line.strip() + '\x1b[0m')  # 緑色で表示
