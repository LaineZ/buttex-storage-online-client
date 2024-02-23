<template>
    <div class="overlay" v-if="show" @click="close">
        <div class="main" :style="position" @click.stop ref="hoverInfo">
            <div style="position: relative">
                <LoadingOverlay :loading="loading" :dimming="true"/>
                <div class="container">
                    <div class="user">
                        <img v-if="avatarUrl !== null" class="avatar" :src="avatarUrl"/>
                        <i v-else class="fa fa-4x fa-user"></i>
                        <p style="text-align: center">{{ accessLevel }}</p>
                    </div>
                    <div>
                        <h2>{{ name }}</h2>
                        <input @input="checkNickname" type="text" v-model="nickname" placeholder="Nickname...">
                    </div>
                </div>
                <div class="bottom">
                    <div style="display: flex">
                        <button class="nick-control-button" style="width: 50%; margin-right: 5px" v-if="changeNickname"
                                @click="updateNickname"><i class="fa fa-check"></i> Apply nickname
                        </button>
                        <button class="nick-control-button" style="width: 50%;" v-if="changeNickname" @click="resetNickname"><i class="fa fa-refresh"></i>
                             Reset nickname
                        </button>
                    </div>
                    <button class="logout-button" @click="logout"><i class="fa fa-power-off"></i> Logout</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {useAuthStore} from "../store/auth.js";
import {ref, watchEffect} from "vue";
import {ACCESS_LEVEL_ADMIN, ACCESS_LEVEL_MODERATOR, ACCESS_LEVEL_USER} from "../helpers/consts.js";
import {RequestGET} from "../helpers/http.js";
import Modal from "./Modal.vue";
import LoadingOverlay from "./LoadingOverlay.vue";

export default {
    name: "UserInfoHover",
    components: {LoadingOverlay, Modal},
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
        openUserInfo(triggerElement) {
            this.show = true;
            this.$nextTick(() => {
                const rect = triggerElement.getBoundingClientRect();
                const triggerWidth = triggerElement.offsetWidth;
                const tooltipWidth = this.$refs.hoverInfo.offsetWidth + 5;

                let left = rect.left + window.scrollX - triggerWidth;


                if (left + tooltipWidth > window.innerWidth) {
                    left = window.innerWidth - tooltipWidth;
                }

                this.position = {
                    top: `${rect.top + window.scrollY + triggerElement.offsetHeight + 5}px`,
                    left: `${left}px`
                };
            });
        },

        checkNickname() {
            const authStore = useAuthStore();
            const authState = ref(authStore);
            this.changeNickname = this.nickname && this.nickname != authState.value.nickname;
        },

        resetNickname() {
            const authStore = useAuthStore();
            const authState = ref(authStore);
            this.nickname = authState.value.nickname;
            this.checkNickname();
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
}

.container {
    display: flex;
    padding: 20px;
}

.logout-button {
    background-color: #755555;
    margin-top: 5px;
}

.logout-button:hover {
    background-color: #211616;
}

.user {
    text-align: center;
    margin-right: 20px;
}

.avatar {
    max-width: 64px;
    max-height: 64px;
}
</style>