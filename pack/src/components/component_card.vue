<template lang="pug">
    div(@click="toggle").ui.card.componentcard
        component-img(v-bind:component="cslot.component")
        div.content
            div.description
                p {{cslot.component | comp_disp_name}}
</template>

<script lang="ts">
import Vue from "vue";

import bus from "../eventbus";
import * as events from "../events";
import * as types from "../types";
import ComponentImg from "./component_img.vue";
export default Vue.extend({
    props: ['cslot'],
    components: {
        ComponentImg,
    },
    filters: {
      comp_disp_name: function(comp: types.Component) {
          if(comp.shortname) {return comp.shortname}
          return comp.name
      }
    },
    methods: {
        toggle: function() {
            bus.$emit(events.EVT_COMPONENT_MODAL_OPEN, this.cslot)
        }
    }
});
</script>
