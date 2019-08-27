<template lang="pug">
    sui-modal(v-model="open", v-if="open")
        div.header(style="font-size: 1rem; font-weight: 400;")
            sui-input(placeholder="Search..." v-model="query")
        sui-modal-content(scrolling)
            sui-modal-description
            div.ui.divided.items
                talent-view(
                    v-for="ctal in matching_talents(cslot.crewman, query)",
                    v-on:click.native="emit_talent(cslot.id, ctal.talent._id)",
                    v-bind:ctal="ctal",
                    v-bind:key="ctal.talent._id",
                    v-bind:class="{noob: ctal.noob}"
                )
        sui-modal-actions
            sui-button(negative @click.native="toggle") Close
</template>

<script lang="ts">
import Vue from "vue";
import TalentView from "./talent_view.vue";
import * as events from "../events";
import bus from "../eventbus";
import * as types from "../types";
import * as utils from "../utils";

export default Vue.extend({
    props: ['talents', 'job_talents'],
    created: function() {
        bus.$on(events.EVT_TALENT_MODAL_OPEN, (cslot: types.CrewmanSlot) => {
            this.cslot = cslot;
            this.toggle()
        })
    },
    components: {
        'talent-view': TalentView
    },
    data: function() {
        return {
            "open": false,
            "cslot": {} as types.CrewmanSlot,
            "query": "",
        }
    },
    methods: {
        toggle: function() {
            this.open = !this.open;
        },
        emit_talent: function(crew_id:number, talent_id:number) {
            this.$emit('set_talent', crew_id, talent_id)
            this.open = false;
        },
        matching_talents: function(crewman: types.Crewman, query: string) {
            let current_talent_ids = new Set();
            for(let t of crewman.talents) {
                current_talent_ids.add(t._id);
            }
            // let current_talents = [for (t._id of crewman.talents)];
            let job = crewman.job.type;
            let level = crewman.job.level;
            let talents = [] as types.JobTalent[]
            let job_level_talents = this.job_talents[job._id];
            for (let l in job_level_talents) {
                for(let talent_id of job_level_talents[l]) {
                    let talent = this.talents[talent_id]
                    if(current_talent_ids.has(talent_id)) { continue }
                    if(query && !talent.name.toLowerCase().includes(query.toLowerCase())){continue}
                    talents.push({
                        talent: this.talents[talent_id],
                        level: parseInt(l),
                        noob: (parseInt(l) > level)
                    });
                }
            }

            return talents;
        }
    }
})

</script>

