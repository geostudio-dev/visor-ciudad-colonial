<template>
    <div class="catalog-container">
        <div class="welcome">
            <v-row>
                <v-col cols="12" md="6">
                    <v-card class="mx-auto" variant="flat">
                        <v-card-title class="text-h3 text-wrap">Mapa de la Ciudad Colonial</v-card-title>
                        <v-card-subtitle class="text-h5">¡Bienvenido!</v-card-subtitle>
                        <v-card-text>
                            <p>En esta sección podrás consultar el mapa de de la Ciudad Colonial preparado por el Ministerio de Cultura de la Repúblca dominicana y el ayuntamiento de la Alcaldía del Distrito Nacional (ADN) para facilitar el acceso a la información de zonificación de usos e intervención (Ordenanzas 03-11 y 08-11) a los ciudadanos.</p>
                            <v-img src="https://datastoreb1d9.blob.core.windows.net/geostudio-assets/organizations/Republica%20Dominicana/Ciudad%20Colonial/adn_logo.png" height="100"></v-img>
                            <v-divider></v-divider>
                            <p class="text-caption">Para ver el mapa, haz click en el botón <strong>Ver Mapa</strong> de la tarjeta a continuación.</p>
                            <!--p class="text-caption">Para ver los detalles de un mapa, haz click en el botón <v-icon color="error">mdi-information</v-icon>.</p-->
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <img :src="image" alt="App image" width="550">
                </v-col>
            </v-row>
        </div>
        <div class="map-cards">
            <v-row>
                <v-col cols="12" md="12">
                    <v-card v-for="map in maps" :key="map.id" variant="flat" class="mx-auto bg-secondary on-secondary" max-width="900">
                        <v-card-item>
                            <div class="text-overline mb-1" color="accent">
                                Mapa | {{ map.attribution }}
                            </div>
                        </v-card-item>
                        <v-divider></v-divider>
                        <v-img :src="map.thumbnail_url" class="map-thumbnail" cover></v-img>
                        <v-card-title class="text-h6 mb-1">{{ map.title }}</v-card-title>
                        <v-card-text class="text-caption" color="accent">{{ map.raw_purpose }}</v-card-text>
                        <!-- card content... -->
                        <v-divider></v-divider>
                        <v-card-actions class="d-flex justify-space-between">
                            <v-btn color="accent" @click="goToMapView(map.pk)">Ver mapa</v-btn>
                            <v-btn icon @click="openDetails(map.detail_url)">
                                <v-icon color="error">mdi-information</v-icon>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </div>
        <v-footer fixed class="pa-2 bg-primary on-primary app-footer">
            <v-container fluid>
                <v-row justify="center" no-gutters>
                <p>&copy; {{ new Date().getFullYear() }} | <strong><a href="https://www.geostudio.com.co/"> GeoStudio </a></strong> | Alcaldía del Distrito Nacional - ADN</p>
                </v-row>
            </v-container>
        </v-footer>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    props: {
        maps: {
        type: Array,
        required: true,
        },
    },
    // data, methods...
    data: () => ({
        image: require('@/assets/Ciudad-Colonial-de-Santo-Domingo.jpg'),
    }),
    methods: {
        ...mapActions(['fetchDatasets']),
        goToMapView(pk) {
            const selectedMap = this.maps.find(map => map.pk === pk);
            this.$store.commit('setSelectedMap', selectedMap);
            this.fetchDatasets();
            this.$router.push({ name: 'Map' });
        },
        openDetails(detailUrl) {
        window.open(`${detailUrl}/metadata_detail`, '_blank');
        },
    },
};
</script>

<style scoped>

a {
  color: inherit;
  text-decoration: none;
}
.v-card-title.text-wrap {
  white-space: normal;
  line-height: 1.5;
}

.map-thumbnail {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.catalog-container {
    height: calc(100vh - 64px);
    display: grid;
    grid-template-columns: 1fr 80% 1fr;
    grid-template-rows: 1fr 1fr 50px;
    grid-gap: 10px;
}

.welcome {
    grid-row-start: 1;
    grid-column-start: 2;
    grid-column-end: 3;
    margin-top: 5%;
}

.map-cards {
    grid-row-start: 2;
    grid-column-start: 2;
    grid-column-end: 3;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
}

.app-footer {
    grid-row-start: 3;
    grid-column-start: 1;
    grid-column-end: 4;
}
</style>