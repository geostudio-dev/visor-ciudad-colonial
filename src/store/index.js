import { createStore } from 'vuex'
import axios from 'axios';

export default createStore({
  state: {
    maps: [],
    selectedMap: null,
    mapLayers: [],
    // other state properties...
  },
  getters: {
    mapLayers: state => {
      console.log('mapLayers in store:', state.mapLayers); // print the value of mapLayers in the store
      return state.mapLayers;
    },
  },
  mutations: {
    setMaps(state, maps) {
      state.maps = maps;
    },
    setSelectedMap(state, map) {
      state.selectedMap = map;
      state.mapLayers = map.maplayers;
      console.log(state.mapLayers);
    },
    setMapLayers(state, mapLayers) {
      state.mapLayers = mapLayers;
    },
    toggleLayerVisibility(state, layerIndex) {
      if (state.mapLayers[layerIndex]) {
        state.mapLayers[layerIndex].visibility = !state.mapLayers[layerIndex].visibility;
      }
    },
    setLayerOpacity(state, { layerIndex, opacity }) {
      state.mapLayers[layerIndex].opacity = opacity;
    },
    // other mutations...
  },
  actions: {
    async fetchMaps({ commit }) {
      const response = await axios.get("https://ec2-54-145-253-11.compute-1.amazonaws.com/api/v2/maps");
      commit('setMaps', response.data.maps);
    },
    // other actions...
  },
  modules: {
  }
})
