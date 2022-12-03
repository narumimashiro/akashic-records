# ***Trigger Library***
## **当たり判定に関連する知識まとめ**

### **■ 当たり判定をどうやって実装するか**
・Unity側のPlayerオブジェクトのInspectorでBoxColliderにチェックをつける  
 →これにより当たり判定が行われることになる、チェックがないとすり抜ける  
・加えてIs Triggerのチェックもつける  
 →これにより、すり抜けるようになってしまうが、当たり判定を検出することができるようになる  
・PlayerObjectのTagプロパティに設定追加(今回はPlayerを設定している)
 →オブジェクトの識別ができるようになる
```C#
public class Ground : MonoBehaviour {
  private void OnTrigger(Collider obj) {
    if (obj.gameObject.tag == 'Player') {
      // 処理内容
    }
  }
}
```