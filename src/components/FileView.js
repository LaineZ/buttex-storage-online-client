import {canEdit, RequestGET} from "../helpers/http.js";
import Modal from "./Modal.vue";
import FileInfo from "./FileInfo.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import {
    ACCESS_LEVEL_USER,
    ENDPOINT,
    EXTENSION_MAPPING_ICONS, SORT_LAST_MODIFIED, SORT_NAME,
    SORT_NONE, SORT_SIZE, SORT_UPLOAD_DATE, SORT_AUTHOR
} from "../helpers/consts.js";
import UserButton from "./UserButton.vue";
import {useAuthStore} from "../store/auth.js";
import FileDrop from "./FileDrop.vue";
import UploadBin from "./UploadBin.vue";
import CreateDirectoryModal from "./CreateDirectoryModal.vue";
import ContextMenu from "./ContextMenu.vue";
import RenameModal from "./RenameModal.vue";
import {canShowPreview, fmtDate, formatBytes} from "../helpers/converterHelper.js";
import * as Api from "../helpers/api.js";
import {setUserAvatar} from "../helpers/api.js";
import FileViewTile from "./FileViewTile.vue";
import FilePreview from "./FilePreview.vue";

export default {
    name: "FileView",
    components: {
        FilePreview,
        FileViewTile,
        RenameModal,
        ContextMenu,
        CreateDirectoryModal,
        UploadBin,
        FileDrop,
        UserButton,
        LoadingOverlay,
        FileInfo,
        Modal,
    },
    data() {
        return {
            loading: false,
            startLoading: false,
            view: localStorage.getItem("view") ?? 1,
            currentSort: -1,
            reverseSort: false,
            selectedFileId: 0,
            selectedDirectoryId: 0,
            history: [],
            currentTraversal: 0,
            directories: [],
            currentDirectoryOwnerId: 0,
            files: {
                data: {
                    files: [],
                    directories: [],
                }
            },
        };
    },
    watch: {
        currentTraversal: function(newValue, _) {
            window.location.hash = newValue;
        }
    },
    props: {
        width: {
            type: Number,
            value: 100,
        }
    },
    computed: {
        haveFiles() {
            return this.files &&
                (this.files.data.directories.length > 0 ||this.files.data.files.length > 0);
        },
        havePermission() {
            const authStore = useAuthStore();
            return authStore.access_level >= ACCESS_LEVEL_USER;
        },

        havePermissionCreateDirectory() {
            return canEdit(this.currentDirectoryOwnerId);
        },

        contextMenuDirectoryItems() {
            const menu = [
                {
                    name: 'Open',
                    icon: 'fa-angle-right'
                },
                {
                    name: 'Make hidden',
                    icon: 'fa-eye'
                },
                {},
                {
                    name: 'Delete',
                    icon: 'fa-trash',
                    critical: true
                }
            ];

            const dir = this.getDirectoryInfoById(this.selectedDirectoryId);

            if (dir) {
                menu[1].name = dir.hidden ? "Set visible" : "Set hidden";
            }

            if (!canEdit(this.currentDirectoryOwnerId)) {
                menu.pop();
                menu.pop();
                menu.pop();
            }
            return menu;
        },

        contextMenuBackgroundItems() {
            const menu = [];

            if (this.havePermissionCreateDirectory) {
                menu.push({
                    name: 'Create directory',
                    icon: 'fa-folder'
                });
            }

            menu.push({
                name: 'Refresh',
                icon: 'fa-refresh'
            })

            return menu;
        },

        contextMenuFileItems() {
            const menu = [
                {
                    name: 'Download',
                    icon: 'fa-cloud-download',
                    id: 0,
                },
                {},
                {
                    name: 'Rename',
                    icon: 'fa-i-cursor',
                    id: 2,
                },
                {
                    name: 'Properties',
                    icon: 'fa-cogs',
                    id: 3
                },
                {
                    name: 'Copy URL',
                    icon: 'fa-link',
                    id: 4
                }
            ];

            const file = this.getFileInfoById(this.selectedFileId);
            const authStore = useAuthStore();

            if (authStore.access_level > -1 && file && file.type.startsWith("image/")) {
                menu.push({
                    name: 'Set as user profile image',
                    icon: 'fa-image',
                    id: 5
                })
            }

            menu.push({})

            menu.push({
                name: 'Delete',
                icon: 'fa-trash',
                critical: true,
                id: 1,
            });


            if (!canEdit(this.currentDirectoryOwnerId)) {
                menu.splice(1, 2);
                menu.splice(menu.length - 2, 2);
            }

            return menu;
        }
    },
    async mounted() {
        const file = window.location.hash.substring(1);

        if (file) {
            this.currentTraversal = Number(file);
        }

        await this.getFiles();
        const authStore = useAuthStore();

        window.addEventListener("hashchange", async () => {
            const file = window.location.hash.substring(1);
            if (file) {
                this.currentTraversal = Number(file);
            }
            await this.getFiles();
        });
    },
    methods: {
        fmtDate,
        formatBytes,
        mapIcon(file_name) {
            const ext = file_name.split('.').pop()

            if (EXTENSION_MAPPING_ICONS[ext] !== undefined) {
                return EXTENSION_MAPPING_ICONS[ext]
            } else {
                return "fa-file-o";
            }
        },

        getFileInfoById(id) {
            return this.files.data.files.find(x => x.id == id);
        },

        getDirectoryInfoById(id) {
            return this.files.data.directories.find(x => x.id == id);
        },

        async handleFileContextMenuItemClick(item) {
            const info = this.getFileInfoById(this.selectedFileId);
            switch (item) {
                case 0:
                    window.location.href = ENDPOINT + "/data/" + info.name + "?download=1";
                    break;
                case 1:
                    const choice = await this.$refs.modalDelete.openAsync(
                        "Proceed with file deletion? Once done, it's like closing Pandora's box – no turning back.");
                    if (choice == 0) {
                        await this.deleteFile(this.selectedFileId);
                    }
                    break;
                case 2:
                    this.$refs.renameModal.open(info.name);
                    break;
                case 3:
                    await this.openFileInfo(this.selectedFileId);
                    break;
                case 4:
                    await navigator.clipboard.writeText(encodeURI(this.getFileInfoById(this.selectedFileId).url));
                    break;
                case 5:
                    await setUserAvatar(info.permanent_url);
                    this.$show("Avatar was set successfully");
                    break;
            }
        },

        sortByNamedProperty(name) {
            if (!this.reverseSort) {
                this.files.data.directories.sort((a, b) => a[name].localeCompare(b[name]));
                this.files.data.files.sort((a, b) => a[name].localeCompare(b[name]));
            } else {
                this.files.data.directories.sort((a, b) => b[name].localeCompare(a[name]));
                this.files.data.files.sort((a, b) => b[name].localeCompare(a[name]));
            }
        },

        sortByNumericProperty(name) {
            if (!this.reverseSort) {
                this.files.data.directories.sort((a, b) => a[name] - b[name]);
                this.files.data.files.sort((a, b) => a[name] - b[name]);
            } else {
                this.files.data.directories.sort((a, b) => b[name] - a[name]);
                this.files.data.files.sort((a, b) => b[name] - a[name]);
            }
        },

        sort(sort) {
            if (this.currentSort == sort) {
                this.reverseSort = !this.reverseSort;
            }

            this.currentSort = sort;

            switch (this.currentSort) {
                case SORT_NONE:
                    // do nothing
                    break;
                case SORT_SIZE:
                    this.sortByNumericProperty("size");
                    break;
                case SORT_NAME:
                    this.sortByNamedProperty("name");
                    break;
                case SORT_AUTHOR:
                    this.sortByNamedProperty("user_name");
                    break;
                case SORT_UPLOAD_DATE:
                    this.sortByNumericProperty("creation_time");
                    break;
                case SORT_LAST_MODIFIED:
                    this.sortByNumericProperty("modification_time");
                    break;
            }
        },

        async handleDirectoryContextMenuItemClick(item) {
            switch (item) {
                case 0:
                    await this.openFolder(this.selectedDirectoryId);
                    break;
                case 1:
                    await this.makeDirectoryHidden(this.selectedDirectoryId);
                    break;
                case 3:
                    let choice = await this.$refs.modalDelete.openAsync("Really delete directory? Make sure it's the path you want to tread.");

                    if (choice == 0)
                        await this.deleteDirectory(this.selectedDirectoryId);

                    break;
            }
        },

        async handleBackgroundContextMenuItemClick(item) {
            switch (item) {
                case 0:
                    await this.createDirectory();
                    break;

                case 1:
                    await this.getFiles();
                    break;
            }
        },

        async createDirectory() {
            await this.$refs.createDirModal.open(this.currentTraversal);
        },

        async uploadFile() {

        },

        async goToDirectory(desiredIndex) {
            this.loading = true;
            const path = this.directories.slice(1, desiredIndex + 1);
            const request = await RequestGET("/api/storage/get_directory_id", {
                path: "/" + path.join("/")
            });

            await this.openFolder(request.data.directory_id || 0);
            this.loading = false;
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
                        parent_directory_id: this.currentTraversal,
                        directory_id: this.currentTraversal,
                    }
                }

                this.files = await RequestGET("/api/storage/get_files_list", request);
                const directoryPath = await RequestGET('/api/storage/get_directory_path', request);
                const split = directoryPath.data.path.split("/");

                split[0] = "root";

                this.directories = split;
                clearTimeout(loadingTimeout);
            } catch (error) {
                this.$show(error);
            }
            this.loading = false;
            this.startLoading = false;
        },

        async openFolder(directory_id) {
            for (const directory of this.files.data.directories) {
                if (directory.id == directory_id) {
                    this.currentDirectoryOwnerId = directory.user_id;
                    document.title = `${directory.name} | файловое хранилишя buttex`;
                    break;
                }
            }

            if (this.currentTraversal !== directory_id) {
                this.history.push(this.currentTraversal);
                this.currentTraversal = directory_id;
                await this.getFiles();
            }
        },

        async deleteFile(file_id) {
            await Api.deleteFile(this, file_id);
            await this.getFiles();
        },

        async makeDirectoryHidden(directory_id) {
            const hidden = this.getDirectoryInfoById(directory_id).hidden;
            await Api.setDirectoryHiddenStatus(this, directory_id, !hidden);
            await this.getFiles();
        },

        async deleteDirectory(directory_id) {
            await Api.deleteDirectory(this, directory_id);
            await this.getFiles();
        },

        async fileEditDialogResponse() {
            await this.$refs.modalFileInfo.close();
            await this.getFiles();
        },

        async goBack() {
            if (this.currentTraversal > 0) {
                this.currentTraversal = this.history.pop();
                await this.getFiles();
            }
        },

        openDirectoryContextMenu(event, directory_id) {
            this.$refs.contextMenuFile.hideContextMenu();
            this.$refs.contextMenuBackground.hideContextMenu();

            this.selectedDirectoryId = directory_id;
            this.$refs.contextMenuDirectory.openAtMouse(event);
        },

        openFileContextMenu(event, file_id) {
            this.$refs.contextMenuDirectory.hideContextMenu();
            this.$refs.contextMenuBackground.hideContextMenu();

            this.selectedFileId = file_id;
            this.$refs.contextMenuFile.openAtMouse(event);
        },

        openBackgroundContextMenu(event) {
            this.$refs.contextMenuFile.hideContextMenu();
            this.$refs.contextMenuDirectory.hideContextMenu();

            this.$refs.contextMenuBackground.openAtMouse(event);

        },


        handleOpenUrl(response) {
            if (response == 0) {
                window.open(ENDPOINT + "/data/" + this.getFileInfoById(this.selectedFileId).url).focus();
            }
        },

        async openFilePreview(file_id) {
            const file = this.getFileInfoById(file_id);
            if (canShowPreview(file.type) != 0) {
                this.selectedFileId = file_id;
                this.$refs.modalFilePreview.open();
            } else {
                await this.openFileInfo(file_id);
            }
        },

        async openFileInfo(file_id) {
            this.selectedFileId = file_id;
            this.$refs.modalFileInfo.open();
            await this.$nextTick(() => {
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
        },

        switchView() {
            this.view == 0 ? this.view = 1 : this.view = 0;
            localStorage.setItem("view", this.view);
        }
    }
}