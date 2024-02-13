<template>
    <div class="main">
        <LoadingOverlay :loading="loading" :dimming="false"/>
        <div class="icon" v-if="!loading && info">
            <img width="64" v-if="info.type.includes('image') || info.type.includes('video')" :src="'https://storage.buttex.ru/api/storage/get_file_preview?file_id=' + info.id">
            <i v-else class="fa fa-4x" :class="mapIcon(info.type)" style="display: block;"></i>
            <div class="preview">
                <h4>File</h4>
            </div>
        </div>
        <div class="info" v-if="info">
            <input type="text" v-model="info.name">
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
                    <td><input type="checkbox" v-model="info.hidden"></td>
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
import {useAuthStore} from "../store/auth.js";
import {RequestGET} from "../helpers/http.js";

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

        async saveChanges() {
            // resolve permissions
            // https://storage.buttex.ru/api/docs/methods/storage/set_file_name.html
            const authStore = useAuthStore();

            if (authStore.access_level >= ACCESS_LEVEL_MODERATOR || authStore.id == info.user_id) {
                try {
                    await RequestGet("/api/storage/set_file_name", {
                        file_id: this.info.id,
                        new_file_name: this.info.name,
                    });
                } catch (error) {
                    this.$refs.modalError.open("Unable to save changes: " + error.error || error.toString());
                }
            } else {

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

        formatBytes(bytes, decimals = 2) {
            if (!+bytes) return '0 Bytes'

            const k = 1024
            const dm = decimals < 0 ? 0 : decimals
            const sizes = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

            const i = Math.floor(Math.log(bytes) / Math.log(k))

            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
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

table {
    text-align: left;
    border: none;
    line-height: 1.2;
}

th {
    padding-right: 10px;
}
</style>