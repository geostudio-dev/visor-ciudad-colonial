<template>
  <v-app>
    <v-app-bar app color="indigo" :elevation="0">
      <!-- Add your logo here -->
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>
      <!--v-img
        :src="require('@/assets/alcaldia-de-maracaibo-logo-web.png')"
        alt="Alcaldía de Maracaibo"
        max-height="35"
      ></v-img-->
      <v-toolbar-title class="text-overline">Visor de Consulta Ciudadana</v-toolbar-title>

      <!-- Add spacer to push content to the right -->
      <v-spacer></v-spacer>

      <!-- Add your buttons here -->
      <v-btn>Login</v-btn>
      <v-btn icon>
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>
