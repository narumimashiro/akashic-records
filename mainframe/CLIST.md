# CLIST（Command List）

CLISTは、IBMメインフレーム環境で使用されるスクリプト言語であり、主にTSO（Time Sharing Option）環境での対話的な作業やコマンドの自動化に適しています。

## 特徴

- **TSO環境向け:** CLISTは主にTSOセッション内で使用され、TSOコマンドやプロシージャの自動化に焦点が当てられています。対話型の作業をサポートし、ジョブの作成や実行、データセットの操作などが得意です。

- **シンプルな文法:** CLISTの文法は比較的シンプルで、コマンドやプロシージャの呼び出し、制御構造（IF、DOなど）をサポートしています。初学者が簡単に学べるのが特徴です。

- **TSOコマンドの自動化:** CLISTはTSOコマンドの自動化に適しており、ユーザーが頻繁に行う操作を自動化するために使用されます。これにより、繰り返しの作業を効率化できます。

## 使用例

以下は、CLISTの基本的な使用例です。

```cl
/* データセットのリスト表示 */
LISTDS
```

## 使用例2

IMS停止の一般的な手順を示すサンプルのCLIST

```rexx
/* IMS停止用のCLISTのサンプル */

/* IMSコンソールへの接続 */
ADDRESS IMS "CONNECT"

/* IMSの停止 */
ADDRESS IMS "HALDB dbname"
ADDRESS IMS "STOP"

/* IMSコンソールからの切断 */
ADDRESS IMS "DISCONNECT"

EXIT

```