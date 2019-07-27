<template lang="pug">
    div.item.componentitem
        .ui.middle.aligned.image.tiny
            img(:src="img_get_craft(craft)")
        .middle.aligned.content
            .ui.header
                span {{craft.name}}
                span {{craft.desc}}
</template>

<script lang="ts">
import Vue from "vue";
import * as types from "../types";
import * as utils from "../utils";

export default Vue.extend({
    props: ['craft'],

});
</script>

