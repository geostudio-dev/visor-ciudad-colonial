<template>
    <div ref="mapContainer" class="map-container"></div>

</template>

<script>
import mapboxgl from "mapbox-gl";
mapboxgl.accessToken = "pk.eyJ1IjoiZ2Vvc3R1ZGlvIiwiYSI6ImNrNWk5Mmp5eDBjNHQzbW10M3d6NzI1Y28ifQ.MPmtingHT1zi_Wk5ZxW8wA"

export default {
    name: "WebMap",
    props: ["modelValue", "mapLayers"],
    data() {
        return {
            map: null,
            mapContainer: null,
            marker: null,
        };
    },
    mounted() {
        console.log('mapLayers in WebMap.vue:', this.mapLayers); // print the value of mapLayers in the WebMap.vue component
        const { lng, lat, zoom, bearing, pitch } = this.modelValue

        const map = new mapboxgl.Map({
            container: this.$refs.mapContainer,
            style: "mapbox://styles/mapbox/light-v11",
            center: [lng, lat],
            bearing,
            pitch,
            zoom,
        });

        // Add navigation control (the +/- zoom buttons)
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add wms source provided by the selected map
        map.on('load', () => {
            if (this.mapLayers) {
            this.mapLayers.forEach((layer, index) => {
                const baseUrl = 'https://ec2-54-145-253-11.compute-1.amazonaws.com/geoserver/ows';
                const layerName = layer.dataset.alternate;
                const bbox = '{bbox-epsg-3857}';
                const newUrl = `${baseUrl}?service=WMS&version=1.1.0&request=GetMap&layers=${layerName}&styles=&bbox=${bbox}&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true`;
                console.log(newUrl);

                map.addSource(`wms-source-${index}`, {
                'type': 'raster',
                'tiles': [newUrl],
                'tileSize': 256
                });

                map.addLayer({
                'id': `wms-layer-${index}`,
                'type': 'raster',
                'source': `wms-source-${index}`,
                });
            });
            }
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
        }
    },
    methods: {
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
            
            // Create a new marker and add it to the map at the clicked location
            this.marker = new mapboxgl.Marker()
                .setLngLat(e.lngLat)
                .addTo(this.map);
            // Set the new marker as the map center
            this.map.setCenter(e.lngLat);
        },
    },
};

</script>

<style>
.map-container {
    height: 100vh;
    width: 100vw;
}

</style>