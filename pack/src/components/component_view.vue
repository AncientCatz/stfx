<template lang="pug" name="component-view">
    div.item.componentitem
        component-img(v-bind:component="component")
        .middle.aligned.content
            .ui.header
                span {{component._name}}
                span {{component.mass}} Mass
            div.meta
                div.ui.horizontal.list
                    div.item(v-for="prop in comp_parse_props(component)")
                        img.ui.mini.image(:src="prop.img")
                        span {{prop.val}}
            div.description
                p {{comp_get_description(component)}}
            .meta
                div.ui.horizontal.list
                    div.item(v-for="prop in comp_parse_extra_props(component)")
                        img.ui.mini.image(:src="prop.img")
                        span {{prop.val}}

</template>

<script lang="ts">
import Vue from "vue";
import * as types from "../types";
import * as utils from "../utils";
import ComponentImg from "./component_img.vue";

export default Vue.extend({
    name: "component-view",
    props: ['component', 'highlight'],
    components: {
        ComponentImg,
    },

});
</script>

