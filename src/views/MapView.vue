<template>
    <div id="layout">
        <div id="sidebar">
            <select v-model="currentCRS" class="mb-3">
                <option value="EPSG:3857">EPSG:3857</option>
                <option value="EPSG:2202">EPSG:2202</option>
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
        <Map v-model="location" />
    </div>
</template>

<script>
import proj4 from 'proj4';

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
            currentCRS: 'EPSG:3857',
        };
    },
    watch: {
        location(newLocation) {
            // Reproject the coordinates to EPSG:2202 whenever the location changes
            const [lng, lat] = proj4('EPSG:3857', 'EPSG:2202', [newLocation.lng, newLocation.lat]);
            this.reprojectedLocation = { lng, lat };
        }
    },
    methods: {
        switchCRS(crs) {
            this.currentCRS = crs;
            const convertedLocation = proj4(this.crs['EPSG:3857'], this.crs[this.currentCRS], [this.location.lng, this.location.lat]);
            this.location.lng = convertedLocation[0];
            this.location.lat = convertedLocation[1];
        },
    },
};
</script>

<style>
#layout {
  flex: 1;
  display: flex;
  position: relative;
}

#sidebar {
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

#button:hover {
  background-color: #fff;
  color: #000;
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