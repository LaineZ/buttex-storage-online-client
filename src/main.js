import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { pinia } from './store/pinia';
import Modal from './components/Modal.vue';
import Vue3HighlightEs from "vue3-highlightjs";
import 'highlight.js/styles/gruvbox-dark.css';

const ModalApp = {};

ModalApp.install = (app) => {
    const instance = createApp(Modal).mount(document.createElement('div'));

    app.config.globalProperties.$show = (text = "", icon = "fa-exclamation-triangle") => {
        document.body.appendChild(instance.$el)

        instance.text = text;
        instance.icon = icon;
        instance.show = true;
    }
}

createApp(App)
    .use(pinia)
    .use(Vue3HighlightEs)
    .use(ModalApp)
    .mount('#app')
