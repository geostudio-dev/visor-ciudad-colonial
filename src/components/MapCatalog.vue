<template>
    <div class="container">
        <v-card v-for="map in maps" :key="map.id" variant="tonal" class="mx-auto" max-width="450" color="indigo">
            <v-card-item>
                <div class="text-overline mb-1">
                    Mapa | {{ map.attribution }}
                </div>
            </v-card-item>
            <v-divider></v-divider>
            <v-img :src="map.thumbnail_url" aspect-ratio="1.75"></v-img>
            <v-card-title class="text-h6 mb-1">{{ map.raw_abstract }}</v-card-title>
            <v-card-text class="text-caption">{{ map.raw_purpose }}</v-card-text>
            <!-- card content... -->
            <v-divider></v-divider>
            <v-card-actions class="d-flex justify-space-between">
                <v-btn color="primary" @click="goToMapView(map.id)">Ver mapa</v-btn>
                <v-btn icon @click="openDetails(map.detail_url)">
                    <v-icon>mdi-information</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    export default {
    props: {
        maps: {
        type: Array,
        required: true,
        },
    },
    // data, methods...
    methods: {
        goToMapView(mapId) {
        this.$router.push({ name: 'MapView', params: { id: mapId } });
        },
        openDetails(detailUrl) {
        window.open(`${detailUrl}/metadata_detail`, '_blank');
        },
    },
    };
</script>

<style>
.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin: 30px;
    padding: 0;
}
</style>