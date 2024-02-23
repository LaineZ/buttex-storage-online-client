<script setup>
import FileView from "./components/FileView.vue";


</script>


<script>
import {getUserInfo} from "./helpers/http.js";

export default {
    name: "App",
    async mounted() {
        await getUserInfo();
    },
    provide() {
        return {
            errorModalService: this.$refs.errorModalService
        };
    }
}
</script>

<template>
  <main>
      <file-view></file-view>
  </main>
</template>