# REXX（REstructured eXtended eXecutor）

REXXは、IBMメインフレーム環境や他のプラットフォームで使用される柔軟で強力なスクリプト言語です。その名前が示す通り、「REstructured」および「eXtended」の特性に基づいており、多くのプログラミングタスクに対応しています。

## 特徴

- **プラットフォーム非依存性:** REXXはプラットフォームに依存しないため、IBMメインフレーム、UNIX、Windowsなど、さまざまな環境で利用可能です。同じスクリプトを異なる環境で実行できる移植性が高いのが特徴です。

- **柔軟な文法:** REXXの文法はシンプルで読みやすく、条件文、ループ、サブルーチンなど、高度なプログラミング構造をサポートしています。初学者から上級者まで広く使われています。

- **テキスト処理:** REXXはテキスト処理に優れており、文字列の操作や正規表現の使用が容易です。これにより、データの解析や変換などのタスクが効率的に行えます。

- **豊富な組み込み関数:** REXXには様々な組み込み関数が備わっており、日付操作、文字列処理、数学演算など、多岐にわたる処理をサポートしています。

## 使用例1

以下は、REXXの基本的な使用例です。

```rexx
/* 文字列の連結と表示 */
text1 = 'Hello, '
text2 = 'World!'
result = text1 || text2
say result
```

## 使用例2

REXX（REstructured eXtended eXecutor）は、プログラミング言語の一種で、特にIBMメインフレーム上で広く使用されます。以下は、REXXを使用してデータベースからデータを取得し、日付順にソートするサンプルのコードです。この例では、ソートアルゴリズムとしてクイックソートを使用しています

```rexx
/* データベースから取得したデータを格納する配列 */
data = []

/* データベースからデータを取得する関数 */
parse upper arg query_date
call retrieve_data query_date

/* 日付順にソートする関数（クイックソートを使用） */
call quicksort 1 data.0

/* ソートされたデータを表示 */
do i = 1 to data.0
    say data[i]
end

exit

/* データベースからデータを取得するサンプル関数 */
retrieve_data: procedure
    /* ここでデータベースからデータを取得する処理を実装 */

    /* サンプルデータを仮定 */
    data.0 = 5
    data.1 = '2023-01-15'
    data.2 = '2023-03-05'
    data.3 = '2023-02-01'
    data.4 = '2023-04-10'
    data.5 = '2023-02-28'
    return

/* クイックソートの実装 */
quicksort: procedure expose data
    parse arg left right
    if left < right then do
        pivot = data[(left + right) // 2]
        i = left
        j = right
        do while i <= j
            do while data[i] < pivot
                i = i + 1
            end
            do while data[j] > pivot
                j = j - 1
            end
            if i <= j then do
                temp = data[i]
                data[i] = data[j]
                data[j] = temp
                i = i + 1
                j = j - 1
            end
        end
        call quicksort left j
        call quicksort i right
    end
    return

```