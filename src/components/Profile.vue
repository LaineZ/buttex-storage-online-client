<template>
    <div class="profile">
        <LoadingOverlay :loading="loading" :dimming="true"/>
        <div class="info">
            <div style="margin-right: 10px">
                <img width="96" :src="avatarUrl">
            </div>
            <div>
                <h1>{{ nickname }}</h1>
                <small>{{ name }}</small>
            </div>
        </div>
        <div>
            <h2>System settings</h2>
            <label>Window width {{ width }}%</label>
            <input :disabled="mobility" type="range" min="60" max="100" v-model="width" @input="updateWidth">
            <h2>User settings</h2>
            <form @submit.prevent="updateUserData">
                <label>Name:</label>
                <input type="text" maxlength="32" placeholder="Name" required v-model="nickname">
                <label v-if="role >= 2">Role:</label>
                <select v-if="role >= 2" v-model="role">
                    <option value="0" :disabled="role >= 0">User</option>
                    <option value="1" :disabled="role >= 1">Moderator</option>
                    <option value="2" :disabled="role >= 2">Admin</option>
                </select>
                <label>Password:</label>
                <input type="password" placeholder="Password" v-model="password">
                <label>Password confirmation:</label>
                <input type="password" placeholder="Password confirmation" v-model="confirmPassword">
                <div style="margin-top: 10px">
                    <button @click="updateUserData" type="submit" style="margin-right: 10px" :disabled="!isAltered">Save</button>
                    <button @click="popluate" :disabled="!isAltered">Revert</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import {useAuthStore} from "../store/auth.js";
import {ref, watchEffect} from "vue";
import {ACCESS_LEVEL_ADMIN, ACCESS_LEVEL_MODERATOR, ACCESS_LEVEL_USER} from "../helpers/consts.js";
import { RequestGET, login } from "../helpers/http.js";
import LoadingOverlay from "./LoadingOverlay.vue";

export default {
    name: "Profile",
    components: {LoadingOverlay},
    data() {
        return {
            name: "",
            nickname: "",
            accessLevel: "",
            password: "",
            confirmPassword: "",
            avatarUrl: null,
            role: 0,
            id: 0,
            position: null,
            show: false,
            changeNickname: false,
            loading: false,
            mobility: false,
            width: 100,
        };
    },

    computed: {
        isAltered() {
            const authStore = useAuthStore();
            const authState = ref(authStore);

            if (this.nickname != authState.value.nickname) {
                return true;
            }

            if (this.role != authState.value.access_level) {
                return true;
            }

            if (this.password.length > 0 || this.confirmPassword.length > 0) {
                return true;
            }

            return false;
        }
    },

    methods: {
        async updateWidth() {
            const authStore = useAuthStore();
            authStore.setWidth(this.width);
        },

        async updateUserData() {
            this.loading = true;
            const authStore = useAuthStore();
            const authState = ref(authStore);
            try {
                if (this.password != this.confirmPassword) {
                    this.$show("Passwords do not match");
                    this.loading = false;
                    return;
                }

                if (this.role >= ACCESS_LEVEL_ADMIN) {
                    await RequestGET("/api/users/set_access_level", {
                        access_level: this.role
                    });
                }

                await RequestGET("/api/users/set_nickname", {
                    new_nickname: this.nickname,
                });

                authStore.setNick(this.nickname);

                if (this.password.length > 0 || this.confirmPassword.length > 0) {
                    await RequestGET("/api/users/set_password", {
                        new_password: this.password
                    });
                    await login(this.name, this.password);
                    window.location.reload();
                }
            } catch (e) {
                this.$show(e.toString());
            }
            this.loading = false;
        },

        popluate() {
            const authStore = useAuthStore();
            const authState = ref(authStore);

            this.name = authState.value.name;
            this.id = authState.value.id;
            this.nickname = authState.value.nickname;
            this.avatarUrl = authState.value.avatar_url;
            this.width = authState.value.width;
            this.role = authState.value.access_level;
            this.mobility = authState.value.mobility;

            this.password = "";
            this.confirmPassword = "";

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
        }
    },
    mounted() {
        watchEffect(() => {
            this.popluate();
        });
    },
}
</script>

<style scoped>
small, h1 {
    margin: 0;
    padding: 0;
    line-height: 1.0;
}

input[type="range"] {
    display: block;
    width: 100%;
    -webkit-appearance: none;
    background: var(--bg2);
    color: var(--fg);
    height: 16px;
}

input[type="submit"] {
    display: block;
    margin-top: 10px;
}

h1 {

}

input[type="range"]::-webkit-slider-thumb {
    background: var(--fg2);
    border-radius: 0;
}

input[type="range"]::-moz-range-thumb {
    background: var(--fg2);
    border-radius: 0;
}

.profile {
    position: relative;
    max-width: 450px;
}

.info {
    display: flex;
    background-color: var(--bg2);
    padding: 5px;
}
</style>