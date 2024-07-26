<script>
import FileView from "./components/FileView.vue";
import { getUserInfo } from "./helpers/http.js";
import { useAuthStore } from "./store/auth.js";
import { watchEffect } from "vue";

export default {
    name: "App",
    components: {
        "file-view": FileView
    },
    data() {
        return {
            width: 100,
        };
    },
    async mounted() {
        await getUserInfo();

        const authStore = useAuthStore();

        watchEffect(() => {
            this.width = authStore.mobility ? 100 : authStore.width;
        });

        authStore.checkSize();

        window.addEventListener("resize", () => {
            authStore.checkSize();
        });
    },
}
</script>

<template>
    <main
        style="
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        "
    >
        <file-view :width="width" />
    </main>
</template>