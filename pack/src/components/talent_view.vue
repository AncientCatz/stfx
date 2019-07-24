<template lang="pug" name="talent-view">
    div.item.componentitem
        .ui.middle.aligned.image.tiny
            img(:src="img_get_talent(ctal.talent)")
        .middle.aligned.content
            .ui.header
                span {{ctal.talent.name}}
                span Level {{ctal.level}}
            div.description
                p {{talent_get_description(ctal.talent)}}

</template>

<script lang="ts">
import Vue from "vue";
import * as types from "../types";
import * as utils from "../utils";

export default Vue.extend({
    name: "talent-view",
    props: ['ctal'],

});
</script>

