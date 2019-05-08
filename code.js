protobuf.load('proto.json').then(x => proto = x)
function CopyToClipboard(text) {
  var textArea = document.createElement("textarea");

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a
  // flash, so some of these are just precautions. However in
  // Internet Explorer the element is visible whilst the popup
  // box asking the user for permission for the web page to
  // copy to the clipboard.
  //

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = '0';

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';


  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
};

Vue.use(SemanticUIVue);
var bus = new Vue();
var EVT_COMPONENT_MODAL_OPEN = 'EVT_COMPONENT_MODAL_OPEN'
var EVT_TALENT_MODAL_OPEN = 'EVT_TALENT_MODAL_OPEN'
var EVT_FILL_SHIP_POOLS = 'EVT_FILL_SHIP_POOLS'


function ROUND_2(f) {
    return Math.round(f * 100);
}

function COMP_CALC_ARMOR_PC(armor) {
    return (0.06 * armor) / (1 + ( 0.06 * Math.abs(armor)));
}

function COMP_CALC_SHIELD_PC(shield) {
    return (0.03 * shield) / (1 + ( 0.03 * Math.abs(shield)));
}

function PROP_DISP(skillname) {
    if(skillname == 'shipops'){return 'Ship Ops'}
    return skillname[0].toUpperCase() + skillname.slice(1)
}

function killme() {
    asd = []
    for(var i=1; i<33; i++) {
        asd.push({'key': i, 'text': i.toString(), 'value': i})
    }
    return asd
}

Vue.mixin({
    data: function() {
        return {
            DROPDOWN_LEVELS: killme(),
        }
    },
    filters: {
        shield_pc: function(value) {
            return ROUND_2(COMP_CALC_SHIELD_PC(value));
        },
        armor_pc: function(value) {
            return ROUND_2(COMP_CALC_ARMOR_PC(value));
        },
        comp_disp_name: function(comp) {
            if(comp.shortname) {return comp.shortname}
            return comp.name
        }
    },
    methods: {


        postprocess_comp: function(components) {
            function process_description(component) {
                DESC_TYPE = {
                    'bridge':           c => c.officers == 1 ? "Ship's Command Center; includes Captain's quarters" : '',
                    'weaponslocker':    c => "Provides weaponry and armor for all crew",
                    "hyperwarp":        c => `Enables Hyperwarp Jump of a ${c.drive_mass} Mass Ship for ${c.jump_cost} Fuel`,
                    "engine":           c => `Burns ${c.engine.fuel_map} Fuel per AU at ${c.engine.safety}% safety; Burns ${c.engine.fuel_combat} Fuel per Combat`,
                    'weapon':           c => `lvl ${c.weapon.level} ${c.weapon._weapon_type_text}; +${c.weapon.accuracy} Accuracy at Optimal Range of ${c.weapon.range}; Strikes with ${c.weapon.crit}% Critical and ${c.weapon.effect_chance}% Crippling Chance`,
                    'mass':             c => `Reduces mass to allow for other Components,`,
                    'medical':          c => `${c.medical} Medical Rating`,
                }
                DESC = {
                    'crew':             c => `Quarters for ${c.crew} crew,`,
                    'passengers':       c => `Houses ${c.passengers} Passenger${c.passengers > 1 ? 's' : ''},`,
                    'prisoners':        c => `Detains ${c.prisoners} Prisoner${c.prisoners > 1 ? 's' : ''},`,

                    'rad_res':          c => `+${c.rad_res} Radiation Resist,`,
                    'void_res':         c => `+${c.void_res} Void Resist,`,
                    'acc':              c => `+${c.acc} Accuracy,`,
                    'acc_craft':        c => `+${c.acc_craft}% to Hit Craft,`,
                    'dmg':              c => `+${c.dmg}% Dmg,`,
                    'crit':             c => `+${c.crit}% Critical,`,

                    'cargo':            c => `Stores ${c.cargo} Cargo,`,
                    'fuel':             c => `Adds ${c.fuel} Fuel Capacity,`,
                    'armor':            c => `+${ROUND_2(COMP_CALC_ARMOR_PC(c.armor))}% Armor,`,
                    'shield':           c => `+${ROUND_2(COMP_CALC_SHIELD_PC(c.shield))}% Shielding,`,
                    'officers':         c => c.type != 'bridge' ? `Quarters for ${c.officers} officers,`: '',
                    'craft':            c => `Adds ${c.craft} Craft Hangar,`,
                    'jump_cost':        c => c.type != 'hyperwarp' ? `${c.jump_cost > 0 ? '+' : '-'}${c.jump_cost} Jump Cost` : '',

                }
                description = [];
                base_desc = component.base_desc
                if(base_desc) {
                    description.push(base_desc + ';')
                }
                var type_desc_fmt = DESC_TYPE[component.type]
                if(type_desc_fmt) {
                    description.push(type_desc_fmt(component))
                }
                for(var tag in DESC) {
                    value = component[tag]
                    if(value === undefined) {continue;}
                    text = DESC[tag](component)
                    description.push(text)
                }
                comp._description = description.join(' ')
        }
            function process_weapon(comp) {
                var weapon_types = {
                    1: "Autocannon",
                    2: "Lance",
                    3: "Plasma Cannon",
                    4: "Railgun",
                    5: "Gravity Driver",
                    6: "Missile System",
                    7: "Torpedo",
                }
                comp.weapon._weapon_type_text = weapon_types[comp.weapon.weapon_type]

            }
            for(var i in components) {
                comp = components[i]
                if(comp.type == 'weapon'){
                    process_weapon(comp)
                }

                process_description(comp)

            }
            return components;
        },
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

        get_ship_stat: function(ship_stats, stat_name) {
                return ship_stats[stat_name] | ship_stats['skill_' +stat_name]
        },
        calc_crew_perc: function(ship_stats, crew_pool) {
            pool_perc = {
                'pilot': 0,
                'shipops': 0,
                'gunnery': 0,
                'electronics': 0,
                'navigation': 0,
            }
            for(var i in pool_perc) {
                pool_perc[i] = (crew_pool[i]|0)/(this.get_ship_stat(ship_stats, i)*2) * 100
            }
            return pool_perc

        },
        comp_get_description: function(component) {
            return component._description;
        },
        comp_parse_extra_props: function(component) {
            var img = this.img_get_prop
            if(component.type == 'engine') {
                var engine = component.engine;
                return [
                    {'val': `${engine.speed} Speed`, 'img': img('speed')},
                    {'val': `${engine.agility} Agility`, 'img': img('agility')},
                    {'val': `${engine.ap} AP / ${engine.ap_cost} Change Range`, 'img': img('engine')}
                ]

            }
            if(component.type == 'weapon') {
                var weap = component.weapon;
                var data = [
                    {'val': `${weap.ap} RP to Fire`, 'img': img('engine')},
                    {'val': `${weap.damage_min}-${weap.damage_max} Damage`, 'img': img('damage')},
                ]
                if(weap.effect) {
                    data.push(
                        {'val': `${weap.effect_min}-${weap.effect_max} ${weap.effect[0].toUpperCase() + weap.effect.slice(1)} Dmg`, 'img': img(weap.effect)},
                    )
                }
                return data;

            }
            return []
        },
        comp_parse_props: function(component) {
            props = []
            for(var i in component) {
                if(!i.startsWith('skill_')) {continue;}
                img = this.img_get_prop(i.replace('skill_', ''));
                name = i.replace('skill_', '').replace('_', ' ');
                val = component[i];
                props.push({'img': img, 'val': `${val} ${PROP_DISP(name)}`} )

            }
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


Vue.component('crew-wizard', {
    template: '#crew-wizard',
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
            new_crew = []
            stat_job = {
                'pilot': 24,
                'shipops': 1,
                'gunnery': 4,
                'electronics': 3,
                'navigation': 16,

            }
            crew_stats = {
                'pilot' : 0,
                'shipops': 0,
                'gunnery': 0,
                'electronics': 0,
                'navigation': 0
            }
            for(var i in crew_stats) {
                level = Number(this.level)
                crewman = {'job': this.jobs[stat_job[i]], 'level': level}
                crewman_skills = this.crew_get_skills(crewman)
                crewman_skill = crewman_skills[i]

                ship_stat = Math.round(this.get_ship_stat(this.ship_stats, i) * 1);
                stat_delta = ship_stat - crew_stats[i]
                if(stat_delta <= 0){continue;}
                crew_no = Math.ceil(stat_delta/crewman_skill)
                console.log(stat_delta, crewman_skills)
                for(var cs in crewman_skills) {
                    crew_stats[cs] += crewman_skills[cs]
                }
                new_crew.push({'job': crewman.job, 'count': crew_no, 'level': level})
            }
            this.new_crew = new_crew
        },
        fill: function() {
            bus.$emit(EVT_FILL_SHIP_POOLS, this.new_crew)
            this.open = false;
        }
    }
});

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
    props: ['crew', "jobs"],
    data: function() {
        return {
            sort_key: null,
            job_dropdown_current: null,
            new_crewman_job: null,
            new_crewman_level: null,
            global_crewman_level: null,
        }
    },
    watch: {
        new_crewman_job: function(){
            job = this.jobs[this.new_crewman_job]
            this.new_crewman_job = null
            new_crew = [{'job': job, 'count': 1, 'level': 1}]
            bus.$emit(EVT_FILL_SHIP_POOLS, new_crew)
        },
        global_crewman_level: function(){
            if(!this.global_crewman_level){return;}
            for(var i in this.crew) {
                this.crew[i].level = this.global_crewman_level;
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
                    'image': {'src': this.img_get_job(this.jobs[i])},
                })
            }
            return d_jobs;
        },
        del_crewman: function(key) {
            this.crew.splice(key, 1)
        },
        copy_crewman: function(key) {
            this.crew.push(this.crew[key])
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


Vue.component("talent-modal", {
    template: "#talent-modal",
    props: ['talents'],
    created: function() {
        bus.$on(EVT_COMPONENT_MODAL_OPEN, idx, crewman => {
            this.idx=idx;
            this.crewman=crewman
            this.toggle()
        })
    },
    data: function() {
        return {
            "open": false,
            "idx": 0,
            "crewman": null,
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
                // localStorage.current = JSON.stringify(val);
                this.calc_damage();
                this.component_rolling_stats();
                this.update_crew_perc();
            }
        },
        crew: {
            deep: true,
            handler: function(val, old_val) {
                this.calc_crew();
                this.update_crew_perc();
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
        stfx_export_crew: function() {
            crew_export = []
            for(var i in this.crew) {
                c = this.crew[i]
                crew_export.push({
                    'job': c.job._id,
                    'level': c.level,
                    'talents': [],
                })
            }
            return crew_export
        },
        stfx_export: function() {
            data = {
                'ver': 1,
                'shipId': this.current._id,
                'components': this.current.components,
                'crew': this.stfx_export_crew()
            }
            data = proto.STFX.encode(data).finish()
            data_c = new Uint8Array(LZMA.compress(data))
            console.log(data)
            console.log(data_c)
            data_base = base64js.fromByteArray(data_c)
            document.location.hash = data_base
            CopyToClipboard(document.location.href);
        },
        stfx_import: function(data_base) {
            data_c = base64js.toByteArray(data_base)
            console.log(data_c)
            data = LZMA.decompress(data_c)
            if(typeof(data) == 'string') {
                byte_data = new Uint8Array(data.length)
                for(var i in data) {
                    byte_data[i] = data.charCodeAt(i)
                }
                data = byte_data;
            }
            else {
                data = new Uint8Array(data);
            }
            console.log(data)
            stfx = proto.STFX.decode(data)
            console.log(stfx.shipId)
            console.log(stfx)
            this.stfx_import_ship(stfx.shipId, stfx.components)
            this.stfx_import_crew(stfx.crew)
        },
        stfx_import_ship: function(ship_id, components) {
            this.current = this.ships[ship_id]
            this.current_id = ship_id
            this.current.components = components
        },

        stfx_import_crew: function(crewmen) {
            crew = []
            for(var i in crewmen) {
                c = crewmen[i]
                crew.push(this.make_crewman(c.job, c.level))
            }
            this.crew = crew;
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
        update_crew_perc: function() {
            if(!this.ship_stats){ console.log("enoship_pool"); return;}
            pool_perc = this.calc_crew_perc(
                this.ship_stats,
                this.crew_pool
            )
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
    created: function() {
        bus.$on(EVT_FILL_SHIP_POOLS, fill_crew => {
            for(var i in fill_crew) {
                entry = fill_crew[i];
                for(var i=0; i<entry.count;i++) {
                    this.crew.push(
                        this.make_crewman(entry.job._id, entry.level)
                    )
                }
            }
        })
    },
    beforeCreate: function() {
        fetch("data/data.json")
        .then(r => r.json())
        .then(json => {
            this.talents = json.talents
            this.components = this.postprocess_comp(json.components)
            this.jobs = json.jobs
            this.ships = json.ships
            hash = document.location.hash.slice(1)
            if(hash) {
                this.stfx_import(hash)
            }
        })
    },
})
