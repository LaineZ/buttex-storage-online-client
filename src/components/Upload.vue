<template>
    <div class="upload">
        <div style="display: flex">
            <div>
                <i class="fa fa-file"></i> {{ name }}
            </div>
            <div style="margin-left: auto; text-align: right;">
                <button class="cancel" @click="this.$emit('delete')"><i class="fa fa-times-rectangle"></i></button>
                <i class="fa fa-times" v-if="error"> Upload error</i>
            </div>
        </div>
        <div>
            <div class="progress-bar">
                <div class="progress-bar-filled" :style="{ width: `${getPercantage}%` }"></div>
            </div>
            <small>{{ getPercantage }}% {{ getFormattedBytesProgress }} / {{ getFormattedBytesTotal}}</small>
        </div>
    </div>
</template>
<script>
import {formatBytes} from "../helpers/converterHelper.js";

export default {
    name: 'upload',
    props: {
        name: {
            type: String,
        },
        progress: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            default: 0,
        },
        error: {
            type: Boolean,
            default: false,
        }
    },
    emits: ["delete"],
    computed: {
        getPercantage() {
            return Math.floor(this.progress / this.total * 100) || 0;
        },


        getFormattedBytesProgress() {
            return formatBytes(this.progress)
        },

        getFormattedBytesTotal() {
            return formatBytes(this.total)
        },

        getFormattedSpeed() {
            return formatBytes(this.speed)
        }
    }

}
</script>
<style scoped>

.upload {
    margin-bottom: 10px;
}

.progress-bar {
    margin-top: 10px;
    position: relative;
    width: 100%;
    background-color: var(--bg);
    height: 16px;
}

.progress-bar-filled {
    position: absolute;
    background-color: var(--fg3);
    height: 16px;
}

.cancel {
    width: 16px;
    height: 16px;
    padding: 2px;
    text-align: center;
    margin: 4px 4px 4px auto;
    color: var(--fg);
    background-color: transparent;
}

.cancel:hover {
    color: #d38585;
}

</style>