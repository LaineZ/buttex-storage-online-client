<template>
    <modal ref="modalDir" :buttons="['Create', 'Cancel']" @response="response">
        <div style="display: flex; place-items: center; max-width: 400px;">
            <div style="margin-right: 20px">
                <i class="fa fa-folder fa-4x"></i>
            </div>
            <div>
                <h3>Create directory</h3>
                <input type="text" v-model="filename" placeholder="Directory name">
                <small v-if="error">{{ error }}</small>
                <table>
                    <tr>
                        <th>Hidden:</th>
                        <td><input type="checkbox" v-model="hidden"></td>
                    </tr>
                </table>
            </div>
        </div>
    </modal>
</template>

<script>
import Modal from "./Modal.vue";
import { RequestGET } from "../helpers/http.js";
import { generateName } from "../helpers/nameGenerator.js";

export default {
    name: "CreateDirectoryModal",
    components: {Modal},
    data() {
        return {
            filename: generateName(),
            hidden: false,
            parentDirectoryId: 0,
            error: "",
        }
    },
    props: {
        directories: {
            type: Array,
            default: [],
        }
    },
    emits: ["created"],
    methods: {
        async response(index) {
            if (index == 0) {
                try {
                    if (this.parentDirectoryId > 0) {
                        await RequestGET("/api/storage/create_directory", {
                            directory_name: this.filename,
                            parent_directory_id: this.parentDirectoryId,
                            hidden: this.hidden ? 1 : 0
                        });
                    } else {
                        await RequestGET("/api/storage/create_directory", {
                            directory_name: this.filename,
                            hidden: this.hidden ? 1 : 0
                        });
                    }
                } catch (e) {
                    this.$refs.modalDir.open();
                    this.error = e.toString();
                }

                this.$emit("created")
            }
        },

        open(dirId) {
            this.error = null;
            this.filename = generateName()
            this.parentDirectoryId = dirId;
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