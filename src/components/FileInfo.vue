<template>
    <div class="main">
        <LoadingOverlay :loading="loading" :dimming="false"/>
        <div class="icon" v-if="!loading && info">
            <img width="64" v-if="info.has_preview == 1" :src="'https://storage.buttex.ru/api/storage/get_file_preview?file_id=' + info.id">
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
        <modal ref="modalError"></modal>
    </div>
</template>

<script>
import Modal from "./Modal.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import {ACCESS_LEVEL_MODERATOR, EXTENSION_MAPPING_ICONS} from "../helpers/consts.js";
import {RequestGET} from "../helpers/http.js";
import {formatBytes} from "../helpers/converterHelper.js";
import { canEdit } from "../helpers/http.js";

export default {
    name: "FileInfo",
    components: {LoadingOverlay, Modal},
    data() {
        return {
            info: null,
            loading: false,
        }
    },
    methods: {
        async retriveFile(file_id) {
            this.loading = true;
            try {
                let response = await RequestGET("/api/storage/get_file_info", {
                    file_id: file_id
                });
                this.info = response.data;
                this.$forceUpdate();
            } catch (e) {
                this.$refs.modalError.open(e.toString())
            }
            this.loading = false;
        },

        canEdit() {
            canEdit(this.info.user_id)
        },

        formatBytes(bytes) {
            return formatBytes(bytes)
        },

        async saveChanges() {
            if (canEdit(this.info.user_id)) {
                try {
                    await RequestGET("/api/storage/set_file_name", {
                        file_id: this.info.id,
                        new_file_name: this.info.name,
                    });
                } catch (error) {
                    this.$refs.modalError.open("Unable to save changes: " + error.error || error.toString());
                }
            }
        },

        mapIcon(file_name) {
            const ext = file_name.split('.').pop()

            if (EXTENSION_MAPPING_ICONS[ext] !== undefined) {
                return EXTENSION_MAPPING_ICONS[ext]
            } else {
                return "fa-file-o";
            }
        },

        fmtDate(timestamp) {
            const date = new Date(timestamp * 1000);
            return `${date.getFullYear()}-${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}
            ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        }
    },
}
</script>

<style scoped>
.main {
    display: flex;
    position: relative;
    min-width: 64px;
    min-height: 64px;
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
    }
}
</style>