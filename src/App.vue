<script setup>
import FileView from "./components/FileView.vue";


</script>


<script>
import {useAuthStore} from "./store/auth.js";
import {RequestGET} from "./helpers/http.js";

export default {
    name: "App",
    async mounted() {
        const authStore = useAuthStore();

        let response = await RequestGET("/api/users/get_profile_info", {
            user_id: localStorage.getItem("user_id")
        });

        authStore.setInfo(response.data);
    }
}
</script>

<template>
  <main>
      <file-view></file-view>
  </main>
</template>