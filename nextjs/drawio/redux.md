# **Redux Library**

## **Reduxとは**

ReduxとはUIの状態(state)を管理するための状態管理ライブラリ。  
FaceBook社が提唱しているFluxというデータフロー管理のためのアーキテクチャパターンを採用しています。

Webアプリは、アプリケーション全体にまたがってデータやオブジェクトを保存したり、共有したりする必要があります。  
状態管理ライブラリがない場合、親コンポーネントから子コンポーネントにPropsの形で受け渡すが、規模が大きくなったり、階層の違うコンポーネントに対して渡すときには慎重に行わないと行けず、不具合の原因になりうる。

そんな不安定で管理が複雑な状態を改善することができるのが、Reduxとなります。  
Reduxにはこれから紹介する、「3つのコンセプト」と「4つの要素」によって実現しています。

## **3つのコンセプト**

1. 信頼できる唯一の情報源であること。

Reduxではアプリケーションの状態をStateと呼ばれるオブジェクトツリーで管理しており、Storeがそれを保持しています。  
後ほど具体例を記述するが、Stateはオブジェクトを宣言するのと同じように宣言的で可視化されているので、どのようなデータを管理しているのかが簡単に把握できます。

2. Read Only読み取り専用であること。

Stateに直接アクセスをして値を書き換えることは基本的には許可されていなく、値を書き換えるためにはActionと呼ばれるオブジェクトを発行しなくてはいけません。そのような一元化した仕組みにすることで意図しないタイミングでの値の書き換わりなどを防ぎ、不具合が起きる可能性を低めています。

3. 状態の管理は純粋関数で行われること。

Reducerという純粋関数でStateの変更を行っています。  
先ほどちらっと出てきたActionというオブジェクトとStoreで保持されているStateを用いて、新しいStateを生成します。


# **Modalウィンドウ用Redux**

警告ウィンドウなどユーザーに操作を促すために使われるModalウィンドウですが、今回はこのModalウィンドウの実装をコンポーネントで用意し、それを必要なページにimportし、データをPropsの形で渡して実現するのではなく、状態管理ライブラリ**Redux**を用いて実現してみます。
Reduxを使うことのメリットとしては、いちいちimportする必要がなくなるくらいかもしれませんが、(あとは初期設計ではいらないと思ったが、後付けで必要になったときにPropsを渡すような親子関係ではなく、完全に分離されているので気軽に導入しやすいとか？)Reduxで調べると出てくる解説の多くはTODOリスト作ってみようだと思うので、こういったこともできるのか、ふむふむと思っていただけたら幸いです。

## **ディレクトリ構成**

```Text
src―redux
     |―store.ts
     |―modal
        |―modal.reducer.ts
        |―modal.types.ts
```

Component思考が強いから(?)Vuexとは違って、特定のComponent用にReduxを用意する  
この記事はモーダルウィンドウ用に作ったReduxをもとに記述している

## **store.ts**
```ts
import { configureStore } from '@reduxjs/toolkit'
import modalReducer from './modal/modal.reducer'

export const store = configureStore({
  reducer: {
    modal: modalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'modal/openModal',
        ],
        ignoredPaths: [
          'modal.modalInfo.buttonItems'
        ]
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export default store
```

## **modal.reducer.ts**
```ts
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as ModalType from './modal.types'


const initialState = {
  isModalOpen: false,
  modalInfo: {
    title: '',
    style: {
      width: 390,
      height: 260,
      fSize: 25,
    },
    buttonItems: [{
      btnTitle: '',
      callback: Function.prototype,
    }]
  }
} as ModalType.ModalState

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<ModalType.ModalInfo>) {
      state.isModalOpen = true
      const payload = {...action.payload}
      state.modalInfo.title = payload.title
      state.modalInfo.style = payload.style! ? payload.style
                                             : initialState.modalInfo.style
      state.modalInfo.buttonItems = payload.buttonItems! ? payload.buttonItems.slice()
                                                         : initialState.modalInfo.buttonItems.slice()
    },
    closeModal(state) {
      state.isModalOpen = false
    },
  }
})

export const modalReducer = modalSlice.actions
export default modalSlice.reducer
```

## **modal.types.ts**
```ts
export interface ModalStyle {
  width: number,
  height: number,
  fSize: number,
}

export interface ButtonItems {
  btnTitle: string,
  callback: () => void,
}

export type ModalInfo = {
  title: string,
  style?: ModalStyle,
  buttonItems?: Array<ButtonItems>,
}

export interface ModalState {
  isModalOpen: boolean,
  modalInfo: {
    title: string,
    style: ModalStyle
    buttonItems: Array<ButtonItems>
  },
}
```

# **How to use redux**
以下、タイトルとサイズを状態管理して可変にしているモーダルウィンドウ  
useSelectorでStateの値を取得、Vuexのgettersみたいなもの  
useDispatchでStateの値を変更する、VuexのActions,Mutationsみたいなもの

## **モーダルウィンドウを呼び出しているComponent**
```ts
const openModal = () => {
  const modal_info = {
    title: 'This is modal window',
    style: {
      width: 600,
      height: 400
    }
  }
  dispatch(modalReducer.openModal(modal_info))
}
```

## **Modal.tsx**
```ts
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { modalReducer } from '@/redux/modal/modal.reducer'
import { CSSTransition } from 'react-transition-group'
import styles from '@/styles/components/Modal.module.sass'
import { ButtonItems } from '@/redux/modal/modal.types'

// *** How to use Modal Window ************************** //
//
// const openModal = () => {
//   const modalInfo = {
//     title: 'This is sample modal',
//     style: { //default // other recommended styles
//       width: 390,      // 600, 900
//       height: 260,     // 400, 600
//       fSize: 25,       // 35,  50
//     },
//     buttonItems:[{
//       btnTitle: 'OK',
//       callback: () => clickOk(),
//     }]
//   }
//   dispatch(modalReducer.openModal(modalInfo))
// }
//
// ****************************************************** //

interface Props {
  btnItems: Array<ButtonItems>
}
function ExecButton(props: Props) {
  const execButton = props.btnItems.map((el) =>
    <li key={el.btnTitle}
        onClick={el.callback}
    >
      <span>{el.btnTitle}</span>
    </li>
  )

  return (
    <>{ execButton }</>
  );
}

const Modal = () => {
  const isModalOpen = useSelector((state: RootState) => state.modal.isModalOpen)
  const modalInfo = useSelector((state: RootState) => state.modal.modalInfo)
  const dispatch = useDispatch()
  
  const closeModal = () => {
    dispatch(modalReducer.closeModal())
  }

  return (
    <CSSTransition
      in={isModalOpen}
      timeout={390}
      unmountOnExit
      classNames={{
        enter:       styles['modal-enter'],
        enterActive: styles['modal-enter-active'],
        enterDone:   styles['modal-enter-done'],
        exit:        styles['modal-exit'],
        exitActive:  styles['modal-exit-active']
      }}>
      <div>
        <div className={styles['modal-overlay']} onClick={closeModal}>
          <div style={{width: modalInfo.style.width + 'px', 
                       height: modalInfo.style.height + 'px',}}
               onClick={(event) => event.stopPropagation()}>
              <div className={styles['modal-content']}>
                <header>
                  <span style={{fontSize: modalInfo.style.fSize + 'px'}}>
                    {modalInfo.title}
                  </span>
                </header>
                <div>use this area message board</div>
                <footer>
                  <ExecButton
                    btnItems={modalInfo.buttonItems} />
                  <li onClick={closeModal}>
                    <span>Close</span>
                  </li>
                </footer>
              </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}
export default Modal
```

## **// TODO 後で読む**

**[Redux入門者向け初めてのRedux Toolkit](https://reffect.co.jp/react/redux-toolkit#Redux_Toolkit)**

**[[Redux Toolkit] 4つの主要APIについて](https://qiita.com/10mi8o/items/5b5ded0504b0f28ac611)**
