# ***transitionのについて***

## **■ 状態遷移**

- **v-enter	enterの開始状態。**  
要素が挿入される前に追加され、要素が挿入された後に削除される。

- **v-enter-active	enterの活性状態。**  
要素が挿入される前に追加され、トランジション/アニメーションが終了すると削除される。

- **v-enter-to	enter の終了状態。**  
要素が挿入された後に追加され、トランジション/アニメーションが終了すると削除される。

- **v-leave	leaveの開始状態。**  
要素の削除が始まる前に追加され、開始直後に削除される。

- **v-leave-active	leaveの活性状態。**  
要素の削除が始まる前に追加され、トランジション/アニメーションが終了すると削除される。

- **v-leave-to	leaveの終了状態。**  
要素の削除が始まった直後に追加され、トランジション/アニメーションが終了すると削除されます。

## **■ イメージ図**
```
              Enter
opacity: 0; ==========> opacity: 1;
    |                       |
  v-enter               v-enter-to
|___________________________________|
                |
          v-enter-active
============================================
              Leave
opacity: 1; ==========> opacity: 0;
    |                       |
  v-leave               v-leave-to
|___________________________________|
                |
          v-leave-active
```

## **■ サンプルコード**

### **フェードインのサンプル**
```css
.fade-in-enter-active,
.fade-in-leave-active {
  transition: all 2s ease;
  opacity: 1;
}
.fade-in-enter,
.fade-in-leave-to {
  opacity: 0;
}
```
### **ModalWindowのサンプル**
```css
.modal-enter-active,
.modal-leave-active {
  transition: opacity 1.39s;
  .message-box {
    transition: opacity .39s, transform .6s
  }
}
.modal-enter, .modal-leave-to {
  opacity: 0;
  .message-box {
    opacity: 0;
    transform: translateY(-39px);
  }
}
```