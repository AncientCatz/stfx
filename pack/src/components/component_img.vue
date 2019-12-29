<template lang="pug">
    .componentimage
        img(:src="img_get_component(component)").compimg.ui.image
        img(v-if="component.imgmod" :src="img_get_component_mod(component)").compmod.ui.image
        img(v-if="component.faction" :src="img_get_banner(component.faction)").facmod.ui.image
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    props: ['component'],
})
</script>
