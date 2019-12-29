<template lang="pug">
    sui-modal(v-model="open", v-if="open")
        div.header(style="font-size: 1rem; font-weight: 400;")
            sui-input(placeholder="Search..." v-model="query")
        sui-modal-content(scrolling)
            sui-modal-description
            div.ui.divided.items
                component-view(
                    v-for="component in matching_components(cslot.component, query)",
                    v-on:click.native="emit_component(cslot.id, component._id)",
                    v-bind:component="component",
                    v-bind:key="component._id",
                    v-bind:class="{current: component._id == cslot.component._id}"
                )
        sui-modal-actions
            sui-button(negative @click.native="toggle") Close
</template>

<script lang="ts">
import Vue from "vue";
import bus from "../eventbus";
import ComponentView from "./component_view.vue";
import * as events from "../events";
import * as types from "../types";


export default Vue.extend({
    props: ['components'],
    created: function() {
        bus.$on(events.EVT_COMPONENT_MODAL_OPEN, (cslot:types.ComponentSlot) => {
            this.cslot = cslot;
            this.toggle()
        })
    },
    components: {
        'component-view': ComponentView
    },
    data: function() {
        return {
            "open": false,
            "cslot": {} as types.ComponentSlot,
            "query": "",
        }
    },
    methods: {
        toggle: function() {
            this.open = !this.open;
        },
        emit_component: function(slot_id:number, component_id:number) {
            this.$emit('set_component', slot_id, component_id)
            this.open = false;
        },
        matching_components: function(component:types.Component, query:string) {
            let magic_components = ['bridge', 'drive', 'hyperwarp'];
            let matching_components = []
            let _id = component._id
            let type = component.type
            let size = component.size
            let name = component.name
            let drive_mass = component.drive_mass

            for(var comp_id in this.components) {
                let comp = this.components[comp_id];
                if(comp.size != size) { continue;}
                if(drive_mass != comp.drive_mass) {continue}
                let valid = true;
                for(var i in magic_components) {
                    let c = magic_components[i];
                    if(type == c && comp.type != c) {valid=false; continue}
                    if(comp.type == c && type != c) {valid=false;continue}
                }
                if(!valid) {continue;}
                if(_id == comp._id) {}
                else if(query && !comp._name.toLowerCase().includes(query.toLowerCase())){continue}
                matching_components.push(comp);
            }
            return matching_components;
        },
    }
})
</script>
