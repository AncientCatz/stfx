String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};

Vue.use(SemanticUIVue);
var bus = new Vue();
var EVT_COMPONENT_MODAL_OPEN = 'EVT_COMPONENT_MODAL_OPEN'


Vue.mixin({
    methods: {

        crew_get_skills: function(crewman) {
            skills = {}
            skill_names = crewman.job.skills
            for(var i in skill_names) {
                    name = skill_names[i];
                    skills[name] = crewman.job.levels[crewman.level-1][i];
            }
            return skills

        },
        crew_get_skill: function(crewman, skill) {
            skills = this.crew_get_skills(crewman)
            return skills[skill]
        },
        parse_component_description: function(component) {
            DESC = {
                'armor': '+{armor}% armor',
                'shield': '+{shield}% shielding',
                'jump_cost': '{jump_cost} jump cost',
                'officers': 'Quarters for {officers} officers',
                'crew': 'Quarters for {crew} crew',
                'cargo': 'Stores {cargo} Cargo',
                'fuel': 'Adds {fuel} Fuel Capacity',
                'craft': 'Adds {craft} Craft Hangar',

            }
            DESC_WEAPON = {
                "level": "lvl {level}",
                "accuracy": '+{accuracy}% accuracy',
                "range": 'at optimal range of {range}',
                "crit": '{crit}% crit chance',
                "effect_chance": '{effect_chance}% crippling chance',
            }
            DESC_ENGINE = {
                "fuel_map": "Burns {fuel_map} per AU at {safety}% safety",
                "fuel_combat": 'Burns {fuel_combat} per Combat',
            }
            description = [];
            for(var tag in DESC) {
                value = component[tag]
                if(value === undefined) {continue;}
                text = DESC[tag].formatUnicorn(component)
                description.push(text)
            }
            if(component.engine) {
                for(var tag in DESC_ENGINE) {
                    value = component.engine[tag]
                    text = DESC_ENGINE[tag].formatUnicorn(component.engine)
                    description.push(text)
                }
            }
            if(component.weapon) {
                for(var tag in DESC_WEAPON) {
                    value = component.weapon[tag]
                    text = DESC_WEAPON[tag].formatUnicorn(component.weapon)
                    description.push(text)
                }
            }
            return description.join(', ')
        },
        parse_component_props: function(component) {
            props = []
            for(var i in component) {
                if(!i.startsWith('skill_')) {continue;}
                img = this.img_get_prop(i.replace('skill_', ''));
                name = i.replace('skill_', '').replace('_', ' ');
                val = component[i];
                props.push({'img': img, 'name': name, 'val': val})

            }
            props.push({
                'img': this.img_get_prop('mass'),
                'name': 'mass',
                'val': component.mass
            })
            return props;
        },
        img_get_ship_top: function(ship) {
            return 'assets/ships_top/' + ship.skin_name + '.png';
        },

        img_get_ship_front_th: function(ship) {
            return 'assets/th/ships/' + ship.skin_name + '.png';
        },
        img_get_ship_top_th: function(ship) {
            return 'assets/th/ships_top/' + ship.skin_name + '.png';
        },
        img_get_ship_front: function(ship) {
            return 'assets/ships/' + ship.skin_name + '.png';
        },
        img_get_job: function(job) {
            return 'assets/jobs/' + job.name.toLowerCase().replace(' ', '_') + '.png'
        },
        img_get_talent: function(talent) {
            return 'assets/talents/' + talent.name + '.png';
        },
        img_get_banner: function(banner_name) {
            return 'assets/banners/' + banner_name + '.png';
        },
        img_get_component: function(component) {
            return 'assets/components/' + component.img + '.png';
        },
        img_get_prop: function(prop_name) {
            return 'assets/icons/icon_prop_' + prop_name + '.png';
        },
        open_component_modal: function(cslot) {
            bus.$emit(EVT_COMPONENT_MODAL_OPEN, cslot)
        }

    }

})


Vue.component('component-card', {
    template: '#component-card',
    props: ['cslot', 'components'],
    methods: {
        toggle: function() {
            bus.$emit(EVT_COMPONENT_MODAL_OPEN, this.cslot)
        }
    }
});

Vue.component('crew-table', {
    template: '#crew-table',
    props: ['crew'],
    data: function() {
        return {
            sort_key: null
        }
    },
});

Vue.component('component-table', {
    template: '#component-table',
    props: ['slots'],
    data: function() {
        return {
            sort_key: null
        }
    },
    methods: {
        sortBy: function(column) {
            this.sort_key = column;

        },
    },
    computed: {
        component_rolling_stats: function() {
            return this.$root.component_rolling_stats();
        }

    }
});

Vue.component('component-view', {
    template: '#component-view',
    props: ['component', 'highlight'],
});

Vue.component("component-modal", {
    template: "#component-modal",
    props: ['components'],
    created: function() {
        bus.$on(EVT_COMPONENT_MODAL_OPEN, cslot => {
            this.cslot = cslot;
            this.toggle()
        })
    },
    data: function() {
        return {
            "open": false,
            "cslot": 0,
            "query": "",
        }
    },
    methods: {
        toggle: function() {
            this.open = !this.open;
        },
        emit_component: function(slot_id, component_id) {
            this.$emit('set_component', slot_id, component_id)
            this.open = false;
        },
        matching_components: function(component, query) {
            magic_components = ['bridge', 'drive', 'hyperwarp'];
            matching_components = []
            _id = component._id
            type = component.type
            size = component.size
            name = component.name
            drive_mass = component.drive_mass
            for(var i in this.components) {
                comp = this.components[i];
                if(comp.size != size) { continue;}
                if(drive_mass != comp.drive_mass) {continue}
                valid = true;
                for(var i in magic_components) {
                    c = magic_components[i];
                    if(type == c && comp.type != c) {valid=false; continue}
                    if(comp.type == c && type != c) {valid=false;continue}
                }
                if(!valid) {continue;}
                if(_id == comp._id) {}
                else if(query && !comp.name.toLowerCase().includes(query.toLowerCase())){continue}
                matching_components.push(comp);
            }
            return matching_components;
        },
    }
})

var app = new Vue({
    el: '#app',
    data: {
        message: "EBIN",
        jobs: [],
        ships: [],
        components: [],
        current_id: null,
        current: null,
        ships_dropdown: [],
        ship_damage: {},
        ship_damage_perc: {},
        ship_stats: {},
        crew: [],
        officers: [],
        crafts: [],
        crew_pool: {},
        crew_ship_pool_perc: {},
    },
    watch: {
        current_id: function(val, old_val) {
            if(this.current && this.current._id == val) {
                return;
            }
            this.current = this.ships[val];
        },
        current: {
            deep: true,
            handler: function(val, old_val) {
                localStorage.current = JSON.stringify(val);
                this.calc_damage();
                this.component_rolling_stats();
                this.generate_default_crew()
                this.calc_crew_perc();
            }
        },
        crew: {
            deep: true,
            handler: function(val, old_val) {
                this.calc_crew();
                this.calc_crew_perc();
            }
        },
    },
    methods: {
        update_ships_dropdown: function() {
            result = []
            for(var i in this.ships) {
                ship = this.ships[i]
                shipdata = {
                    'key': ship._id,
                    'text': ship.name,
                    'value': ship._id,
                    'image': {'src': this.img_get_ship_top_th(ship)},
                }
                result.push(shipdata)
            }
            return result;
        },
        stfx_export: function() {
            //TODO
            data = {
                "ship": {
                    'id': this.current._id,
                    'components': this.current.components,
                }
            }
        },
        component_rolling_stats: function() {
            //todo max
            slots = this.get_components(this.current.components);
            rolling_components = []
            totals = {
                "hull": this.current.hullpoints,
                "mass": 0,
                "skill_pilot": 0,
                "skill_shipops": 0,
                "skill_electronics": 0,
                "skill_navigation": 0,
                "skill_gunnery": 0,
                "officers": 0,
                "passengers": 0,
                "crew": 0,
                "prisoners": 0,
                "medical": 0,
                "fuel": this.current.fuel,
                "craft": 0,
                "armor": this.current.armor,
                "shield": this.current.shield,
                "jump_cost": 0,
                "install_cost": 0,
            }
            for(var i in slots) {
                component = slots[i].component
                slot_id = slots[i].id
                for(var i in totals){
                    totals[i] += (component[i]|0)
                }
                rolling_components.push({
                    "mass": totals.mass,
                    "skill_pilot": totals.skill_pilot,
                    "skill_shipops": totals.skill_shipops,
                    "skill_electronics": totals.skill_electronics,
                    "skill_navigation": totals.skill_navigation,
                    "skill_gunnery": totals.skill_gunnery,
                    "officers": totals.officers,
                    "armor": totals.armor,
                    "shield": totals.shield,
                    "jump_cost": totals.jump_cost,
                    "install_cost": totals.install_cost,
                    "component": component,
                    "id": slot_id,
                });
            }
            this.ship_stats = totals;
            return rolling_components;


        },

        make_crewman: function(job_id, level) {
                return {
                    'job': this.jobs[job_id],
                    'level': level
                }
        },

        generate_default_crew: function() {
            crew = []
            for(var i in this.jobs) {
                crew.push(this.make_crewman(this.jobs[i]._id, 5))
            }
            this.crew = crew
        },
        calc_crew: function() {
            total = {
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
            }
            for(var i in this.crew) {
                skills = this.crew_get_skills(this.crew[i])
                for(var s in skills) {
                    total[s] += skills[s]
                }
            }
            this.crew_pool = total;
        },
        calc_crew_perc: function() {
            if(!this.ship_stats){ console.log("enoship_pool"); return;}
            pool_perc = {}
            for(var i in this.crew_pool) {
                pool_perc[i] = this.crew_pool[i]/(this.ship_stats['skill_' + i]*2) * 100
            }
            console.log("pool")
            console.log(pool_perc)
            this.crew_ship_pool_perc = pool_perc
        },
        calc_damage: function() {
            ship_damage = {}
            damage_perc = {}
            max = 0
            function add_dmg(range, dmg) {
                current = (ship_damage[range]|0)
                dmg = current + dmg;
                if(dmg > max) { max = dmg}
                ship_damage[range] = dmg;

            }
            for(var i in this.current.components) {
                comp = this.components[this.current.components[i]];
                if(comp.type != 'weapon'){ continue}
                range = comp.weapon.range
                valid_ranges = {
                    1: [range+1],
                    2: [range-1, range+1],
                    3: [range-1, range+1],
                    4: [range-1, range+1],
                    5: [range-1, range+1],
                    6: [range-1, range+1],
                    7: [range-1],
                }
                add_dmg(range, comp.weapon.damage_min)
                valid_r = valid_ranges[comp.weapon.weapon_type]
                for(var i in valid_r) {
                    add_dmg(valid_r[i], comp.weapon.damage_min * 0.8)
                }
            }
            for(var i in ship_damage) {
                damage_perc[i] = parseInt(ship_damage[i]/max * 100)
            }
            this.ship_damage = ship_damage
            this.ship_damage_perc = damage_perc

        },
        set_component: function(slot_id, component_id) {
            Vue.set(this.current.components, slot_id, component_id);
        },

        get_components: function(id_list) {
            components = []
            for(var i in id_list) {
                component_id = id_list[i];
                comp = this.components[component_id];
                components.push({"id": i, "component": comp});
            }
            return components
        },
        get_slots: function(slots, slot_size) {
            size_components = []
            for(i in slots){
                slot_id = slots[i].id
                comp = slots[i].component
                if(comp.size == slot_size) {
                    size_components.push({"id": slot_id, "component": comp})
                }
            }
            return size_components;
        },
    },
    beforeCreate: function() {

        fetch("data/jobs.json")
        .then(r => r.json())
        .then(json => {
            this.jobs = json
        })
        fetch("data/components.json")
        .then(r => r.json())
        .then(json => {
            this.components = json;
            fetch("data/ships.json")
            .then(r => r.json())
            .then(json => {
                this.ships = json;
                // this.update_ships_dropdown();
                if(localStorage.current) {
                    this.current = JSON.parse(localStorage.current);
                    this.current_id = this.current._id
                }
            })
        })
    },
})
