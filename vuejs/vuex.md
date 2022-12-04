# ***VuexのTypeScript化***

## **ディレクトリ構成**
state, actions, getters, mutationsをモジュール化したVuexをTypeScript化  
※ **`node_module/vuex/vuex/types/index.d.ts`** に型定義が書いてある
```
src―――store
       |―store.ts
       |―types.ts
       |
       |―redux
          |―index.ts
          |―actions.ts
          |―getters.ts
          |―mutations.ts
          |―types.ts
```

## **store.ts**
```ts
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { RootState } from './types'
import { Redux } from './redux/index'

Vue.use(Vuex)

const store: StoreOptions<RootState> = ({
  state: {
    version: '1.0'
  },
  modules: {
    Redux
  }
})

export default new Vuex.Store<RootState>(store);
```

### **vuex/types/index.d.ts**
```ts
export interface StoreOptions<S> {
  state?: S | (() => S);
  getters?: GetterTree<S, S>;
  actions?: ActionTree<S, S>;
  mutations?: MutationTree<S>;
  modules?: ModuleTree<S>;
  plugins?: Plugin<S>[];
  strict?: boolean;
  devtools?: boolean;
}
```

## **types.ts**
```ts
export interface RootState {
  version: string,
}
```

## **redux/index.ts**
```ts
import { Module } from 'vuex'
import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'
import { RootState } from '../types'
import { ReduxState } from './types'

export const state: ReduxState = {
  loading: false, // sample code for loading
}

const namespaced = true

export const Redux: Module<ReduxState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
}
```

### **vuex/types/index.d.ts**
```ts
export interface Module<S, R> {
  namespaced?: boolean;
  state?: S | (() => S);
  getters?: GetterTree<S, R>;
  actions?: ActionTree<S, R>;
  mutations?: MutationTree<S>;
  modules?: ModuleTree<R>;
}
```

## **redux/types.ts**
型定義をしていく
```ts
export interface ReduxState {
  loading: boolean,  // sample code for loading
}
```

## **redux/actions.ts**
```ts
import { ActionTree } from 'vuex'
import { RootState } from '../types'
// import axios from 'axios'
import { ReduxState, } from './types'

export const actions: ActionTree<ReduxState, RootState> = {
}
```

### **vuex/types/index.d.ts**
```ts
export interface ActionTree<S, R> {
  [key: string]: Action<S, R>;
}
```

## **redux/getters.ts**
```ts
import { GetterTree } from 'vuex'
import { RootState } from '../types'
import { ReduxState } from './types'

export const getters: GetterTree<ReduxState, RootState> = {
}
```

### **vuex/types/index.d.ts**
```ts
export interface GetterTree<S, R> {
  [key: string]: Getter<S, R>;
}
```

## **redux/mutations.ts**
```ts
import { MutationTree } from 'vuex'
import { ReduxState } from './types'

export const mutations: MutationTree<ReduxState> = {
  // sample code for loading
  setLoading(state, payload: boolean) {
    state.loading = payload
  }
}
```

### **vuex/types/index.d.ts**
```ts
export interface MutationTree<S> {
  [key: string]: Mutation<S>;
}
```
> 参考ページ : <https://codeburst.io/vuex-and-typescript-3427ba78cfa8>  
> 参考ページ : <https://qiita.com/yam0918/items/68d4d6c74b06d589a195>