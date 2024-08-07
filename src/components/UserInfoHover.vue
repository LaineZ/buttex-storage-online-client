<template>
    <div class="overlay" v-if="show" @click="close">
        <div class="main" :style="position" @click.stop ref="hoverInfo">
            <div style="position: relative">
                <LoadingOverlay :loading="loading" :dimming="true"/>
                <div class="container">
                    <div class="user">
                        <div v-if="avatarUrl !== null" class="avatar" :style="{'background-image': `url('${avatarUrl}')`}" @click="changeAvatar">
                            <i class="fa fa-4x fa-pencil avatar-hover"></i>
                        </div>
                        <i v-else class="fa fa-4x fa-user"></i>
                        <p style="text-align: center">{{ accessLevel }}</p>
                    </div>
                    <div>
                        <h2>{{ nickname }}</h2>
                        <p>{{ name }}</p>
                    </div>
                </div>
                <div class="bottom">
                    <button @click="openProfile"><i class="fa fa-user"></i> Profile</button>
                    <button @click="this.openDocumentationPage()"><i class="fa fa-book"></i> Documentation</button>
                    <button class="logout-button" @click="logout"><i class="fa fa-power-off"></i> Logout</button>
                </div>
            </div>
        </div>
    </div>
    <modal ref="modalProfile" :buttons="[]">
        <profile></profile>
    </modal>

    <change-avatar-modal ref="modalAvatarUrl"/>
</template>

<script>
import {useAuthStore} from "../store/auth.js";
import {ref, watchEffect} from "vue";
import {ACCESS_LEVEL_ADMIN, ACCESS_LEVEL_MODERATOR, ACCESS_LEVEL_USER, ENDPOINT} from "../helpers/consts.js";
import {RequestGET} from "../helpers/http.js";
import Modal from "./Modal.vue";
import ChangeAvatarModal from "./ChangeAvatarModal.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import Profile from "./Profile.vue";

export default {
    name: "UserInfoHover",
    components: {LoadingOverlay, Modal, ChangeAvatarModal, Profile},
    data() {
        return {
            name: "",
            nickname: "",
            accessLevel: "",
            avatarUrl: null,
            id: 0,
            position: null,
            show: false,
            changeNickname: false,
            loading: false,
            width: 100,
            triggerElement: null,
        };
    },

    mounted() {
        const authStore = useAuthStore();
        const authState = ref(authStore);

        watchEffect(() => {
            this.name = authState.value.name;
            this.id = authState.value.id;
            this.nickname = authState.value.nickname;
            this.avatarUrl = authState.value.avatar_url;
            this.width = authState.value.width;

            switch (authState.value.access_level) {
                case ACCESS_LEVEL_USER:
                    this.accessLevel = "User";
                    break;
                case ACCESS_LEVEL_MODERATOR:
                    this.accessLevel = "Moderator";
                    break;
                case ACCESS_LEVEL_ADMIN:
                    this.accessLevel = "Admin";
                    break;
            }
        });
    },

    methods: {
        recomputeSize() {
            const info = this.$refs.hoverInfo;

            if (info) {
                const rect = this.triggerElement.getBoundingClientRect();
                const triggerWidth = this.triggerElement.offsetWidth;
                const tooltipWidth = info.offsetWidth + 5;

                let left = rect.left + window.scrollX - triggerWidth;


                if (left + tooltipWidth > window.innerWidth) {
                    left = window.innerWidth - tooltipWidth;
                }

                this.position = {
                    top: `${rect.top + window.scrollY + this.triggerElement.offsetHeight + 5}px`,
                    left: `${left}px`
                };
            }
        },

        openProfile() {
            this.$refs.modalProfile.open();
            this.close();
        },

        openUserInfo(triggerElement) {
            this.show = true;
            this.triggerElement = triggerElement;
            this.$nextTick(() => {
                this.recomputeSize();

                window.addEventListener("resize", () => {
                    this.recomputeSize();
                });
            });
        },

        async logout() {
            localStorage.setItem("token", "");
            localStorage.setItem("user_id", "");
            window.location.reload();
        },

        async updateNickname() {
            this.loading = true;
            const authStore = useAuthStore();

            try {
                await RequestGET("/api/users/set_nickname", {
                    new_nickname: this.nickname,
                });
                authStore.setNick(this.nickname);
                this.changeNickname = false;

            } catch (e) {
                this.$show("Unable to set nickname: " + e + " please try again");
            }
            this.loading = false;
        },

        changeAvatar() {
            this.$refs.modalAvatarUrl.open(this.avatarUrl);
        },

        openDocumentationPage() {
            window.open(ENDPOINT + "/api/docs", "_blank").focus();
        },

        close() {
            this.show = false;
        }
    }
}
</script>

<style scoped>

.overlay {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    z-index: 49;
    position: fixed;
}

.main {
    position: fixed;
    place-items: center;
    z-index: 9999999;
    background-color: rgba(26, 26, 36, 0.9);
    backdrop-filter: blur(4px);
    box-shadow: 0 0 30px rgba(14, 14, 18, 0.7);
}

.main button {
    width: 100%;
    margin-top: 5px;
}

.container {
    display: flex;
    padding: 20px;
}

.logout-button {
    background-color: #755555;
}

.logout-button:hover {
    background-color: #211616;
}

.user {
    text-align: center;
    margin-right: 20px;
}

.avatar-hover {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    transition: 0.2s opacity;
    display: block;
    cursor: pointer;
}

.avatar-hover:hover {
    opacity: .5;
}
</style>