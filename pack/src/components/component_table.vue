<template lang="pug">
    mixin component_td(attr)
        td
            span= `{{data.${attr}}}`
            small(v-if=`data.component.${attr}`)= ` ({{data.component.${attr}}})`

    mixin component_th(prop, name)
        th(v-on:click=`sortBy('${prop}')`)
            p
                span=  `${name}`
                img.ui.mini.image(:src=`img_get_prop('${prop}')`)
    table.ui.celled.table.compact
        thead
            tr
                th.two.wide.navy Component
                +component_th('mass', "Mass")
                +component_th('pilot', "Pilot")
                +component_th('shipops', "Ship Ops")
                +component_th('electronics', "Electronics")
                +component_th('navigation', "Navigation")
                +component_th('gunnery', "Gunnery")
                +component_th('officer', "Officers")
                +component_th('armor', "Armor")
                +component_th('shield', "Shield")
                +component_th('jump_cost', "Jump Cost")
                +component_th('install_cost', "Install Cost")
        tbody
            tr(v-for="data in component_rolling_stats")
                td.ui.navy(@click="open_component_modal(data)")
                    img(:src="img_get_component(data.component)").ui.mini.image.middle.aligned
                    span {{data.component | comp_disp_name}}
                +component_td("mass")
                +component_td('pilot')
                +component_td('shipops')
                +component_td('electronics')
                +component_td('navigation')
                +component_td('gunnery')
                +component_td('officers')
                +component_td('armor')
                +component_td('shield')
                +component_td('jump_cost')
                +component_td('install_cost')

</template>
<script lang="ts">
import Vue from "vue";
import * as utils from "../utils";
import * as types from "../types";
import * as events from "../events";
import bus from "../eventbus";

export default Vue.extend({
    props: ['current'],
    data: function() {
        return {
            sort_key: ''
        }
    },
    methods: {
        sortBy: function(column:string) {
            this.sort_key = column;

        },
      open_component_modal(data: any) {
          bus.$emit(events.EVT_COMPONENT_MODAL_OPEN, data);
      }
    },
    filters: {
    comp_disp_name(comp: types.Component) {
        return utils.comp_disp_name(comp);
    }

    },
    computed: {
        component_rolling_stats: function() {
            let [total, rolling] = utils.component_rolling_stats(this.current);
            return rolling;
        }

    }
});

</script>

