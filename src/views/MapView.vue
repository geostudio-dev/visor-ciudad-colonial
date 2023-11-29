<template>
    <div id="layout">
        <div id="sidebar" class="container">
            <v-card variant="tonal" class="mx-auto" max-width="450" color="indigo">
                <v-card-item>
                    <div class="text-overline mb-1">
                        {{ selectedMap.raw_abstract }}
                    </div>
                </v-card-item>
                <v-card-title>
                    <v-icon left>mdi-layers</v-icon>
                    <div class="text-h6 mb-1">Capas</div>
                </v-card-title>
                <v-card-text>
                    <v-expansion-panels>
                        <v-expansion-panel v-for="layer in mapLayers" :key="layer.id" class="v-card">
                            <v-expansion-panel-title>
                                {{ layer.dataset.title }}
                                <template v-slot:actions>
                                    <v-icon color="indigo" icon="mdi-information">
                                    </v-icon>
                                </template>
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <!-- content of the panel... -->
                                <v-row class="d-flex align-center justify-space-between">
                                    <v-col cols="10">
                                        <v-slider color="indigo" min=0 max=1 v-model="layer.opacity"></v-slider>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-switch color="indigo" v-model="layer.visibility" @change="$store.commit('toggleLayerVisibility', index)"></v-switch>
                                    </v-col>
                                </v-row>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn icon @click="openDetails(map.detail_url)">
                        <v-icon>mdi-information</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </div>
        <div id="bottom" class="container">
            <select v-model="currentCRS" class="mb-3">
                <option value="EPSG:3857">CRS WGS84</option>
                <option value="EPSG:2202">CRS REGVEN</option>
            </select>
            Longitude: {{ currentCRS === 'EPSG:2202' ? reprojectedLocation.lng.toFixed(4) : location.lng.toFixed(4) }} |
            Latitude: {{ currentCRS === 'EPSG:2202' ? reprojectedLocation.lat.toFixed(4) : location.lat.toFixed(4) }} |
            Zoom: {{ location.zoom.toFixed(2) }} |
            <template v-if="location.bearing"> Bearing: {{ location.bearing.toFixed(2) }} | </template>
            <template v-if="location.pitch"> Pitch: {{ location.pitch.toFixed(2) }} | </template>
            <v-btn @click="location = { lng: -71.601944, lat: 10.631667, zoom: 11, pitch: 0, bearing: 0 }" class="ma-2" color="blue-grey-darken-4" >
            <v-icon icon="mdi-home"></v-icon>
            </v-btn>
        </div>
        <Map v-model="location" :mapLayers="mapLayers"  />
    </div>
</template>

<script>
import proj4 from 'proj4';
import { mapState } from 'vuex';

import Map from "@/components/WebMap.vue";
import "mapbox-gl/dist/mapbox-gl.css";

export default {
    name: "MapView",
    components: {
        Map,
    },
    data() {
        // Define the EPSG:2202 projection
        proj4.defs("EPSG:2202", "+proj=utm +zone=19 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        return {
            //sliderValue: 100,
            session: {
                name: 'Sistema de Información Territorial - SIT',
                site: 'Visor de Mapas | Consulta Ciudadana',
                details: 'Alcaldía de Maracaibo - Centro de Procesamiento Urbano (CPU)',
                logoPath: require('@/assets/alcaldia-de-maracaibo-logo-web.png'),
                // map name fetched from GeoNode API
                map: 'Ordenanza de Zonificación Urbana',

            },
            location: {
                lng: -71.601944,
                lat: 10.631667,
                bearing: 0,
                pitch: 0,
                zoom: 11,
            },
            reprojectedLocation: {
                lng: 0,
                lat: 0
            },
            currentCRS: 'EPSG:2202',
        };
    },
    computed: {
        ...mapState(['mapLayers', 'selectedMap']),
    },
    mounted() {
        this.mapLayers = this.$store.state.mapLayers;  // Update `mapLayers` with the actual map layers from the Vuex store
    },
    watch: {
        location(newLocation) {
            // Reproject the coordinates to EPSG:2202 whenever the location changes
            const [lng, lat] = proj4('EPSG:3857', 'EPSG:2202', [newLocation.lng, newLocation.lat]);
            this.reprojectedLocation = { lng, lat };
        },
    },
    methods: {
        switchCRS(crs) {
            this.currentCRS = crs;
            const convertedLocation = proj4(this.crs['EPSG:3857'], this.crs[this.currentCRS], [this.location.lng, this.location.lat]);
            this.location.lng = convertedLocation[0];
            this.location.lat = convertedLocation[1];
        },
        openDetails(detailUrl) {
        window.open(`${detailUrl}/metadata_detail`, '_blank');
        },
    },
};
</script>

<style>
#layout {
    display: grid;
    
}

.container {
    z-index: 1;
}

#sidebar {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    margin: 30px;
}

#bottom {
  background-color: rgb(35 55 75 / 90%);
  color: #fff;
  padding: 6px 12px;
  font-family: monospace;
  z-index: 1;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 30px;
  border-radius: 4px;
  text-align: right; /* Add this line */
}

select {
    width: 250px;
    height: calc(1.5em + .75rem + 2px);
    padding: .375rem .75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: .25rem;
    transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}
</style>