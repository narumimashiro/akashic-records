# ***Movement Library***
## **Object動作に関連する知識まとめ**

### **■ ユーザー操作**

- **水平方向、垂直方向移動**

Input.GetAxis()を用いる。  
引数に入る文字列は決まっていて、UnityのEdit->ProjectSettingで確認できる
```C#
using UnityEngine;
float x = Input.GetAxis("Horizontal");
float y = Input.GetAxis("Vertical");
```

- **Key入力の判定**

```C#
using UnityEngine;
bool pushSpace = Input.GetKey("space");
```

### **■ Objectの操作**
Objectの操作については色々と種類がある  
- **Objectの位置を指定してあげて移動するタイプ**
```C#
// UnityのMonoBehaviourクラスはよく使うものは用意してくれている
// コメントアウトしている方法でも実装できるが、transform.positionで良い
public class PlayerMovement : MonoBehaviour {
  // Transform tf;
  void Start() {
    // tf = GetComponent<Transform>();
  }
  void Update() {
    // tf.position += new Vector3(.1f, 0, 0);
    transform.position += new Vector3(.1f, 0, 0); // これで良い
  }
}
```

- **Objectそのものを移動させるタイプ**
```C#
public class PlayerMovement : MonoBehaviour {
  // Unity側でObjectを選択し、InspectorでAddComponentする必要あり
  Ragidbody rb;
  void Start() {
    rb = GetComponent<Ragidbody>();
  }
  void Update() {
    rb.velocity = new Vector3(.1f, 0, 0);
  }
}
```

- **Objectに力を与えて動かすタイプ**
```C#
public class PlayerMovement : MonoBehaviour {
  // Unity側でObjectを選択し、InspectorでAddComponentする必要あり
  Ragidbody rb;
  void Start() {
    rb = GetComponent<Ragidbody>();
  }
  void Update() {
    rb.AddForce(new Vector3(.1f, 0, 0));
  }
}
```