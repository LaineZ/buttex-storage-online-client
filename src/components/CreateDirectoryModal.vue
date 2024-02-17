<template>
    <modal ref="modalDir" :button="['Create', 'Cancel']" @response="response">
        <div>
            <h3>Create directory</h3>
            <input type="text" v-model="filename" placeholder="Directory name">
            <small v-if="error">Unable to create directory...</small>
            <table>
                <tr>
                    <th>Hidden:</th>
                    <td><input type="checkbox" v-model="hidden"></td>
                </tr>
            </table>
        </div>
    </modal>
</template>

<script>
import Modal from "./Modal.vue";
import { RequestGET } from "../helpers/http.js";

export default {
    name: "CreateDirectoryModal",
    components: {Modal},
    props: {
        parentDirectoryId: {
            type: Number,
            default: 0,
            error: false,
        }
    },
    data() {
        return {
            filename: "New folder " + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
            hidden: false,
        }
    },
    methods: {
        async response(index) {
            if (index == 0) {
                try {
                    if (this.parentDirectoryId > 0) {
                        await RequestGET("/api/storage/create_directory", {
                            directory_name: this.filename,
                            parent_directory_id: this.parentDirectoryId,
                            hidden: this.hidden
                        });
                    } else {
                        await RequestGET("/api/storage/create_directory", {
                            directory_name: this.filename,
                            hidden: this.hidden
                        });
                    }
                } catch (e) {
                    this.$refs.modalDir.open();
                    this.error = true;
                }
            }
        },

        open() {
            this.$refs.modalDir.open()
        }
    }
}
</script>

<style scoped>

</style>