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