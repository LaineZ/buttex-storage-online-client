<template>
    <transition name="modal-fade">
        <div v-if="visible" class="context-menu" :style="{ top: `${position.y}px`, left: `${position.x}px` }" ref="ctxMenu">
            <ul>
                <li v-for="(item, index) in items" @click="handleItemClick(item.id || index)"><i class="fa" :class="item.icon || ''"></i> {{ item.name || item }}</li>
            </ul>
        </div>
    </transition>
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
            window.addEventListener('resize', this.hideContextMenu);
            window.addEventListener('scroll', this.hideContextMenu);

            this.$nextTick(() => {
                console.log(this.$refs.ctxMenu.clientHeight);

                if (event.clientY + this.$refs.ctxMenu.clientHeight > window.innerHeight) {
                    this.position.y -= this.$refs.ctxMenu.clientHeight;
                }


                if (event.clientX + this.$refs.ctxMenu.clientWidth > window.innerWidth) {
                    this.position.x -= this.$refs.ctxMenu.clientWidth;
                }
            });
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
    transition: opacity 0.2s ease-in-out;
}

.context-menu li {
    padding: 8px;
    margin: 0;
}

.context-menu i {
    width: 24px;
    text-align: center;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>