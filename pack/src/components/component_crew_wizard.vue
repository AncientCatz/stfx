<template lang="pug">
  div
    <sui-button @click.native="toggle">Wizard™®</sui-button>
    sui-modal(v-model="open")
      <sui-modal-header></sui-modal-header>
      sui-modal-content
          sui-modal-description
            span
                span Crew level
                input(type="range" min="1", max="40", step="1", v-model="level")
                span {{level}}
            p(v-for="c in new_crew") {{c.job.name}} {{c.count}}
      sui-modal-actions
        <sui-button positive @click.native="fill">
          span OK
        </sui-button>

</template>


<script lang="ts">
import Vue from "vue";

import * as events from "../events";
import * as utils from "../utils";
import * as types from "../types";
import bus from "../eventbus";
export default Vue.extend({
    props: ['ship_stats', 'crew', 'jobs'],
    data: function() {
        return {
            "open": false,
            "level": 1,
            "new_crew": {},
        }
    },
    watch: {
        level: function() {
            this.gen_crew()
        },
    },
    methods: {
        toggle: function() {
            this.open = !this.open;
        },
        gen_crew: function() {
            let new_crew = []
            let stat_job = {
                'pilot': 24,
                'shipops': 1,
                'gunnery': 4,
                'electronics': 3,
                'navigation': 16,
            } as types.CrewStats;

            let crew_stats = {
                'pilot' : 0,
                'shipops': 0,
                'gunnery': 0,
                'electronics': 0,
                'navigation': 0
            } as types.CrewStats;

            for(var i in crew_stats) {
                let level = Number(this.level)
                let crewman = {
                    'job': this.jobs[stat_job[i]],
                    'level': level,
                    'talents': []
                }
                let crewman_skills = utils.job_get_skills(crewman.job, crewman.level);
                let crewman_skill = crewman_skills[i]

                let ship_stat = Math.round(utils.get_ship_stat(this.ship_stats, i) * 1);
                let stat_delta = ship_stat - crew_stats[i]
                if(stat_delta <= 0){continue;}
                let crew_no = Math.ceil(stat_delta/crewman_skill)
                console.log(stat_delta, crewman_skills)
                for(var cs in crewman_skills) {
                    crew_stats[cs] += crewman_skills[cs]
                }
                new_crew.push({'job': crewman.job, 'count': crew_no, 'level': level})
            }
            this.new_crew = new_crew
        },
        fill: function() {
            bus.$emit(events.EVT_FILL_SHIP_POOLS, this.new_crew)
            this.open = false;
        }
    }
});
</script>

