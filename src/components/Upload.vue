<template>
    <div class="upload">
        <div style="display: flex">
            <div>
                <i class="fa fa-file"></i> {{ fileName }}
            </div>
            <div style="margin-left: auto; text-align: right;">
                <a v-if="!file.finish && file.error" class="error"><i class="fa fa-times error"></i> Upload error</a>
                <button class="cancel" @click="this.$emit('delete')"><i class="fa fa-times-rectangle"></i></button>
            </div>
        </div>
        <div>
            <div class="progress-bar">
                <div class="progress-bar-filled" :style="{ width: `${percentage}%` }"></div>
            </div>
            <div class="download-status">
              <small><i class="fa fa-bars"></i> {{ percentage }}% {{ formattedBytesProgress }} / {{ formattedBytesTotal}}</small>
              <small><i class="fa fa-bar-chart" aria-hidden="true"></i> {{ formattedSPEEEEEEEEEEEEEEEEEEEEEEEEEEEED }}/s</small>
            </div>
        </div>
    </div>
</template>
<script>
import {formatBytes} from "../helpers/converterHelper.js";

export default {
    name: 'upload',
    props: {
        file: {
            type: Object,
        },
    },
    emits: ["delete"],
    computed: {
        percentage() {
            return Math.floor(this.file.progress / this.file.total * 100) || 0;
        },

        formattedBytesProgress() {
            return formatBytes(this.file.progress)
        },

        formattedBytesTotal() {
            return formatBytes(this.file.total)
        },

        formattedSPEEEEEEEEEEEEEEEEEEEEEEEEEEEED() {
          return formatBytes(this.file.speed);
        },

        fileName() {
          return this.file.formData.get('file').name;
        },
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

.download-status {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
}

.progress-bar-filled {
    position: absolute;
    background-color: var(--fg3);
    height: 16px;
    transition: width 0.2s;
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

.error {
    color: #d38585;
    margin-right: 10px;
}

.cancel:hover {
    color: #d38585;
}

</style>