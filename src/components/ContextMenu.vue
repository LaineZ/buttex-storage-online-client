<template>
    <div v-if="visible" class="context-menu" :style="{ top: `${position.y}px`, left: `${position.x}px` }">
        <ul>
            <li v-for="(item, index) in items" @click="handleItemClick(index)"><i class="fa" :class="item.icon || ''"></i> {{ item.name || item }}</li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            position: {x: 0, y: 0},
        }
    },
    props: {
      items: {
          type: Array,
          default: [],
      }
    },
    methods: {
        openAtMouse(event) {
            event.preventDefault();
            this.position = { x: event.clientX, y: event.clientY };
            this.visible = true;
            window.addEventListener('click', this.hideContextMenu);
        },

        handleItemClick(itemIndex) {
            this.$emit('itemClick', itemIndex);
        },

        hideContextMenu() {
            this.visible = false;
            window.removeEventListener('click', this.hideContextMenu);
        },
    },
};
</script>

<style scoped>
.context-menu {
    position: fixed;
    z-index: 1000;
    background-color: var(--bg3);
    border: 1px solid var(--bg2);
    margin: 0;
    cursor: pointer;
}

.context-menu li {
    padding: 8px;
    margin: 0;
}

.context-menu i {
    width: 16px;
    text-align: center;
}
</style>