<script>
import {ENDPOINT, PREVIEW_AUDIO, PREVIEW_IMAGE, PREVIEW_TEXT, PREVIEW_VIDEO} from "../helpers/consts.js";
import {RequestGETText} from "../helpers/http.js";
import {canShowPreview} from "../helpers/converterHelper.js";
import LoadingOverlay from "./LoadingOverlay.vue";

export default {
    name: "FilePreview",
    components: {LoadingOverlay },
    methods: {
        PREVIEW_TEXT() {
            return PREVIEW_TEXT
        },
        PREVIEW_IMAGE() {
            return PREVIEW_IMAGE
        },
        PREVIEW_AUDIO() {
            return PREVIEW_AUDIO
        },
        PREVIEW_VIDEO() {
            return PREVIEW_VIDEO
        },
        canShowPreview,
        ENDPOINT() {
            return ENDPOINT
        },
    },
    async mounted() {
        try {
            this.loading = true;
            if (this.fileType.startsWith("text/")) {
                this.content = await RequestGETText(this.source);
            }
        } catch (error) {
            this.$show('Error loading file preview: ' + error.message);
        } finally {
            this.loading = false;
        }
    },
    computed: {
        source() {
            return this.ENDPOINT() + '/permanent/' + this.fileId;
        },
    },
    data() {
        return {
            content: "",
            loading: false,
        }
    },
    props: {
        fileType: String,
        fileId: Number,
        size: Number
    }
}
</script>

<template>
    <div class="wrapper" v-if="canShowPreview(fileType) != PREVIEW_TEXT()">
        <img class="preview" v-if="canShowPreview(fileType) == PREVIEW_IMAGE()" :src="source">
        <video class="preview" v-if="canShowPreview(fileType) == PREVIEW_VIDEO()" :src="source" controls></video>
        <audio class="preview" v-if="canShowPreview(fileType) == PREVIEW_AUDIO()" style="width: 50vw" :src="source" controls></audio>
    </div>
    <div class="wrapper" v-else>
        <LoadingOverlay :loading="loading" :dimming="false"/>
        <pre v-if="this.content && size < 2 * 1024 * 1024" v-highlightjs="content"><code>{{ content }}</code></pre>
        <pre v-else>{{ content }}</pre>
    </div>
</template>

<style scoped>
.wrapper {
    width: 100%;
    min-height: 6em;
}

.preview {
    display: block;
    max-width: 80vw;
    max-height: 70vh;
    margin-left: auto;
    margin-right: auto;
    object-fit: cover;
}
</style>