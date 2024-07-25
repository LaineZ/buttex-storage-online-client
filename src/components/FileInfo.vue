<template>
    <div class="wrapper">
        <LoadingOverlay :loading="loading" :dimming="false"/>
        
        <div class="main">
            <div class="icon" v-if="info">
                <img width="90" v-if="info.has_preview == 1" :src="'https://storage.buttex.ru/api/storage/get_file_preview?file_id=' + info.id">
                
                <i v-else class="fa fa-4x" :class="mapIcon(info.type)" style="display: block;"></i>
                
                <div class="preview">
                    <h4>File</h4>
                </div>
            </div>
            
            <div class="info" v-if="info">
                <input type="text" v-model="info.name" :disabled="!canEdit()">
                <table>
                    <tr>
                        <th>Uploaded by:</th>
                        <td>{{ info.user_name }}</td>
                    </tr>
                    <tr>
                        <th>Creation date:</th>
                        <td>{{ fmtDate(info.creation_time) }}</td>
                    </tr>
                    <tr>
                        <th>Last modified:</th>
                        <td>{{ fmtDate(info.modification_time) }}</td>
                    </tr>
                    <tr>
                        <th>Size:</th>
                        <td>{{ formatBytes(info.size || 0) }}</td>
                    </tr>
                    <tr v-if="info.lifetime">
                        <th>Lifetime:</th>
                        <td>{{ info.lifetime }}</td>
                    </tr>
                    <tr>
                        <th>Hidden:</th>
                        <td><input type="checkbox" v-model="info.hidden" :disabled="!canEdit()"></td>
                    </tr>
                    <tr>
                        <th>File link:</th>
                        <td><a :href="info.url">{{ info.url }}</a></td>
                    </tr>
                    <tr>
                        <th>Permanent link:</th>
                        <td><a :href="info.permanent_url">{{ info.permanent_url }}</a></td>
                    </tr>
                </table>
            </div>
        </div>
        
        <footer v-if="info && canEdit()">
            <button :disabled="loading || !isAltered" @click="saveChanges"><i class="fa fa-check"></i> Save changes</button>
            <button :disabled="loading" @click="retriveFile(fileId)"><i class="fa fa-refresh"></i> Refresh</button>
            <button :disabled="loading" @click="deleteFile"><i class="fa fa-trash"></i> Delete</button>
        </footer>
        
        <modal ref="modalDelete" :buttons="['Yes', 'No']"></modal>
    </div>
</template>

<script>
import Modal from "./Modal.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import {RequestGET} from "../helpers/http.js";
import { formatBytes, fmtDate, mapIcon } from "../helpers/converterHelper.js";
import { canEdit } from "../helpers/http.js";
import * as Api from "../helpers/api.js";

export default {
    name: "FileInfo",
    components: {LoadingOverlay, Modal},
    data() {
        return {
            info: null,
            originalInformation: null,
            loading: false,
            fileId: null,
        }
    },
    computed: {
        isAltered() {
            console.log(this.originalInformation.name, this.info.name);
            return this.originalInformation.name != this.info.name || this.originalInformation.hidden !== this.info.hidden;
        }
    },
    emits: ["save"],
    methods: {
        async retriveFile(fileId) {
            this.fileId = fileId;
            this.loading = true;
            try {
                let response = await RequestGET("/api/storage/get_file_info", {
                    file_id: this.fileId
                });
                this.info = response.data;
                this.originalInformation = { ...response.data };

                this.$forceUpdate();
            } catch (e) {
                this.$refs.modalError.open(e.toString())
            }
            this.loading = false;
        },

        canEdit() {
            return canEdit(this.info.user_id);
        },

        formatBytes(bytes) {
            return formatBytes(bytes)
        },

        async saveChanges() {
            this.loading = true;
            if (canEdit(this.info.user_id)) {
                try {
                    if (this.originalInformation.name != this.info.name) {
                        await RequestGET("/api/storage/set_file_name", {
                            file_id: this.info.id,
                            new_file_name: this.info.name,
                        });
                    }
                    await RequestGET("/api/storage/set_file_hidden", {
                        file_id: this.info.id,
                        hidden: this.info.hidden ? 1 : 0,
                    });
                    this.$emit("save");
                } catch (error) {
                    this.$show(error.error || error.toString());
                }
            }
            this.loading = false;
        },

        async deleteFile() {
            let response = await this.$refs.modalDelete.openAsync(`Delete file "${this.info.name}"?`);

            if (response == 0) {
                await Api.deleteFile(this, this.fileId);
                this.$emit("save");
            }
        },

        mapIcon,
        fmtDate
    },
}
</script>

<style scoped>
.main {
    display: flex;
    min-width: 64px;
    min-height: 64px;
    width: 50vw;
    max-width: 800px;
}

.wrapper {
    position: relative;
}

.icon {
    display: flex;
    flex-direction: column;
    place-items: center;
    margin-right: 20px
}

input {
    margin-bottom: 5px;
}

@media (max-width: 700px) {
    .main {
        flex-direction: column;
        max-width: unset;
        width: unset;
    }
}

footer {
    margin-top: 10px;
}

footer button {
    margin-right: 5px;
}
</style>