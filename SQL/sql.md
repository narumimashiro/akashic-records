# ***SQL Library***  

## **データベース構造**

データベースは以下のような構造を取っている(?)
```
id  |  name  |  date  |  unit
1   |"kanade"| "2-10" | "night code"
2   |"mafuyu"| "1-27" | "night code"
3   |"mizuki"| "8-27" | "night code"
4   | "ena"  | "4-30" | "night code"
```
”**`行`**”にあたる部分を”レコード”と呼び、列にあたる部分は”**`カラム`**”と呼ぶ。  

## **クエリとは**
データベースからデータを取得したいときに送信する命令のことをクエリと呼ぶ
SQLはクエリを書くための言語

## **クエリを書いてみる**
上記サンプルテーブルをnightcodeと名付けて例を書く
```sql
SELECT name
FROM nightcode;
```
SELECTは何を取得するかのカラム選択のこと  
FROMはどこのテーブルから取得したいか  
クエリの最後は「;」で〆る  
上のクエリを実行するとkanade,mafuyu,mizuki,enaの名前一覧が取得できる

```sql
SELECT *
FROM nightcode
WHERE unit = 'night code';
```
SELECT *で任意のカラムデータを指定  
WHEREはどこのレコードからデータを取得するかを指定している。  
上記の例だとunitカラムが'night code'であるレコード情報を取得しようとしている。  
nightcodeテーブルは全員ニーゴメンバーなので、テーブルがすべて取得される結果となる。