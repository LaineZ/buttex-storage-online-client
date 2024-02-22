<template>
    <div class="main" v-if="files.length > 0">
        <div class="header" @click="collapsed = !collapsed" :style="{ opacity: collapsed ? 0.5 : 1 }">
            <i class="fa fa-upload"></i> Uploads in progress
        </div>
        <div class="content" v-show="!collapsed">
            <upload v-for="(file, index) in files" :file="file" @delete="deleteFile(index)"></upload>
        </div>
        <modal ref="fileExistModal" :buttons="['Overwrite content', 'Overwrite content for all', 'Skip', 'Skip all']">
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
    methods: {
        pushFiles(files, fromDrag = false) {
            console.log(files);

            if (!fromDrag) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const formData = new FormData();
                    formData.append('file', file);

                    this.files.push({
                        formData: formData,
                        progress: 0,
                        total: file.size,
                        error: false,
                        finish: false,
                        xhr: null
                    });
                }
            } else {
                for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file[1]);


                    this.files.push({
                        formData: formData,
                        progress: 0,
                        total: file[1].size,
                        error: false,
                        finish: false,
                        id: 0,
                        xhr: null
                    });
                }
            }

            this.uploadFiles();
        },

        deleteFile(index) {
            if (this.files[index].xhr) {
                this.files[index].xhr.abort();
            }
            return new Promise((resolve) => {
                this.$nextTick(() => {
                    this.files.splice(index, 1);
                    resolve();
                });
            });
        },
        async uploadFiles() {
            let confirmForAll = false;
            let skipAll = false;

            for (let index = 0; index < this.files.length; index++) {
                const file = this.files[index];
                try {
                    let response = await RequestGET("/api/storage/get_file_id", {
                        path: file.formData.get("file").name,
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

            for (let index = 0; index < this.files.length; index++) {
                const file = this.files[index];
                if (!file.xhr) {
                    file.xhr = new XMLHttpRequest();

                    const promise = new Promise((resolve, reject) => {
                        file.xhr.upload.addEventListener('progress', (event) => {
                            file.progress = event.loaded;
                            file.total = event.total;
                        });

                        file.xhr.onreadystatechange = () => {
                            if (file.xhr.readyState === XMLHttpRequest.DONE) {
                                if (file.xhr.status === 200) {
                                    this.$emit("upload");
                                    file.finish = true;
                                    resolve(index);
                                } else {
                                    file.error = true;
                                    reject(index);
                                }
                            }
                        };

                        file.xhr.onabort = () => {
                            file.finish = true;
                            resolve(index);
                        }
                    });

                    this.promises.push(promise);

                    if (file.id) {
                        file.xhr.open("POST", ENDPOINT +
                            "/api/storage/set_file_content?file_id=" + file.id);
                    } else {
                        file.xhr.open("POST", ENDPOINT +
                            "/api/storage/create_file?parent_directory_id=" + this.directoryId);
                    }

                    file.xhr.setRequestHeader("Authorization", localStorage.getItem('token'));
                    file.xhr.send(file.formData);
                }
            }
            this.resolvePromises();
        },

        resolvePromises() {
            Promise.allSettled(this.promises).then((results) => {
                const filesToRemove = results
                    .filter(result => result.status === 'fulfilled')
                    .map(result => result.value);

                filesToRemove.reverse().forEach((index) => {
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
    background-color: var(--bg2);
    width: 25vw;
    min-width: 200px;
    max-height: 100vh;
}

.header {
    padding: 10px;
    background-color: var(--bg3);
}

.content {
    padding: 10px;
    overflow-y: auto;
}

</style>