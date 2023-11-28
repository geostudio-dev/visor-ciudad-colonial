import { createStore } from 'vuex'
import axios from 'axios';

export default createStore({
  state: {
    maps: [],
    // other state properties...
  },
  getters: {
  },
  mutations: {
    setMaps(state, maps) {
      state.maps = maps;
    },
    // other mutations...
  },
  actions: {
    async fetchMaps({ commit }) {
      const response = await axios.get('https://ec2-54-145-253-11.compute-1.amazonaws.com/api/v2/maps');
      commit('setMaps', response.data.maps);
    },
    // other actions...
  },
  modules: {
  }
})
