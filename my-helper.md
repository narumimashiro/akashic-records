# 稀によく起こるやつの対策メモ

## ssh鍵が効かんくなった

```bash
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
```

### 対策

ssh-agentを起動する

```bash
eval $(ssh-agent -s)
```

鍵の追加をする
```bash
ssh-add ~/.ssh/id_rsa_xxx
```

応答確認
```bash
ssh -T git@github.com
```

これでHi!と呼ばれたらOK

## ssh鍵紐づけの永続化

上記の設定をしても再起動したらリセットされちゃうってとき

問題のリポジトリで

```bash
git remote -v
```
を実行する

そうすると
```bash
origin  git@github.com:your-username/repo-name.git (fetch)
origin  git@github.com:your-username/repo-name.git (push)
```
という感じで表示される

.ssh/フォルダにある`config`ファイルを開いて、扱いたい鍵側のエイリアスを確認し書き換える

```bash
git remote set-url origin git@github-XXXX:your-username/repo-name.git
```