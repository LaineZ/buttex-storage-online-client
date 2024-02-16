<template>
  <div class="main">
      <div class="controls">
          <button @click="goBack" title="Go up" :disabled="currentTraversal == 0 || loading"><i class="fa fa-arrow-left"></i></button>
          <button @click="getFiles" title="Refresh listing" :disabled="startLoading"
                  :class="startLoading ? 'fa-spin' : ''"><i class="fa fa-refresh"></i></button>
          <button @click="view == 0 ? view = 1 : view = 0" title="Switch view">
              <i class="fa" :class="view == 0 ? 'fa-list' : 'fa-th-large'"></i>
          </button>
          <button  v-if="havePermission" title="Upload" class="upload-btn">
              <i class="fa fa-upload"></i>
              <input type="file" name="file" @change="fileDropButton" multiple >
          </button>
          <user-button style="margin-left: auto; margin-right: 20px;"></user-button>
      </div>
      <div class="view">
          <LoadingOverlay :loading="loading" :dimming="true"/>
          <p v-if="!haveFiles && !this.startLoading">
              <img width="64" src="../assets/folder.svg">
              <br>
              This directory are emptier than a ghost town
          </p>

          <ul v-if="view == 0">
              <li v-for="folder in files.data.directories" @click="openFolder(folder.id)"><i class="fa fa-folder-o" aria-hidden="true"></i> {{ folder.name }}</li>
              <li v-for="file in files.data.files" @click="openFileInfo(file.id)"><i class="fa" :class="mapIcon(file.type)" aria-hidden="true"></i> {{ file.name }}</li>
          </ul>

          <div v-if="view == 1" class="tiles">
              <div class="tile" v-for="folder in files.data.directories" @click="openFolder(folder.id)">
                  <i class="fa fa-folder-o fa-3x" aria-hidden="true"></i> {{ folder.name }}
              </div>
              <div class="tile" v-for="file in files.data.files" @click="openFileInfo(file.id)">
                  <img width="41" v-if="file.has_preview == 1" :src="'https://storage.buttex.ru/api/storage/get_file_preview?file_id=' + file.id">
                  <i v-else class="fa fa-3x" :class="mapIcon(file.type)" aria-hidden="true"></i>
                  {{ file.name }}
              </div>
          </div>
      </div>
  </div>
    <modal ref="modalFileInfo" :buttons="buttonsEdit" @response="fileEditDialogResponse">
        <file-info ref="fileInfo"></file-info>
    </modal>
    <modal ref="modalDelete" :buttons="['Yes', 'No']" @response="deleteDialogResponse"></modal>
    <modal ref="modalError"></modal>
    <file-drop v-if="havePermission" @dropFile="fileDrop"></file-drop>
    <upload-bin v-if="havePermission" ref="uploadBin" @upload="getFiles" :directory-id="currentTraversal"></upload-bin>
</template>

<script>
import {RequestGET} from "../helpers/http.js";
import Modal from "./Modal.vue";
import FileInfo from "./FileInfo.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import {ACCESS_LEVEL_MODERATOR, ACCESS_LEVEL_USER, EXTENSION_MAPPING_ICONS} from "../helpers/consts.js";
import UserButton from "./UserButton.vue";
import {useAuthStore} from "../store/auth.js";
import {ref} from "vue";
import FileDrop from "./FileDrop.vue";
import UploadBin from "./UploadBin.vue";

export default {
    name: "FileView",
    components: {
        UploadBin,
        FileDrop,
        UserButton,
        LoadingOverlay,
        FileInfo,
        Modal,
    },
    data() {
        return {
            username: '',
            password: '',
            loading: false,
            startLoading: false,
            view: 1,
            scale: '1x',
            selectedFileId: 0,
            history: [],
            currentTraversal: 0,
            userInfo: null,
            buttonsEdit: ['Save changes', 'Delete file', 'Cancel'],
            files: {
                data: {
                    files: [],
                    directories: [],
                }
            },
        };
    },
    computed: {
        haveFiles() {
            return this.files &&
                (this.files.data.directories.length > 0 ||this.files.data.files.length > 0);
        },
        havePermission() {
            const authStore = useAuthStore();
            return authStore.access_level >= ACCESS_LEVEL_USER;
        }
    },
    async mounted() {
        await this.getFiles();

        const authStore = useAuthStore();
        const authState = ref(authStore);

        if (authState.value.access_level <= ACCESS_LEVEL_MODERATOR) {
          this.buttonsEdit = ["Cancel"];
        }
    },
    methods: {
        mapIcon(file_name) {
            const ext = file_name.split('.').pop()

            if (EXTENSION_MAPPING_ICONS[ext] !== undefined) {
                return EXTENSION_MAPPING_ICONS[ext]
            } else {
                return "fa-file-o";
            }
        },
        async getFiles() {
            this.startLoading = true;
            try {
                let loadingTimeout = setTimeout(() => {
                this.loading = true;
                }, 200);
                let request = {};

                if (this.currentTraversal > 0) {
                    request = {
                        parent_directory_id: this.currentTraversal
                    }
                }
                this.files = await RequestGET("/api/storage/get_files_list", request);
                clearTimeout(loadingTimeout);
            } catch (error) {
                this.$refs.modalError.open("Unable to get file list:" + error.error.toString() || error.message.toString());
            }
            this.loading = false;
            this.startLoading = false;
        },
        async openFolder(directory_id) {
            if (this.currentTraversal !== directory_id) {
                this.history.push(this.currentTraversal);
                this.currentTraversal = directory_id;
                await this.getFiles();
            }
        },

        async deleteFile(file_id) {
          try {
              await RequestGET("/api/storage/delete_file", {
                  file_id: file_id
              });
          } catch (error) {
              this.$refs.modalError.open("Unable to delete file:" + error.message.toString() + "\nEnsure your permissions are correct");
          }
          await this.getFiles();
        },

        async fileEditDialogResponse(index) {
            switch (index) {
                case 0:
                    await this.$refs.fileInfo.saveChanges();
                    await this.getFiles();
                    break;
                case 1:
                    this.$refs.modalDelete.open("Proceed with file deletion? Once done, it's like closing Pandora's box – no turning back.");
                    break;
            }
        },

        async deleteDialogResponse(index) {
            if (index == 0) {
                await this.deleteFile(this.selectedFileId);
            }
        },

        async goBack() {
            if (this.currentTraversal > 0) {
                this.currentTraversal = this.history.pop();
                await this.getFiles();
            }
        },

        openFileInfo(file_id) {
          this.selectedFileId = file_id;
          this.$refs.modalFileInfo.open();
          this.$nextTick(() => {
            this.$refs.fileInfo.retriveFile(file_id);
          });
        },

        fileDrop(formData) {
            console.log(formData);
            this.$refs.uploadBin.pushFiles(formData, true);
        },

        fileDropButton(event) {
            const files = event.target.files;
            this.$refs.uploadBin.pushFiles(files);
        }
    }
}
</script>

<style scoped>
    .view {
        position: relative;
        min-height: calc(100vh - 40px);
    }
    
    .view ul {
        cursor: pointer;
    }

    .controls {
        width: 100%;
        background-color: var(--bg2);
        display: flex;
        place-items: center;
        position: sticky;
        top: 0;
        z-index: 2;
    }

    .controls button {
        background-color: transparent;
    }

    .controls button:hover {
        background-color: var(--fg3);
    }

    .tiles {
        display: flex;
        flex-wrap: wrap;
    }

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

    .tile:hover {
        background-color: var(--bg2);
    }

    .tile i, .tile img {
        margin-right: 10px;
    }

    .upload-btn {
        width: 32px;
        height: 36px;
        overflow: hidden;
        position: relative;
    }

    .upload-btn input {
        position: absolute;
        left: 0;
        opacity: 0;
    }

    p {
        padding-top: 20%;
        text-align: center;
        color: var(--fg3);
    }
</style>