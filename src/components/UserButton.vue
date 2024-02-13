<template>
    <div>
        <a v-if="accessLevel > ACCESS_LEVEL_ANY()" href="#" @click="openInfo" ref="userButton">
            <i class="fa fa-user"></i> {{ nick }}
        </a>
        <a v-else href="#" @click="openLogin">
            <i class="fa fa-keyboard-o"></i> Login
        </a>
        <user-info-hover ref="userInfoHover"></user-info-hover>
        <modal ref="modalLogin" :buttons="[]">
            <div>
            <h3>It's time to kick the ball rolling and log in</h3>
            <form @submit.prevent="loginInto">
                <input type="text" placeholder="Username" v-model="login" required>
                <input type="password" placeholder="Password" v-model="password" required>
                <small>{{ error }}</small>
                <input type="submit" style="margin-top: 10px" value="Login">
            </form>
            </div>
        </modal>
        <modal ref="modalAuth" :buttons="[]" :closebtn="false">
            <div style="display: flex">
                <div style="margin-right: 20px">
                    <i class="fa fa-tty fa-4x"></i>
                </div>
                <p>Embarking on the digital highway...</p>
            </div>
        </modal>
    </div>
</template>


<script>
import {ref, watchEffect} from 'vue';
import {useAuthStore} from '../store/auth.js';
import Modal from "./Modal.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import UserInfoHover from "./UserInfoHover.vue";
import {ACCESS_LEVEL_ANY} from "../helpers/consts.js";
import {RequestGET, getUserInfo} from "../helpers/http.js";


export default {
    name: "UserButton",
    components: {UserInfoHover, LoadingOverlay, Modal},
    data() {
        return {
            nick: "",
            accessLevel: -1,
            error: "",
            login: "",
            password: "",
        };
    },
    mounted() {
        const authStore = useAuthStore();
        const authState = ref(authStore);

        watchEffect(() => {
            this.nick = authState.value.nickname
            this.accessLevel = authState.value.access_level
        });
    },

    methods: {
        ACCESS_LEVEL_ANY() {
            return ACCESS_LEVEL_ANY
        },
        openInfo() {
            this.$refs.userInfoHover.openUserInfo(this.$refs.userButton);
        },
        openLogin() {
            this.$refs.modalLogin.open();
        },
        async loginInto() {
            this.$refs.modalAuth.open();

            try {
                let response = await RequestGET("/api/users/get_token", {
                    user_name: this.login,
                    user_password: this.password,
                });

                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user_id", response.data.user_id);

                this.$refs.modalLogin.close();

                await getUserInfo();
            } catch (error) {
                console.log(error);
                this.error = "The username or password seems to be playing hard to get – time to check credintials and try again!";
            }
            this.$refs.modalAuth.close();
        }
    }
}
</script>

<style scoped>
a {
    display: block;
    text-decoration: none;
    color: var(--fg);
    text-align: right;
}

a:hover {
    color: var(--fg2);
}

button {
    display: block;
}

form {
    max-width: 30vw;
}

input {
    margin-top: 10px;
    display: block;
}
</style>