import Vue from 'vue'
import Vuex from 'vuex'
import { state } from './modules/index'
import { getters } from './modules/getters'
import { mutations } from './modules/mutations'
import { actions } from './modules/actions'

Vue.use(Vuex)

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules: {
  }
})
