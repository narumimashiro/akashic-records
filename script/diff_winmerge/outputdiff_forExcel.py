import difflib
import xlsxwriter

# 比較する2つのテキストファイルのパスを指定
file1_path = "file1.txt"
file2_path = "file2.txt"
excel_file_path = "差分エクセルファイルのパス.xlsx"

# テキストファイルの内容を読み込む
with open(file1_path, "r", encoding="utf-8") as file1:
    file1_content = file1.read()

with open(file2_path, "r", encoding="utf-8") as file2:
    file2_content = file2.read()

# テキストファイルの差分を計算
differ = difflib.Differ()
diff = list(differ.compare(file1_content, file2_content))

# 新しいExcelワークブックを作成
workbook = xlsxwriter.Workbook(excel_file_path)
worksheet = workbook.add_worksheet()

# 色を定義
format_added = workbook.add_format({'bg_color': 'green'})
format_deleted = workbook.add_format({'bg_color': 'red'})
format_modified = workbook.add_format({'bg_color': 'yellow'})

# テキストファイルの内容を横に並べてExcelに書き込む
max_len = max(len(file1_content), len(file2_content))

for i in range(max_len):
    if i < len(file1_content):
        worksheet.write(0, i, file1_content[i], format_added if diff[i] == '+' else None)
    if i < len(file2_content):
        worksheet.write(1, i, file2_content[i], format_deleted if diff[i] == '-' else None)

# Excelファイルを保存
workbook.close()

print("2つのテキストファイルの内容を横に並べて、差分を色付けしてExcelファイルに出力しました。")
