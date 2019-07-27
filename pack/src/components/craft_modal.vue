<template lang="pug">
    sui-modal(v-model="open", v-if="open")
        div.header(style="font-size: 1rem; font-weight: 400;")
            sui-input(placeholder="Search..." v-model="query")
        sui-modal-content(scrolling)
            sui-modal-description
            div.ui.divided.items
                craft-view(
                    v-for="craft in matching_crafts(query)",
                    v-on:click.native="emit_craft(craft._id)",
                    v-bind:craft="craft",
                    v-bind:key="craft._id",
                )
        sui-modal-actions
            sui-button(negative @click.native="toggle") Close
</template>

<script lang="ts">
import Vue from "vue";
import bus from "../eventbus";
import CraftView from "./craft_view.vue";
import * as events from "../events";
import * as types from "../types";


export default Vue.extend({
    props: ['crafts'],
    created: function() {
        bus.$on(events.EVT_CRAFT_MODAL_OPEN, (cslot:types.CraftSlot) => {
            this.cslot = cslot;
            this.toggle()
        })
    },
    components: {
        CraftView
    },
    data: function() {
        return {
            "open": false,
            "cslot": {} as types.CraftSlot,
            "query": "",
        }
    },
    methods: {
        toggle: function() {
            this.open = !this.open;
        },
        emit_craft: function(craft_id:number) {
            if(this.cslot) {
              this.$emit('set_craft', this.cslot.id, craft_id)
            }
            else {
              this.$emit('add_craft', craft_id)

            }
            this.open = false;
        },
        matching_crafts: function(query:string) {
          return this.crafts;
        },
    }
})
</script>
