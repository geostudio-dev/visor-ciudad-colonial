<template>
    <div ref="mapContainer" class="map-container"></div>

</template>

<script>
import mapboxgl from "mapbox-gl";
mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN;
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapMutations, mapActions, mapState } from 'vuex';
import proj4 from 'proj4';
import * as turf from '@turf/turf';

export default {
    name: "WebMap",
    props: ["modelValue", "mapLayers"],
    data() {
        proj4.defs("EPSG:32619", "+proj=utm +zone=19 +datum=WGS84 +units=m +no_defs +type=crs");
        return {
            map: null,
            mapContainer: null,
            marker: null,
            tracedFeatureId: null,
        };
    },
    async beforeMount() {
        // Check if mapLayers and mapDatasets are empty
        this.$store.dispatch('fetchSearchFeatures');
        if (this.$store.state.mapLayers.length === 0 && this.$store.state.mapDatasets.length === 0) {
            // Fetch the default map
            let maps = await this.$store.dispatch('fetchMaps');
            let defaultMap = maps.find(map => map.title === "Normatividad urbana de ciudad colonial");
            if (defaultMap) {
                this.$store.commit('setSelectedMap', defaultMap);
                await this.$store.dispatch('fetchDatasets');
            }
        }
    },
    mounted() {
        const map = this.initializeMap();

        map.on('load', () => {
        this.addLayersToMap(map);
        });

        const updateLocation = () => this.$emit('update:modelValue', this.getLocation())

        map.on('move', updateLocation)
        map.on('zoom', updateLocation)
        map.on('rotate', updateLocation)
        map.on('pitch', updateLocation)
        
        // Add a click event listener to the map
        
        this.map = map;
        this.map.on('click', this.addMarker);
    },
    unmounted() {
        this.map.remove();
        this.map = null;
    },
    watch: {
        modelValue(next) {
            const curr = this.getLocation()
            const map = this.map

            if (curr.lng != next.lng || curr.lat != next.lat)
            map.setCenter({ lng: next.lng, lat: next.lat })
            if (curr.pitch != next.pitch) map.setPitch(next.pitch)
            if (curr.bearing != next.bearing) map.setBearing(next.bearing)
            if (curr.zoom != next.zoom) map.setZoom(next.zoom)
        },
        '$store.state.mapLayers': {
            handler(newVal) {
            newVal.forEach((layer) => {
                const mapLayer = this.map.getLayer(`wms-layer-${layer.pk}`);
                if (mapLayer) {
                this.map.setLayoutProperty(`wms-layer-${layer.pk}`, 'visibility', layer.visibility ? 'visible' : 'none');
                this.map.setPaintProperty(`wms-layer-${layer.pk}`, 'raster-opacity', layer.opacity);
                }
            });
            },
            deep: true,
        },
        tracedFeature(newFeature) {
            if (this.tracedFeatureId) {
                // Remove the old feature from the map
                this.map.removeLayer(`${this.tracedFeatureId}-fill`);
                this.map.removeLayer(`${this.tracedFeatureId}-line`);
                this.map.removeSource(this.tracedFeatureId);
            }

            // Generate a unique id for the new feature
            this.tracedFeatureId = `feature-${Date.now()}`;

            // Try to add the new feature to the map
            try {
                this.map.addSource(this.tracedFeatureId, {
                type: 'geojson',
                data: newFeature,
                });

                this.map.addLayer({
                id: `${this.tracedFeatureId}-fill`,
                type: 'fill',
                source: this.tracedFeatureId,
                paint: {
                    'fill-color': '#888888', // adjust this value as needed
                    'fill-opacity': 0.4, // adjust this value as needed
                },
                });

                this.map.addLayer({
                id: `${this.tracedFeatureId}-line`,
                type: 'line',
                source: this.tracedFeatureId,
                paint: {
                    'line-color': '#6983B4', // accent color
                    'line-width': 3, // adjust this value as needed
                },
                });
                // Calculate the bounding box of the new feature
                const bbox = turf.bbox(newFeature);

                // Adjust the map view to fit the bounding box
                this.map.fitBounds(bbox, { padding: 20 });

            } catch (error) {
                console.error('Failed to add feature to map:', error);
            }
        },
        markedCoordinate() {
            if (this.tracedFeatureId) {
            // Remove the traced feature from the map
            this.map.removeLayer(`${this.tracedFeatureId}-fill`);
            this.map.removeLayer(`${this.tracedFeatureId}-line`);
            this.map.removeSource(this.tracedFeatureId);
            this.tracedFeatureId = null;
            }
        },
        mapLayers: {
            handler(newMapLayers) {
                if (this.map && newMapLayers.length > 0) {
                    this.addLayersToMap(this.map);
                }
            },
            immediate: true,
        },
    },
    computed: {
        ...mapState(['markedCoordinate', 'tracedFeature']),
    },
    methods: {
        ...mapMutations(['markCoordinate']),
        ...mapActions(['fetchFeatures']), // map the fetchFeatures action
        initializeMap() {
            const { lng, lat, zoom, bearing, pitch } = this.modelValue

            const map = new mapboxgl.Map({
                container: this.$refs.mapContainer,
                style: process.env.VUE_APP_DEFAULT_MAP_STYLE,
                center: [lng, lat],
                bearing,
                pitch,
                zoom,
            });

            // Add navigation control (the +/- zoom buttons)
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');

            return map;
            },
            addLayersToMap(map) {
            if (this.mapLayers) {
                [...this.mapLayers].forEach((layer) => {
                this.addLayerToMap(map, layer);
                });
            }
            },
            addLayerToMap(map, layer) {
            const baseUrl = `${process.env.VUE_APP_NODE_URL}${process.env.VUE_APP_WMS_SERVER_URL}`;
            const layerName = layer.dataset.alternate;
            const bbox = '{bbox-epsg-3857}';
            const newUrl = `${baseUrl}?service=WMS&version=1.1.0&request=GetMap&layers=${layerName}&styles=&bbox=${bbox}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true`;

            map.addSource(`wms-source-${layer.pk}`, {
                'type': 'raster',
                'tiles': [newUrl],
                'tileSize': 256
            });

            map.addLayer({
                'id': `wms-layer-${layer.pk}`,
                'type': 'raster',
                'source': `wms-source-${layer.pk}`,
                'paint': {
                'raster-opacity': layer.opacity
                },
                'layout': {
                'visibility': layer.visibility ? 'visible' : 'none'
                }
            });
        },
        getLocation() {
            return {
            ...this.map.getCenter(),
            bearing: this.map.getBearing(),
            pitch: this.map.getPitch(),
            zoom: this.map.getZoom(),
            }
        },
        addMarker(e) {
            // Remove the old marker if it exists
            if (this.marker) {
                this.marker.remove();
            }

            // Create a new HTML element
            let el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = '#404040'; //dark color
            el.style.border = '3px solid white';
            el.style.borderRadius = '50%';
            el.style.width = '20px';
            el.style.height = '20px';

            // Create a new marker and add it to the map at the clicked location
            this.marker = new mapboxgl.Marker(el)
                .setLngLat(e.lngLat)
                .addTo(this.map);

            // Perform the fly-to action to the new marker location with a zoom level of 18
            this.map.flyTo({ center: e.lngLat, zoom: 18 });

            // Set the new marker as the map center
            //this.map.setCenter(e.lngLat);

            const coordinate = { lat: e.lngLat.lat, lng: e.lngLat.lng };
            const sourceProjection = 'EPSG:4326'; // replace with your source projection
            const destinationProjection = 'EPSG:32619'; // replace with your destination projection

            // Reproject the coordinate
            const reprojectedCoordinate = proj4(sourceProjection, destinationProjection, [parseFloat(coordinate.lng), parseFloat(coordinate.lat)]);
            this.markCoordinate(reprojectedCoordinate);

            // Toggle the second drawer
            this.$store.commit('openSecondDrawer');
            this.fetchFeatures(); // dispatch the fetchFeatures action
        },
    },
};

</script>

<style>
.map-container {
    height: 100vh;
    width: 100vw;
}

@keyframes pulse {
    0% {
        transform: scale(0.1, 0.1);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: scale(6, 6);
        opacity: 0;
    }
}

.marker::after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    animation: pulse 2s infinite;
}
</style>