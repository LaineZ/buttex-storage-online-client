<template>
    <div>
        <modal ref="modalError"></modal>
    </div>
</template>

<script>
import Modal from "./Modal.vue";
export default {
    name: "ErrorModalService",
    components: {
        Modal
    },
    methods: {
        open(message) {
            this.$refs.modalError.open(message);
        }
    }
};
</script>

<style scoped>

</style>