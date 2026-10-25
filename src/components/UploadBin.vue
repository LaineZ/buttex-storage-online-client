<template>
    <div class="main" v-if="files.length > 0">
        <div class="header" @click="collapsed = !collapsed" :style="{ opacity: collapsed ? 0.5 : 1 }">
            <i class="fa fa-upload"></i> Uploads in progress
        </div>
        <div class="content" v-show="!collapsed">
            <upload v-for="(file, index) in files" :file="file" @delete="deleteFile(index)"></upload>
        </div>
        <modal ref="fileExistModal" :buttons="['Overwrite', 'Overwrite for all', 'Skip', 'Skip all']">
        </modal>
    </div>
</template>

<script>
import Upload from "./Upload.vue";
import Modal from "./Modal.vue";
import FileDrop from "./FileDrop.vue";
import {ENDPOINT} from "../helpers/consts.js";
import {RequestGET} from "../helpers/http.js";
import FileInfo from "./FileInfo.vue";
import {UploadingRequests} from "../helpers/uploading.ts";
import * as Api from "../helpers/api.js";
import {nextTick} from "vue";

export default {
    name: "UploadBin",
    components: {FileInfo, FileDrop, Upload, Modal},
    emits: ["upload"],
    data() {
        return {
            collapsed: false,
            confirmForAll: false,
            files: [],
            promises: [],
        }
    },
    props: {
        directoryId: {
            type: Number,
            default: 0,
        }
    },
    mounted() {
        window.addEventListener("paste", this.handlePaste);
    },
    methods: {
        handlePaste(event) {
            const items = event.clipboardData.items;
            for (const item of items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile();

                    this.pushFiles([file]);
                }
            }
        },

        pushFiles(files, fromDrag = false) {
            if (fromDrag) {
                for (const file of files) {
                    this.files.push({
                        file: file[1],

                        progress: 0,
                        total: file[1].size,
                        error: false,
                        finish: false,
                        abortRequested: false
                    });
                }
            }
            else {
                for (const file of files) {
                    this.files.push({
                        file: file,

                        progress: 0,
                        startTime: Date.now(),
                        lastTime: Date.now(),
                        lastLoaded: 0,
                        speed: 0,
                        total: file.size,
                        error: false,
                        finish: false,
                        abortRequested: false
                    });
                }
            }

            this.uploadFiles();
        },

        async deleteFile(index) {
            this.files.abortRequested = true;

            await nextTick();

            this.files.splice(index, 1);
        },

		async uploadFile(index, file) {
            // Deleting existing file, because we can't overwrite it anymore
            // Maybe this should be automated in API itself
            if (file.id) {
                await Api.deleteFile(this, file.id);

                file.id = undefined
            }

			const result = await UploadingRequests.uploadByChunks(
				file.file,
				this.directoryId,
                () => !!file.abortRequested,
				(uploaded, speed) => {
					file.progress = uploaded;
					file.speed = speed;
				}
			);

			if (result) {
				this.$emit("upload");
				file.finish = true;
			}
			else {
				file.error = true;
			}

			return index;
		},

        async uploadFiles() {
            let confirmForAll = false;
            let skipAll = false;

            for (let index = 0; index < this.files.length; index++) {
                const file = this.files[index];
                try {
                    let response = await RequestGET("/api/storage/get_file_id", {
                        path: file.file.name,
                        parent_directory_id: this.directoryId
                    });

                    let info = await RequestGET("/api/storage/get_file_info", {
                        file_id: response.data.file_id
                    });

                    if (skipAll) {
                        file.finish = true;
                        continue;
                    }

                    if (confirmForAll) {
                        file.id = response.data.file_id;
                        continue;
                    }

                    let choice = await this.$refs.fileExistModal.openAsync(`File '${info.data.name}' already exists. What you want to do?`);

                    switch (choice) {
                        case 0:
                            file.id = response.data.file_id;
                            break;
                        case 1:
                            file.id = response.data.file_id;
                            confirmForAll = true;
                            break;
                        case 2:
                            file.finish = true;
                            break;
                        case 3:
                            file.finish = true;
                            skipAll = true;
                            break;
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            this.files = this.files.filter(x => !x.finish);

            for (let index = 0; index < this.files.length; index++)
				this.promises.push(this.uploadFile(index, this.files[index]));

            this.resolvePromises();
        },

        resolvePromises() {
            Promise.allSettled(this.promises).then((results) => {
                const filesToRemove = results
                    .filter(result => result.status === 'fulfilled')
                    .map(result => result.value);

                filesToRemove.reverse().forEach(index => {
                    this.files.splice(index, 1);
                });

                this.promises = [];
            });
        }
    }
}
</script>

<style scoped>
.main {
    position: fixed;
    right: 0;
    bottom: 0;
    background-color: var(--bg4);
    width: 25vw;
    min-width: 200px;
    max-height: 100vh;
}

.header {
    padding: 10px;
    background-color: var(--bg9);
}

.content {
    padding: 10px;
    overflow-y: auto;
}

</style>
