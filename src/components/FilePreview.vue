<script>
import {ENDPOINT, PREVIEW_AUDIO, PREVIEW_IMAGE, PREVIEW_TEXT, PREVIEW_VIDEO} from "../helpers/consts.js";
import {RequestGETText} from "../helpers/http.js";
import {canShowPreview} from "../helpers/converterHelper.js";
import SshPre from 'simple-syntax-highlighter'
import 'simple-syntax-highlighter/dist/sshpre.css'
import LoadingOverlay from "./LoadingOverlay.vue";

export default {
    name: "FilePreview",
    components: {LoadingOverlay, SshPre },
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
        this.loading = true;
        if (this.fileType.startsWith("text/")) {
            this.content = await RequestGETText(this.source);
        }
        this.loading = false;
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
    }
}
</script>

<template>
    <div class="wrapper">
        <LoadingOverlay :loading="loading" :dimming="false"/>
        <pre v-if="canShowPreview(fileType) == PREVIEW_TEXT()" v-highlightjs="content"><code>{{ content }}</code></pre>
        <img class="preview" v-if="canShowPreview(fileType) == PREVIEW_IMAGE()" :src="source">
        <video class="preview" v-if="canShowPreview(fileType) == PREVIEW_VIDEO()" :src="source" controls></video>
        <audio class="preview" v-if="canShowPreview(fileType) == PREVIEW_AUDIO()" style="width: 50vw" :src="source" controls></audio>
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