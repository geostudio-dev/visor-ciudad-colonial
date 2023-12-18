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
      state.mapLayers = map.maplayers.map(layer => {
        const legendLinks = layer.dataset.links.filter(link => link.name === 'Legend');
        return {
          ...layer,
          dataset: {
            ...layer.dataset,
            links: legendLinks
          }
        };
      });
      console.log('layers in store', state.mapLayers);
    },
    clearSelectedMap(state) {
      state.selectedMap = null;
    },
    setMapLayers(state, mapLayers) {
      state.mapLayers = mapLayers;
    },
    setMapDatasets(state, datasets) {
      state.mapDatasets = datasets;
    },
    toggleLayerVisibility(state, pk) {
      console.log(`Received pk: ${pk}`);  // Log received pk
      const layerIndex = state.mapLayers.findIndex(layer => layer.pk === pk);
      console.log(`Found layer with index ${layerIndex}`);  // Log found layer index
      if (layerIndex !== -1) {
        const layer = { ...state.mapLayers[layerIndex], visibility: !state.mapLayers[layerIndex].visibility };
        state.mapLayers[layerIndex] = layer;
        console.log(`Toggled visibility for layer with pk ${pk} to ${state.mapLayers[layerIndex].visibility}`);  // Log visibility change
        console.log('Updated mapLayers:', state.mapLayers);  // Log updated mapLayers
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
    
          let template = correspondingDataset.dataset.featureinfo_custom_template;

          // Create an object with Key-Value structure where key is the placeholder (${properties.property} in feature.properties), value is the corresponding value for each property
          let replacements = {};
          for (let property in feature.properties) {
            replacements[`\\$\\{properties.${property}\\}`] = feature.properties[property];
          }

          // Iterate in the object to find keys in template and replace with corresponding values
          for (let placeholder in replacements) {
            template = template.replace(new RegExp(placeholder, 'g'), replacements[placeholder]);
          }

          // Add class="wrap-text" to every <pre> tag
          template = template.replace(/<pre>/g, '<pre style="white-space: pre-wrap;">');

          // Set feature.featureinfo_custom_template with transformed template
          feature.featureinfo_custom_template = template;
        }
        feature.title = correspondingDataset.dataset.title;
    
        return feature;
      });
    
      // Push the modified features to the state
      state.features.push(...modifiedFeatures);
    },
    joinCategoryToMapLayers(state) {
      // Iterate over mapDatasets and print each dataset's pk
      //state.mapDatasets.forEach(dataset => {
      //  console.log('typeof dataset.dataset.pk:', typeof dataset.dataset.pk);
      //  console.log('dataset.pk:', dataset.dataset.pk);
      //});

      // Iterate over mapLayers
      state.mapLayers.forEach(layer => {
        // Check if layer has dataset and pk
        if (layer.dataset.pk) {
          // Print pk
          //console.log('typeof layer.dataset.pk:', typeof layer.dataset.pk);
          //console.log('layer.dataset.pk:', layer.dataset.pk);

          // Find the corresponding dataset in mapDatasets
          const dataset = state.mapDatasets.find(dataset => Number(dataset.dataset.pk) === Number(layer.dataset.pk));
          //console.log('matching dataset', dataset);
  
          // If a corresponding dataset is found, add the dataset's category to the layer's dataset
          if (dataset) {
            layer.dataset = {
              ...layer.dataset,
              category: dataset.dataset.category,
            };
          }
        }
      });
  
      //console.log('Updated mapLayers:', state.mapLayers);
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
      const response = await axios.get("https://mapas.alcaldiademaracaibo.org/api/v2/maps");
      commit('setMaps', response.data.maps);
    },
    fetchFeatures({ state, commit }) {
      commit('resetFeatures'); // reset features to an empty array
  
      const coordinate = state.markedCoordinate;
      const wfsUrl = 'https://mapas.alcaldiademaracaibo.org/geoserver/ows';
  
      // Loop over the mapLayers array
      for (const layer of state.mapLayers) {
        const layerName = layer.name;
  
        // Construct the GetFeature request
        const getFeatureRequest = `${wfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&outputFormat=application/json&srsName=epsg:4326&cql_filter=INTERSECTS(geometry, POINT(${coordinate[0]} ${coordinate[1]}))`;
        axios.get(getFeatureRequest).then(response => {
          commit('setFeatures', response.data.features);
        });
      }
    },
    async fetchDatasets({ commit, state }) {
      const datasets = [];
      for (const layer of state.mapLayers) {
        const response = await axios.get(`https://mapas.alcaldiademaracaibo.org/api/v2/datasets/${layer.dataset.pk}`);
        datasets.push(response.data);
      }
      commit('setMapDatasets', datasets);
      console.log('datasets in store', state.mapDatasets);
      commit('joinCategoryToMapLayers');
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
