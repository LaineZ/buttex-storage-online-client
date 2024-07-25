<template>
    <modal ref="modalDir" :buttons="['Confirm', 'Cancel']" @response="response">
        <div style="display: flex; place-items: center;">
            <div style="margin-right: 20px">
                <i class="fa fa-file-o fa-4x"></i>
            </div>
            
            <div>
                <h3>Rename</h3>
                <input type="text" v-model="newName" placeholder="New file name">
                <small v-if="error">{{ error }}</small>
            </div>
        </div>
    </modal>
</template>

<script>
import Modal from "./Modal.vue";
import { RequestGET } from "../helpers/http.js";

export default {
    name: "RenameModal",
    components: {Modal},
    data() {
        return {
            error: "",
            newName: "",
        }
    },
    props: {
        entityId: {
            type: Number,
            default: 0,
        },
        isDirectory: {
            type: Boolean,
            default: false,
        }
    },
    emits: ["updated"],
    methods: {
        async response(index) {
            if (index == 0) {
                try {
                    await RequestGET("/api/storage/set_file_name", {
                        file_id: this.entityId,
                        new_file_name: this.newName
                    });
                    // TODO: handle directories
                    this.$emit("updated");
                } catch (e) {
                    this.$refs.modalDir.open();
                    this.error = e.toString();
                }
            }
        },

        open(fileName) {
            this.newName = fileName;
            this.error = null;
            this.$refs.modalDir.open();
        }
    }
}
</script>

<style scoped>
    small {
        color: #d38585;
    }
</style>