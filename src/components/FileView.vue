<template>
    <div class="controls-and-view">
        <div class="controls">
            <button @click="goBack" title="Go up" :disabled="currentTraversal == 0 || loading"><i
                    class="fa fa-arrow-left"></i></button>
            <button @click="getFiles" title="Refresh listing" :disabled="startLoading"><i :class="startLoading ? 'fa-spin' : ''" class="fa fa-refresh"></i></button>
            
            <button @click="switchView" title="Switch view">
                <i class="fa" :class="view == 0 ? 'fa-list' : 'fa-th-large'"></i>
            </button>
            
            <button v-if="havePermission" title="Upload" class="upload-btn">
                <i class="fa fa-upload"></i>
                <input type="file" name="file" @change="fileDropButton" multiple>
            </button>
            
            <button v-if="havePermissionCreateDirectory" @click="createDirectory"
                    title="Create directory">
                <i class="fa fa-folder"></i>
            </button>
            
            <button @click="this.openDocumentationPage()" title="Documentation">
                <i class="fa fa-book"></i>
            </button>
            
            <div class="path">
                <div
                    v-for="(directory, index) in directories"
                    class="directory-traversal"
                >
                    <p @click="goToDirectory(index)">
                        {{ directory }}
                        
                        <i
                            v-if="directories.length > 1 && index != directories.length - 1"
                            class="fa fa-caret-right"
                        />
                    </p>
                </div>
            </div>
            
            <user-button style="margin-left: auto; margin-right: 20px;"></user-button>
        </div>
        
        <div class="view">
            <LoadingOverlay :loading="loading" :dimming="true"/>
            
            <template v-if="haveFiles">
                <table v-if="view == 0">
                    <tr class="not-show-on-phone">
                        <!-- check the consts in [src/helpers/consts.js] -->
                        <th @click="sort(1)"><i v-if="currentSort == 1" class="fa" :class="!reverseSort ? 'fa-caret-up' : 'fa-caret-down'"></i> Name</th>
                        <th @click="sort(2)"><i v-if="currentSort == 2" class="fa" :class="!reverseSort ? 'fa-caret-up' : 'fa-caret-down'"></i> Author</th>
                        <th @click="sort(3)"><i v-if="currentSort == 3" class="fa" :class="!reverseSort ? 'fa-caret-up' : 'fa-caret-down'"></i> Upload date</th>
                        <th @click="sort(4)"><i v-if="currentSort == 4" class="fa" :class="!reverseSort ? 'fa-caret-up' : 'fa-caret-down'"></i> Last Modified</th>
                        <th @click="sort(5)"><i v-if="currentSort == 5" class="fa" :class="!reverseSort ? 'fa-caret-up' : 'fa-caret-down'"></i> Size</th>
                    </tr>
                    
                    <tr v-for="folder in files.data.directories"
                        @contextmenu.prevent="openDirectoryContextMenu($event, folder.id)" @click="openFolder(folder.id)">
                        <td>
                            <i class="fa fa-folder-o" aria-hidden="true"></i> {{ folder.name }}
                        </td>
                        
                        <td class="not-show-on-phone">
                            {{ folder.user_nickname }}
                        </td>
                        
                        <td class="not-show-on-phone">
                            {{ fmtDate(folder.creation_time) }}
                        </td>
                        
                        <td class="not-show-on-phone">
                            -
                        </td>
                        
                        <td class="not-show-on-phone">
                            -
                        </td>
                    </tr>
                    
                    <tr v-for="file in files.data.files" @contextmenu.prevent="openFileContextMenu($event, file.id)"
                        @click="openFileInfo(file.id)">
                        <td>
                            <i class="fa" :class="mapIcon(file.type)" aria-hidden="true"></i> {{ file.name }}
                        </td>
                        <td class="not-show-on-phone">
                            {{ file.user_nickname }}
                        </td>
                        <td class="not-show-on-phone">
                            {{ fmtDate(file.creation_time) }}
                        </td>
                        <td class="not-show-on-phone">
                            {{ fmtDate(file.modification_time) }}
                        </td>
                        <td class="not-show-on-phone">
                            {{ formatBytes(file.size) }}
                        </td>
                    </tr>
                </table>
                
                <div
                    v-if="view == 1"
                    class="tiles"
                    @contextmenu.self="openBackgroundContextMenu($event)"
                >
                    <div class="tiles-items">
                        <FileViewTile
                            v-for="folder in files.data.directories"
                            :entry="folder"
                            @click="openFolder(folder.id)"
                            @contextmenu="openDirectoryContextMenu($event, folder.id)"
                        />
                        
                        <FileViewTile
                            v-for="file in files.data.files"
                            :entry="file"
                            @click="openFileInfo(file.id)"
                            @contextmenu="openFileContextMenu($event, file.id)"
                        />
                    </div>
                </div>
            </template>
            
            <div
                v-else-if="!haveFiles && !this.startLoading"
                class="directory-empty"
            >
                <p>
                    <img alt="empty folder" width="64" src="../assets/folder.svg">
                    <br>
                    This directory are emptier than a ghost town
                </p>
            </div>
        </div>
    </div>
    
    <modal ref="modalFileInfo" :buttons="[]">
        <file-info ref="fileInfo" @save="fileEditDialogResponse"></file-info>
    </modal>
    
    <modal ref="modalDelete" :buttons="['Yes', 'No']"></modal>
    <file-drop v-if="havePermission" @dropFile="fileDrop"></file-drop>
    <upload-bin v-if="havePermission" ref="uploadBin" @upload="getFiles" :directory-id="currentTraversal"></upload-bin>
    <create-directory-modal ref="createDirModal" :directories="files.data.directories"
                            @created="getFiles"></create-directory-modal>
    <rename-modal ref="renameModal" @updated="getFiles" :entity-id="this.selectedFileId"
                  :is-directory="false"></rename-modal>
    <context-menu ref="contextMenuFile" @itemClick="handleFileContextMenuItemClick" :items="contextMenuFileItems"></context-menu>
    <context-menu ref="contextMenuDirectory" @itemClick="handleDirectoryContextMenuItemClick" :items="contextMenuDirectoryItems"></context-menu>
    <context-menu ref="contextMenuBackground" @itemClick="handleBackgroundContextMenuItemClick" :items="contextMenuBackgroundItems"></context-menu>
</template>
<script src="./FileView.js"></script>

<style scoped>
.controls-and-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    overflow: hidden;
}

.view {
    width: 100%;
    
    flex-grow: 1;
    
    overflow-x: hidden;
    overflow-y: auto;
    
    display: flex;
    flex-direction: column;
    place-items: center;
    justify-content: center;
}

.view ul {
    cursor: pointer;
}

.controls {
    width: 100%;
    height: 40px;
    
    background-color: var(--bg4);
    display: flex;
    place-items: center;
    top: 0;
    z-index: 2;
}

.controls button {
    background-color: transparent;
    width: 32px;
    height: 100%;
}

.controls button:hover {
    background-color: var(--fg3);
    cursor: pointer;
}

.tiles {
    width: 100%;
    height: 100%;
}

.tiles-items {
    margin: 10px;
    
    width: 100%;
    
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.upload-btn {
    width: 32px;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.upload-btn input {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
}

.directory-traversal {
    color: var(--fg);
    height: 100%;
    place-items: center;
    display: flex;
}

.directory-traversal p {
    color: var(--fg);
    padding: 0;
    margin: 0;
    cursor: pointer;
}

.directory-traversal p:hover {
    color: var(--fg2);
}

.directory-traversal i {
    color: var(--fg6);
    
    margin-left: 10px;
    margin-right: 10px;
}

.path {
    height: 100%;
    
    margin: 0 10px 0 10px;
    padding: 0 10px 0 10px;
    
    /*border-radius: 5px;*/
    
    display: flex;
    flex: 1;
    place-items: center;
    
    background-color: var(--bg6);
}

p {
    padding-top: 20%;
    text-align: center;
    color: var(--fg3);
}

table {
    width: 100%;
    height: 100%;
}

table tr:hover {
    background-color: var(--bg5);
}

@media (max-width: 600px) {
    .path {
        display: none;
    }
}
</style>