<template lang="pug">
    div(@click="toggle").ui.card.componentcard
        img(:src="img_get_craft(cslot.craft)").ui.image
        div.content
            div.description
                p {{cslot.craft | craft_disp_name}}
</template>

<script lang="ts">
import Vue from "vue";

import bus from "../eventbus";
import * as events from "../events";
import * as types from "../types";
export default Vue.extend({
    props: ['cslot'],
    filters: {
      craft_disp_name: function(craft: types.Craft) {
          return craft.name;
      }
    },
    methods: {
        toggle: function() {
            bus.$emit(events.EVT_CRAFT_MODAL_OPEN, this.cslot)
        }
    }
});
</script>
