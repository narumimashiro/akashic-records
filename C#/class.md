# ***Class Library***
## **C#クラスに関連する知識まとめ**

### プロパティ
クラスの持つメンバ変数はpublicにしてはいけないのが原則
```C#
public class Player
{
  string name;
  int HP;
  int MP;
  int ATK;

  // プロパティ
  public string Name {
    get { return this.name; }
    set { this.name = value; }
  }
}
```