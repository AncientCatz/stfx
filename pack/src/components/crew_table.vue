<template lang="pug">
    table.ui.celled.table.compact
        thead
            tr
                th.two.wide
                    span Job
                th Level
                th.five.wide Talents
                th Pilot
                th Ship Ops
                th Repair
                th Gunnery
                th Electronics
                th Navigation

                th Doctor
                th Command
                th Negotiate
                th Intimidate
                th Explore
        tbody
            tr(v-for="(crewman, key) in crew" :key="key")
                td.ui.navy
                    img(:src="img_get_job(crewman.job.type)").ui.mini.image.middle.aligned
                    sui-dropdown(:text="crewman.job.type.name" floating)
                      sui-dropdown-menu
                          sui-dropdown-item(v-on:click="copy_crewman(key)")
                              sui-icon(name="copy")
                              span Copy
                          sui-dropdown-item(v-on:click="del_crewman(key)")
                              sui-icon(name="delete")
                              span Space
                td
                    sui-dropdown(placeholder="Level" selection :options="DROPDOWN_LEVELS", v-model="crewman.job.level")
                td(@click="open_talent_modal(key)")
                    img(v-for="t in crewman.talents" :src="img_get_talent(t)").ui.mini.image.middle.aligned
                td {{crew_get_skill(crewman, 'pilot')}}
                td {{crew_get_skill(crewman, 'shipops')}}
                td {{crew_get_skill(crewman, 'repair')}}
                td {{crew_get_skill(crewman, 'gunnery')}}
                td {{crew_get_skill(crewman, 'electronics')}}
                td {{crew_get_skill(crewman, 'navigation')}}
                td {{crew_get_skill(crewman, 'doctor')}}
                td {{crew_get_skill(crewman, 'command')}}
                td {{crew_get_skill(crewman, 'negotiate')}}
                td {{crew_get_skill(crewman, 'intimidate')}}
                td {{crew_get_skill(crewman, 'explore')}}

            tr
                td.ui.navy
                    sui-dropdown(placeholder="Job" search selection :options="get_dropdown_jobs()", v-model="new_crewman_job")
                td(colspan=13)
        tfoot
            tr
                td
                td
                    sui-dropdown(placeholder="Level All" selection :options="DROPDOWN_LEVELS", v-model="global_crewman_level")

</template>

<script lang="ts">
import Vue from "vue";
import * as events from "../events";
import * as types from "../types";
import bus from "../eventbus";
import * as utils from "../utils";

export default Vue.extend({
    props: ['crew', "jobs"],
    data: function() {
        return {
            sort_key: null,
            job_dropdown_current: null,
            new_crewman_job: -1 as number,
            new_crewman_level: null,
            global_crewman_level: null,
        }
    },
    watch: {
        new_crewman_job: function(){
            if(this.new_crewman_job === -1) {
                return;
            }
            let job = this.jobs[this.new_crewman_job];
            this.new_crewman_job = -1;
            let new_crew = [{'job': job, 'count': 1, 'level': 1}]
            bus.$emit(events.EVT_FILL_SHIP_POOLS, new_crew)
        },
        global_crewman_level: function(){
            if(!this.global_crewman_level){return;}
            for(var i in this.crew) {
                this.crew[i].job.level = this.global_crewman_level;
            }
            this.global_crewman_level = null;
        },
    },
    methods: {
        get_dropdown_jobs : function() {
            var d_jobs = [];
            for(var i in this.jobs) {
                d_jobs.push({
                    'key': this.jobs[i]._id,
                    'text': this.jobs[i].name,
                    'value': this.jobs[i]._id,
                    'image': {'src': utils.img_get_job(this.jobs[i])},
                })
            }
            return d_jobs;
        },
        del_crewman: function(key:number) {
            this.crew.splice(key, 1)
        },
        copy_crewman: function(key:number) {
            this.crew.push(this.crew[key])
        },
        open_talent_modal(crewman_id: number) {
            let crewman_slot = {
                id: crewman_id,
                crewman: this.crew[crewman_id]
            }
            bus.$emit(events.EVT_TALENT_MODAL_OPEN, crewman_slot);
        }
    },
});
</script>
