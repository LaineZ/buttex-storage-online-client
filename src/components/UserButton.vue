<template>
  <p>
      {{ name }}
  </p>
</template>


<script>
import { ref, watchEffect } from 'vue';
import { useAuthStore } from '../store/auth.js';


export default {
    name: "UserButton",
    data() {
        return {
            name: "",
            nickname: "",
        };
    },
    mounted() {
        const authStore = useAuthStore();
        const authState = ref(authStore);

        watchEffect(() => {
            console.log(authState.value.name);
            this.name = authState.value.name;
        });
    }

}
</script>

<style scoped>

</style>