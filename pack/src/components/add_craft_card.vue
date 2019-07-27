<template lang="pug">
    div(@click="toggle").ui.card.componentcard
        div.content
            div.description
                p Add new craft
</template>

<script lang="ts">
import Vue from "vue";

import bus from "../eventbus";
import * as events from "../events";
import * as types from "../types";
export default Vue.extend({
    methods: {
        toggle: function() {
            bus.$emit(events.EVT_CRAFT_MODAL_OPEN)
        }
    }
});
</script>
