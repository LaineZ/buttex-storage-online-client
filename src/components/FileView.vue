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
          <button  v-if="havePermissionCreateDirectory" @click="$refs.createDirModal.open(currentTraversal)" title="Create directory">
              <i class="fa fa-folder"></i>
          </button>
          <div class="path">
              <div v-for="(directory, index) in directories" class="directory-traversal">
                <p @click="goToDirectory(index)">{{ directory }}<i v-if="directories.length > 1 && index != directories.length - 1" class="fa fa-caret-right"></i></p>
              </div>
          </div>
          <user-button style="margin-left: auto; margin-right: 20px;"></user-button>
      </div>
      <div class="view">
          <LoadingOverlay :loading="loading" :dimming="true"/>
          <p v-if="!haveFiles && !this.startLoading">
              <img alt="empty folder" width="64" src="../assets/folder.svg">
              <br>
              This directory are emptier than a ghost town
          </p>

          <ul v-if="view == 0">
              <li v-for="folder in files.data.directories" @click="openFolder(folder.id)"><i class="fa fa-folder-o" aria-hidden="true"></i> {{ folder.name }}</li>
              <li v-for="file in files.data.files" @click="openFileInfo(file.id)"><i class="fa" :class="mapIcon(file.type)" aria-hidden="true"></i> {{ file.name }}</li>
          </ul>

          <div v-if="view == 1" class="tiles">
              <div class="tile" v-for="folder in files.data.directories" @click="openFolder(folder.id)"
                   @contextmenu.prevent="openDirectoryContextMenu($event, folder.id)">
                  <i class="fa fa-folder-o fa-3x" aria-hidden="true"></i> {{ folder.name }}
              </div>
              <div class="tile" v-for="file in files.data.files" @click="openFileInfo(file.id)" @contextmenu.prevent="openFileContextMenu($event, file.id)">
                  <img alt="file" width="41" v-if="file.has_preview == 1" :src="'https://storage.buttex.ru/api/storage/get_file_preview?file_id=' + file.id">
                  <i v-else class="fa fa-3x" :class="mapIcon(file.type)" aria-hidden="true"></i>
                  {{ file.name }}
              </div>
          </div>
      </div>
  </div>
    <modal ref="modalFileInfo" :buttons="buttonsEdit" @response="fileEditDialogResponse">
        <file-info ref="fileInfo"></file-info>
    </modal>
    <modal ref="modalFileDelete" :buttons="['Yes', 'No']" @response="deleteFileDialogResponse"></modal>
    <modal ref="modalDirectoryDelete" :buttons="['Yes', 'No']" @response="deleteDirectoryDialogResponse"></modal>
    <modal ref="modalError"></modal>
    <file-drop v-if="havePermission" @dropFile="fileDrop"></file-drop>
    <upload-bin v-if="havePermission" ref="uploadBin" @upload="getFiles" :directory-id="currentTraversal"></upload-bin>
    <create-directory-modal ref="createDirModal" :directories="files.data.directories"  @created="getFiles"></create-directory-modal>
    <rename-modal ref="renameModal" @updated="getFiles" :entity-id="this.selectedFileId" :is-directory="false"></rename-modal>
    <context-menu ref="contextMenuFile" @itemClick="handleFileContextMenuItemClick" :items="[
        {
            name: 'Open file',
            icon: 'fa-file'
        },
        {
            name: 'Delete',
            icon: 'fa-trash'
        },
        {
            name: 'Rename',
            icon: 'fa-i-cursor'
        },
        {
            name: 'Properties',
            icon: 'fa-cogs'
        },
    ]"></context-menu>
    <context-menu ref="contextMenuDirectory" @itemClick="handleDirectoryContextMenuItemClick" :items="[
        {
            name: 'Open',
            icon: 'fa-angle-right'
        },
        {
            name: 'Delete',
            icon: 'fa-trash'
        }
    ]"></context-menu>
</template>
<script src="./FileView.js"></script>

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

    .directory-traversal {
        color: var(--fg);
        height: 36px;
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
        color: var(--fg3);
        margin-left: 10px;
        margin-right: 10px;
    }

    .path {
        background-color: var(--bg3);
        flex: 1;
        margin-left: 10px;
        margin-right: 10px;
        padding-left: 10px;
        padding-right: 10px;
        height: 32px;
        display: flex;
        place-items: center;
    }

    p {
        padding-top: 20%;
        text-align: center;
        color: var(--fg3);
    }
    
    @media (max-width: 600px) {
        .path {
            display: none;
        }
    }
</style>