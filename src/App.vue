<script setup>
import FileView from "./components/FileView.vue";
</script>


<script>
import {getUserInfo} from "./helpers/http.js";
import {useAuthStore} from "./store/auth.js";
import {ref, watchEffect} from "vue";

export default {
    name: "App",
    data() {
        return {
            width: 100,
        };
    },
    async mounted() {
        await getUserInfo();

        const authStore = useAuthStore();
        const authState = ref(authStore);

        watchEffect(() => {
            this.width = authState.value.width
        });

        authStore.checkSize();

        window.addEventListener("resize", () => {
            authStore.checkSize();
        });
    },
}
</script>

<template>
  <main :style=" { width: this.width + '%'} ">
      <file-view></file-view>
  </main>
</template>