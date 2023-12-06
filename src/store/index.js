import { createStore } from 'vuex'
import axios from 'axios';

export default createStore({
  state: {
    maps: [],
    selectedMap: null,
    mapLayers: [],
    mapDatasets: [],
    secondDrawer: false,
    markedCoordinate: { lat: 0, lng: 0 },
    features: [],
    tracedFeature: null,
    // other state properties...
  },
  getters: {
    mapLayers: state => {
      console.log('mapLayers in store:', state.mapLayers); // print the value of mapLayers in the store
      return state.mapLayers;
    },
    markedCoordinate: state => state.markedCoordinate,
    // other getters...
  },
  mutations: {
    setMaps(state, maps) {
      state.maps = maps;
    },
    setSelectedMap(state, map) {
      state.selectedMap = map;
      state.mapLayers = map.maplayers;
      console.log('Map:', state.selectedMap);
    },
    setMapLayers(state, mapLayers) {
      state.mapLayers = mapLayers;
      console.log('mapLayers in store:', state.mapLayers); // print the value of mapLayers in the store
    },
    setMapDatasets(state, datasets) {
      state.mapDatasets = datasets;
      console.log('mapDatasets in store:', state.mapDatasets); // print the value of mapLayers in the store
    },
    toggleLayerVisibility(state, layerIndex) {
      if (state.mapLayers[layerIndex]) {
        state.mapLayers[layerIndex].visibility = !state.mapLayers[layerIndex].visibility;
      }
    },
    setLayerOpacity(state, { layerIndex, opacity }) {
      state.mapLayers[layerIndex].opacity = opacity;
    },
    openSecondDrawer(state) {
      state.secondDrawer = true;
    },
    closeSecondDrawer(state) {
      state.secondDrawer = false;
    },
    markCoordinate(state, coordinate) {
      state.markedCoordinate = coordinate;
      console.log('markedCoordinate', state.markedCoordinate);
    },
    setFeatures(state, features) {
      const modifiedFeatures = features.map(feature => {
        // Remove unwanted characters from feature.id
        const refactoredId = feature.id.split('.')[0];
    
        // Find the corresponding dataset
        const correspondingDataset = state.mapDatasets.find(dataset => dataset.dataset.name === refactoredId);
    
        // If a corresponding dataset is found, append the corresponding dataset's attribute_Set to the feature's properties
        if (correspondingDataset) {
          feature.properties.attribute_set = correspondingDataset.dataset.attribute_set.map(attribute => {
            return {
              ...attribute,
              value: feature.properties[attribute.attribute]
            };
          });
        }
    
        return feature;
      });
    
      // Push the modified features to the state
      state.features.push(...modifiedFeatures);
    },
    resetFeatures(state) {
      state.features = [];
    },
    setTracedFeature(state, geometry) {
      state.tracedFeature = geometry;
    },
    resetTracedFeature(state) {
      state.tracedFeature = null;
    },
    // other mutations...
  },
  actions: {
    async fetchMaps({ commit }) {
      const response = await axios.get("https://ec2-54-145-253-11.compute-1.amazonaws.com/api/v2/maps");
      commit('setMaps', response.data.maps);
    },
    fetchFeatures({ state, commit }) {
      commit('resetFeatures'); // reset features to an empty array
  
      const coordinate = state.markedCoordinate;
      const wmsUrl = 'https://ec2-54-145-253-11.compute-1.amazonaws.com/geoserver/ows';
      const buffer = 0.01; // adjust this value as needed
  
      // Loop over the mapLayers array
      for (const layer of state.mapLayers) {
        const layerName = layer.name;
  
        // Construct the GetFeatureInfo URL
        const getFeatureInfoUrl = `${wmsUrl}?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=${layerName}&styles=&srs=EPSG:4326&format=image/png&bbox=${coordinate.lng - buffer},${coordinate.lat - buffer},${coordinate.lng + buffer},${coordinate.lat + buffer}&width=256&height=256&query_layers=${layerName}&info_format=application/json&x=128&y=128`;
  
        axios.get(getFeatureInfoUrl).then(response => {
          console.log('Queried', response);
          commit('setFeatures', response.data.features);
          console.log('features', state.features);
        });
      }
    },
    async fetchDatasets({ commit, state }) {
      const datasets = [];
      for (const layer of state.mapLayers) {
        const response = await axios.get(`https://ec2-54-145-253-11.compute-1.amazonaws.com/api/v2/datasets/${layer.dataset.pk}`);
        datasets.push(response.data);
      }
      commit('setMapDatasets', datasets);
    },
    traceFeature({ commit }, geometry) {
      commit('setTracedFeature', geometry);
    },
    markCoordinate({ commit }, coordinate) {
      commit('setMarkedCoordinate', coordinate);
      commit('resetTracedFeature');
    },
    // other actions...
  },
  modules: {
  }
})
