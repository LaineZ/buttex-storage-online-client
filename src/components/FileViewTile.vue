<script>
import {formatBytes, mapIcon} from "../helpers/converterHelper.js";

export default {
    name: "FileViewTile",
    inheritAttrs: false,
    props: {
        entry: Object
    },
    methods: {
        formatBytes,
        mapIcon
    },
    computed: {
        // let's determine directory this or not
        isDirectory() {
            // directories does not have size and mime type
            return this.entry.size === undefined && this.entry.type === undefined;
        }
    },
}
</script>

<template>
    <div class="tile" v-if="isDirectory" v-bind="$attrs">
        <i class="fa fa-folder-o fa-3x" aria-hidden="true"></i> {{ entry.name }}
    </div>
    <div class="tile" v-else v-bind="$attrs">
        <div v-if="entry.has_preview" class="tile-image" :style="{ 'background-image': `url('https://storage.buttex.ru/api/storage/get_file_preview?file_id=${entry.id}')`}"></div>
        <i v-else class="fa fa-3x" :class="mapIcon(entry.type)" aria-hidden="true"></i>
        <div class="tile-summary">
            <p>{{ entry.name }}</p>
            <small>{{ formatBytes(entry.size) }}</small>
        </div>
    </div>
</template>

<style scoped>
.tile {
    width: 20%;
    max-width: 300px;
    min-width: 256px;
    height: 48px;
    padding: 10px;
    display: flex;
    place-items: center;
    cursor: pointer;
}

.tile-image {
    width: 44px;
    height: 48px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    margin-right: 10px;
}

.tile-summary {
    overflow: hidden;
    height: 100%;
}

.tile-summary p {
    text-align: left;
    color: var(--fg);
    margin: 0;
    padding: 0;
    line-height: 1.28;
    max-height: 2.5em;
    overflow: hidden;
}

.tile-summary small {
    color: var(--fg2);
}

.tile:hover {
    background-color: var(--bg2);
}

.tile i {
    margin-right: 10px;
}
</style>