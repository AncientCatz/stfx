import Vue from "vue";
// @ts-ignore
import SuiVue from "semantic-ui-vue";
import { GlobalMixin } from 'vue-typed'

import * as utils from "./utils";
import * as types from "./types";
import * as events from "./events";

import ComponentCard from "./components/component_card.vue";
import CrewWizard from "./components/component_crew_wizard.vue";
import ComponentModal from "./components/component_modal.vue";
import ComponentTable from "./components/component_table.vue";
import ComponentView from "./components/component_view.vue";
import CrewTable from "./components/crew_table.vue";
import CrewView from "./components/crew_view.vue";
import CraftCard from "./components/craft_card.vue";
import CraftModal from "./components/craft_modal.vue";
import AddCraftCard from "./components/add_craft_card.vue";


import TalentModal from "./components/talent_modal.vue";
import bus from "./eventbus";


declare var LZMA: any;
declare var base64js: any;
declare var protobuf: any;
var proto = null as any;
protobuf.load('proto.json').then((x: any) => proto = x)


@GlobalMixin()
class Global {
    DROPDOWN_LEVELS: any = utils.killme()
    img_get_ship_top(ship: types.Ship) { return utils.img_get_ship_top(ship)}
    img_get_ship_front_th(ship: types.Ship) { return utils.img_get_ship_front_th(ship)}
    img_get_ship_front(ship: types.Ship) { return utils.img_get_ship_front(ship)}
    img_get_job(job: types.Job) { return utils.img_get_job(job)}
    img_get_talent(talent: types.Talent) { return utils.img_get_talent(talent)}
    img_get_banner(banner_name: string) { return utils.img_get_banner(banner_name)}
    img_get_component(component: types.Component) { return utils.img_get_component(component)}
    img_get_component_mod(component: types.Component) { return utils.img_get_component_mod(component)}
    img_get_prop(prop_name: string) { return utils.img_get_prop(prop_name)}
    img_get_craft(craft: types.Craft) { return utils.img_get_craft(craft)}
    comp_get_name(comp: types.Component) { return utils.comp_get_name(comp)}
    comp_get_description(comp: types.Component) { return utils.comp_get_description(comp)}
    comp_parse_props(comp: types.Component) { return utils.comp_parse_props(comp)}
    comp_parse_extra_props(comp: types.Component) { return utils.comp_parse_extra_props(comp)}
    crew_get_skill(crewman: types.Crewman, skill:string) { return utils.crew_get_skill(crewman, skill)}
    talent_get_description(talent: types.Talent) { return utils.talent_get_description(talent)}
}


Vue.use(SuiVue);
const Component = {
    filters: {
        shield_pc: function(value:number) {
            return utils.ROUND_2(utils.COMP_CALC_SHIELD_PC(value));
        },
        armor_pc: function(value:number) {
            return utils.ROUND_2(utils.COMP_CALC_ARMOR_PC(value));
        },
    },
    methods: {
        open_component_modal: function(cslot:types.ComponentSlot) {
            bus.$emit(events.EVT_COMPONENT_MODAL_OPEN, cslot)
        }
    }
}

var app = new Vue({
    el: '#app',
    mixins: [Component],
    components: {
        ComponentCard,
        CrewWizard,
        ComponentModal,
        ComponentTable,
        ComponentView,
        CrewTable,
        CrewView,
        TalentModal,

        CraftCard,
        CraftModal,
        AddCraftCard,
    },
    data: {
        jobs: [] as types.Job[],
        ships: [] as types.JSONShip[],
        talents: {} as types.Talent[],
        job_talents: {},
        components: [] as types.Component[],
        current_id: -1 as number,
        current: {} as types.Ship,
        renderShip: false,
        ship_damage: {},
        ship_damage_perc: {},
        ship_stats: {} as types.ShipStats,
        crew: [] as types.Crewman[],
        officers: [],
        crafts: [] as types.Craft[],
        crew_pool: {} as types.CrewStats,
        crew_ship_pool_perc: {},
    },
    computed: {
        ships_dropdown(): any {
            var result = []
            for(var ship_id in this.ships) {
                let ship = this.ships[ship_id];
                var shipdata = {
                    'key': ship._id,
                    'text': ship.name,
                    'value': ship._id,
                    'image': {'src': utils.img_get_ship_top_th(ship)},
                }
                result.push(shipdata)
            }
            return result;
        },

        current_small_slots(): types.ComponentSlot[] {
          let components = utils.get_component_slots(this.current.components);
          let slots = utils.get_slots(components, 'small')
          return slots;
        },
        current_medium_slots(): types.ComponentSlot[]  {
            let components = utils.get_component_slots(this.current.components);
            return utils.get_slots(components, 'medium')
        },
        current_large_slots(): types.ComponentSlot[]  {
            let components = utils.get_component_slots(this.current.components);
            return utils.get_slots(components, 'large')
        },
        current_crafts(): types.CraftSlot[] {
            let crafts = utils.get_craft_slots(this.current.crafts);
            return crafts;
        },

    },
    watch: {
        current_id: function(val:number, old_val:number) {
          if(this.current && this.current._id == val) {
              return;
          }
          let ship = this.ships[val]
          this.load_ship(ship, ship.components, []);
          // this.current = this.process_ship(this.ships[val]);
        },
        current: {
            deep: true,
            handler: function() {
                console.log("current");
                this.calc_damage();
                this.component_total_stats();
                this.update_crew_perc();
                this.stfx_export();
            }
        },
        crew: {
            deep: true,
            handler: function(val, old_val) {
                this.calc_crew();
                this.update_crew_perc();
                this.stfx_export();
            }
        },
    },
    methods: {
        stfx_export_crew: function() {
            var crew_export = []
            for(var c of  this.crew) {
                let talent_ids = [];
                for(let t of c.talents) {
                  talent_ids.push(t._id)
                }
                crew_export.push({
                    'job': c.job.type._id,
                    'level': c.job.level,
                    'talents': talent_ids,
                })
            }
            return crew_export
        },
        process_ship: function(ship: types.JSONShip, components: number[], crafts: number[]): types.Ship {
            var yolo = JSON.parse(JSON.stringify(ship)) as any;
            Vue.set(yolo, 'components', this.get_components(components));
            Vue.set(yolo, 'crafts', this.get_crafts(crafts));
            return yolo as types.Ship;
        },
        load_ship: function(ship: types.JSONShip, components: number[], crafts: number[]) {
            var final_ship = this.process_ship(ship, components, crafts);
            this.current_id = final_ship._id;
            this.current = final_ship;
            this.renderShip = true;
            console.log("ship", this.current_id, this.current);
        },
        stfx_export: function() {
            var ship_data = {
                'ver': 1,
                'shipId': this.current._id,
                'components': utils.components_to_ids(this.current.components),
                'crafts': utils.crafts_to_ids(this.current.crafts),
                'crew': this.stfx_export_crew()
            }
            console.log(ship_data);
            var data_proto = proto.STFX.encode(ship_data).finish()
            var data_c = new Uint8Array(LZMA.compress(data_proto))
            var data_base = base64js.fromByteArray(data_c)
            document.location.hash = data_base
            utils.CopyToClipboard(document.location.href);
        },
        stfx_import: function(data_base:string) {
            var data_c = base64js.toByteArray(data_base)
            var data = LZMA.decompress(data_c)
            if(typeof(data) == 'string') {
                var byte_data = new Uint8Array(data.length)
                for(let i=0; i<data.length;i++) {
                    byte_data[i] = data.charCodeAt(i)
                }
                data = byte_data;
            }
            else {
                data = new Uint8Array(data);
            }
            var stfx = proto.STFX.decode(data)
            this.stfx_import_ship(stfx.shipId, stfx.components, stfx.crafts)
            this.stfx_import_crew(stfx.crew)
        },
        stfx_import_ship: function(ship_id:number, components:number[], crafts: number[]) {
            let ship = this.ships[ship_id]
            this.load_ship(ship, components, crafts);
        },

        stfx_import_crew: function(crewmen: types.ImportCrewman[]) {
            var crew = []
            for(var c of crewmen) {
                crew.push(this.make_crewman(c.job, c.level, c.talents))
            }
            this.crew = crew;
        },
        component_total_stats: function() {
            let [total, rolling] = utils.component_rolling_stats(this.current);
            this.ship_stats = total;
        },

        make_crewman: function(job_id:number, level:number, talent_ids:number[]) : types.Crewman {
                let talents = [];
                for(let t_id of talent_ids) {
                  talents.push(this.talents[t_id]);
                }
                return {
                  'job': {
                    'type': this.jobs[job_id],
                    'level': level,
                  },
                    'talents': talents,
                } as types.Crewman
        },

        generate_default_crew: function() {
            var crew = []
            for(var i in this.jobs) {
                crew.push(this.make_crewman(this.jobs[i]._id, 5, []))
            }
            this.crew = crew
        },
        calc_crew: function() {
            var total = {
                'pilot': 0,
                'shipops': 0,
                'repair': 0,
                'gunnery': 0,
                'electronics': 0,
                'navigation': 0,
                'doctor': 0,
                'command': 0,
                'negotiate': 0,
                'intimidate': 0,
                'explore': 0,
            } as types.CrewStats
            for(var c of this.crew) {
                var skills = utils.crew_get_skills(c)
                for(var s in skills) {
                    total[s] += skills[s]
                }
            }
            this.crew_pool = total;
        },
        update_crew_perc: function() {
            if(!this.ship_stats){ console.log("enoship_pool"); return;}
            var pool_perc = utils.calc_crew_perc(
                this.ship_stats,
                this.crew_pool
            )
            console.log("pool")
            console.log(pool_perc)
            this.crew_ship_pool_perc = pool_perc
        },
        calc_damage: function() {
            var ship_damage: { [index:number]: number } = {}
            var damage_perc: { [index:number]: number } = {}
            var max = 0
            function add_dmg(range:number, dmg:number) {
                var current = (ship_damage[range]|0)
                dmg = current + dmg;
                if(dmg > max) { max = dmg}
                ship_damage[range] = dmg;

            }
            for(var comp of this.current.components) {
                if(comp.type != 'weapon'){ continue }
                if(!comp.weapon){ continue }
                var range = comp.weapon.range!
                var valid_ranges: { [index:number]: number[]} = {
                    1: [range+1],
                    2: [range-1, range+1],
                    3: [range-1, range+1],
                    4: [range-1, range+1],
                    5: [range-1, range+1],
                    6: [range-1, range+1],
                    7: [range-1],
                }
                add_dmg(range, comp.weapon.damage_min)
                var valid_r = valid_ranges[comp.weapon.weapon_type]
                for(var r of valid_r) {
                    add_dmg(r, comp.weapon.damage_min * 0.8)
                }
            }
            for(var i in ship_damage) {
                damage_perc[i] = ship_damage[parseInt(i)]/max * 100
            }
            this.ship_damage = ship_damage
            this.ship_damage_perc = damage_perc

        },
        set_component: function(slot_id:number, component_id:number) {
            let component = this.components[component_id];
            Vue.set(this.current.components, slot_id, component);
        },

        add_craft: function(craft_id: number) {
            console.log("add_craft", craft_id);
            let craft = this.crafts[craft_id]
            let slot_id = this.current.crafts.length
            Vue.set(this.current.crafts, slot_id, craft);
        },

        set_craft: function(slot_id:number, craft_id: number) {
            console.log("set_craft", slot_id, craft_id);
            let craft = this.crafts[craft_id];
            Vue.set(this.current.crafts, slot_id, craft);
        },

      set_talent: function(crew_id: number, talent_id: number) {
        let crewman = this.crew[crew_id]
        let talent = this.talents[talent_id]
        crewman.talents.push(talent);

        },
        get_components: function(id_list:number[]): types.Component[] {
            var components = []
            for(var i in id_list) {
                var component_id = id_list[i];
                var comp = this.components[component_id];
                components.push(comp);
            }
            return components
        },
        get_crafts: function(id_list: number[]): types.Craft[] {
            let crafts = []
            for(let i in id_list) {
                let craft_id = id_list[i];
                let craft = this.crafts[craft_id]
                crafts.push(craft)
            }
            return crafts;
        }
    },
    created: function() {
        fetch("data/data.json")
        .then(r => r.json())
        .then(json => {
            this.talents = json.talents
            this.job_talents = json.job_talents
            this.components = utils.postprocess_comp(json.components)
            this.jobs = json.jobs
            this.ships = json.ships
            this.crafts = json.crafts
            var hash = document.location.hash.slice(1)
            if(hash) {
                this.stfx_import(hash)
            }
        })
        bus.$on(events.EVT_FILL_SHIP_POOLS, ((fill_crew:types.FillCrewman[]) => {
            for(var entry of fill_crew) {
                for(var i=0; i<entry.count;i++) {
                    this.crew.push(
                        this.make_crewman(entry.job._id, entry.level, [])
                    )
                }
            }
        }))
    },
})
