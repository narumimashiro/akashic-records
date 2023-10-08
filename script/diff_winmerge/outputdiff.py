import difflib

# 2つのテキストファイルのパス
file1_path = 'file1.txt'
file2_path = 'file2.txt'

# HTMLファイルの出力パス
output_html_path = 'output_diff.html'

# テキストファイルの内容を読み込みます
with open(file1_path, 'r', encoding='utf-8') as file1, open(file2_path, 'r', encoding='utf-8') as file2:
    text1 = file1.readlines()
    text2 = file2.readlines()

# テキストの差分を計算します
differ = difflib.HtmlDiff()
diff_html = differ.make_file(text1, text2)

# HTMLファイルに差分情報を書き込みます
with open(output_html_path, 'w', encoding='utf-8') as html_file:
    html_file.write(diff_html)
