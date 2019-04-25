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
        parse_component_description: function(component) {
            DESC = {
                'armor': '+{armor}% armor',
                'shield': '+{shield}% shielding',
                'jump_cost': '+{jump_cost} jump cost',
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
            return '/assets/components/' + component.img + '.png';
        },
        img_get_prop: function(prop_name) {
            return '/assets/icons/icon_prop_' + prop_name + '.png';
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
        component_rolling_stats: function(slots) {
            rolling_components = []
            totals = {
                "mass": 0,
                "skill_pilot": 0,
                "skill_ship_ops": 0,
                "skill_electronics": 0,
                "skill_navigation": 0,
                "skill_gunnery": 0,
                "officers": 0,
                "armor": 0,
                "shield": 0,
                "jump_cost": 0,
                "install_cost": 0,
            }
            for(var i in slots) {
                component = slots[i].component
                slot_id = slots[i].id
                totals.mass += (component.mass|0)
                totals.skill_pilot += (component.skill_pilot|0)
                totals.skill_ship_ops += (component.skill_ship_ops|0)
                totals.skill_electronics += (component.skill_electronics|0)
                totals.skill_navigation += (component.skill_navigation|0)
                totals.skill_gunnery += (component.skill_gunnery|0)
                totals.officers += (component.officers|0)
                totals.armor += (component.armor|0)
                totals.shield += (component.shield|0)
                totals.jump_cost += (component.jump_cost|0)
                totals.install_cost += (component.install_cost|0)
                rolling_components.push({
                    "mass": totals.mass,
                    "skill_pilot": totals.skill_pilot,
                    "skill_ship_ops": totals.skill_ship_ops,
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
            return rolling_components;

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
        that = this;
        bus.$on(EVT_COMPONENT_MODAL_OPEN, function(cslot) {
            that.cslot = cslot;
            that.toggle()
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
        ship_pool: {},
        crew: [],
        crew_pool: {},
        crew_ship_pool_perc: {},
        ship_total_mass: 0
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
                this.calc_mass();
                this.calc_pools();
            }
        }
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
                    'image': {'src': this.img_get_ship_front_th(ship)},
                }
                result.push(shipdata)
            }
            return result;
            // this.ships_dropdown = result;
        },
        calc_damage: function() {
            ship_damage = {}
            damage_perc = {}
            max = 0
            for(var i in this.current.components) {
                comp = this.components[this.current.components[i]];
                if(comp.type != 'weapon'){ continue}
                current = (ship_damage[comp.weapon.range]|0)
                dmg = current + comp.weapon.damage_min;
                if(dmg > max) { max = dmg}
                ship_damage[comp.weapon.range] = dmg;
            }
            for(var i in ship_damage) {
                damage_perc[i] = parseInt(ship_damage[i]/max * 100)
            }
            this.ship_damage = ship_damage
            this.ship_damage_perc = damage_perc

        },
        calc_mass: function() {
            mass = 0
            for(var i in this.current.components) {
                comp = this.components[this.current.components[i]];
                mass += comp.mass
            }
            this.ship_total_mass = mass;

        },
        calc_pools: function() {
            var pools = {
                'pilot': 0,
                'gunnery': 0,
                'shipops': 0,
                'electronics': 0,
                'navigation': 0,
            }

            for(var i in this.current.components) {
                comp = this.components[this.current.components[i]];
                pools.pilot += (comp.skill_pilot|0)
                pools.gunnery += (comp.skill_gunnery|0)
                pools.shipops += (comp.skill_shipops|0)
                pools.electronics += (comp.skill_electronics|0)
                pools.navigation += (comp.skill_navigation|0)
            }
            this.ship_pool = pools;
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

        fetch("/data/jobs.json")
        .then(r => r.json())
        .then(json => {
            this.jobs = json
        })
        fetch("/data/components.json")
        .then(r => r.json())
        .then(json => {
            this.components = json;
            fetch("/data/ships.json")
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
