<script>
import {formatBytes, mapIcon} from "../helpers/converterHelper.js";
import {ENDPOINT} from "../helpers/consts.js";

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
        },
        ENDPOINT() {
            return ENDPOINT;
        }
    },
}
</script>

<template>
    <div class="tile" :class="entry.hidden ? 'hidden' : ''" v-if="isDirectory" v-bind="$attrs">
        <i class="fa fa-folder-o fa-3x table-icon-directory" aria-hidden="true"></i> {{ entry.name }}
    </div>
    
    <div class="tile" v-else v-bind="$attrs">
        <div
            :class="entry.hidden ? 'hidden' : ''"
            v-if="entry.has_preview"
            class="tile-image"
            :style="{
                'background-image': `url('${ENDPOINT}/api/storage/get_file_preview?file_id=${entry.id}')`
            }"
        />
       
        <i v-else class="fa fa-3x table-icon-file" :class="mapIcon(entry.type)" aria-hidden="true"></i>
       
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
    
    padding: 8px;
    
    border: 1px solid transparent;
    border-radius: 5px;
    
    display: flex;
    gap: 12px;
    place-items: center;
    
    cursor: pointer;
    
    transition: transform 0.1s;
}

.tile-image {
    width: 44px;
    height: 48px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
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
    color: var(--fg5);
}

.tile:hover {
    background-color: var(--bg4);
    border-color: var(--bg5);
    
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.tile:active {
    transform: scale(0.985);
}

.table-icon-file {
    color: var(--file);
}

.table-icon-directory {
    color: var(--directory);
}

@media (max-width: 700px) {
    .tile {
        width: 100%;
        max-width: none;
        min-width: auto;
    }
}
</style>