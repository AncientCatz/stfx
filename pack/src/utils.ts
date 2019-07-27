import * as types from "./types";
export function CopyToClipboard(text:string) {
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
}


export function ROUND_2(f:number) {
    return Math.round(f * 100);
}

export function COMP_CALC_ARMOR_PC(armor:number) {
    return (0.06 * armor) / (1 + ( 0.06 * Math.abs(armor)));
}

export function COMP_CALC_SHIELD_PC(shield:number) {
    return (0.03 * shield) / (1 + ( 0.03 * Math.abs(shield)));
}

export function PROP_DISP(skillname:string) : string {
    if(skillname == 'shipops'){return 'Ship Ops'}
    return skillname[0].toUpperCase() + skillname.slice(1)
}

export function killme() {
    var asd = []
    for(var i=1; i<33; i++) {
        asd.push({'key': i, 'text': i.toString(), 'value': i})
    }
    return asd
}

export function job_get_skills(job: types.Job, level:number) {
    var skills: {[index:string]: number}= {}
    var skill_names = job.skills
    for(var i in skill_names) {
        var name = skill_names[i];
        skills[name] = job.levels[level-1][i];
    }
    return skills;

}

export function crew_get_skills(crewman:types.Crewman) {
  return job_get_skills(crewman.job.type, crewman.job.level);
}

export function crew_get_skill(crewman:types.Crewman, skill:string) {
    var skills = crew_get_skills(crewman)
    return skills[skill]

}

export function get_ship_stat(ship_stats: types.ShipStats, stat_name: string) {
    return ship_stats[stat_name];
}

export function calc_crew_perc(ship_stats:types.ShipStats, crew_pool:types.CrewStats) {
    var pool_perc: { [index:string] : number } = {
        'pilot': 0,
        'shipops': 0,
        'gunnery': 0,
        'electronics': 0,
        'navigation': 0,
    }
    console.log("ship_stats", ship_stats);
    for(var i in pool_perc) {
        console.log(crew_pool[i], get_ship_stat(ship_stats, i), i);
        pool_perc[i] = (crew_pool[i]|0)/(get_ship_stat(ship_stats, i)*2) * 100
    }
    return pool_perc
}

export function get_slots(slots:types.ComponentSlot[], slot_size:string): types.ComponentSlot[] {
    var size_components: types.ComponentSlot[] = []
    for(var slot of slots){
        if(slot.component.size == slot_size) {
            size_components.push(slot);
        }
    }
    console.log("getSlots", size_components);
    return size_components;
}

export function comp_get_description(component: types.Component) {
    return component._description;
}

export function talent_get_description(talent: types.Talent) {
        return talent.desc;
}

export function talent_get_img(talent: types.Talent) {
        return talent.desc;
}

export function comp_parse_extra_props(component: types.Component) {
    var img = img_get_prop;
    if(component.type == 'engine') {
        var engine = component.engine!;
        return [
            {'val': `${engine.speed} Speed`, 'img': img('speed')},
            {'val': `${engine.agility} Agility`, 'img': img('agility')},
            {'val': `${engine.ap} AP / ${engine.ap_cost} Change Range`, 'img': img('engine')}
        ]

    }
    if(component.type == 'weapon') {
        var weap = component.weapon!;
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
}

export function img_get_ship_top(ship:types.Ship) {
    return 'assets/ships_top/' + ship.skin_name + '.png';
}

export function img_get_ship_front_th(ship:types.Ship) {
    return 'assets/th/ships/' + ship.skin_name + '.png';
}
export function img_get_ship_top_th(ship:types.Ship | types.JSONShip) {
    return 'assets/th/ships_top/' + ship.skin_name + '.png';
}
export function img_get_ship_front(ship:types.Ship) {
    return 'assets/ships/' + ship.skin_name + '.png';
}
export function img_get_job(job:types.Job) {
    return 'assets/jobs/' + job.name.toLowerCase().replace(' ', '_') + '.png'
}
export function img_get_talent(talent:types.Talent) {
    return 'assets/talents/' + talent.icon + '.png';
}
export function img_get_banner(banner_name: string) {
    return 'assets/banners/' + banner_name + '.png';
}
export function img_get_component(component:types.Component) {
    return 'assets/components/' + component.img + '.png';
}

export function img_get_craft(craft: types.Craft) {
    return 'assets/crafts_top/' + craft.img + '.png'
}
export function img_get_prop(prop_name:string) {
    return 'assets/icons/icon_prop_' + prop_name + '.png';
}

export function comp_disp_name(comp: types.Component) {
    if(comp.shortname) {return comp.shortname}
    return comp.name
}


function process_description(component:types.Component) {
    var DESC_TYPE: { [index:string] : (c:any) => string} = {
        'bridge':           (c:any) => c.officers == 1 ? "Ship's Command Center; includes Captain's quarters" : '',
        'weaponslocker':    (c:any) => "Provides weaponry and armor for all crew",
        "hyperwarp":        (c:any) => `Enables Hyperwarp Jump of a ${c.drive_mass} Mass Ship for ${c.jump_cost} Fuel`,
        "engine":           (c:any) => `Burns ${c.engine.fuel_map} Fuel per AU at ${c.engine.safety}% safety; Burns ${c.engine.fuel_combat} Fuel per Combat`,
        'weapon':           (c:any) => `lvl ${c.weapon.level} ${c.weapon._weapon_type_text}; +${c.weapon.accuracy} Accuracy at Optimal Range of ${c.weapon.range}; Strikes with ${c.weapon.crit}% Critical and ${c.weapon.effect_chance}% Crippling Chance`,
        'mass':             (c:any) => `Reduces mass to allow for other types.Components,`,
        'medical':          (c:any) => `${c.medical} Medical Rating`,
    }
    var DESC : { [index:string] : (c:any) => string}= {
        'crew':             (c:any) => `Quarters for ${c.crew} crew,`,
        'passengers':       (c:any) => `Houses ${c.passengers} Passenger${c.passengers > 1 ? 's' : ''},`,
        'prisoners':        (c:any) => `Detains ${c.prisoners} Prisoner${c.prisoners > 1 ? 's' : ''},`,

        'rad_res':          (c:any) => `+${c.rad_res} Radiation Resist,`,
        'void_res':         (c:any) => `+${c.void_res} Void Resist,`,
        'acc':              (c:any) => `+${c.acc} Accuracy,`,
        'acc_craft':        (c:any) => `+${c.acc_craft}% to Hit Craft,`,
        'dmg':              (c:any) => `+${c.dmg}% Dmg,`,
        'crit':             (c:any) => `+${c.crit}% Critical,`,

        'cargo':            (c:any) => `Stores ${c.cargo} Cargo,`,
        'fuel':             (c:any) => `Adds ${c.fuel} Fuel Capacity,`,
        'armor':            (c:any) => `+${ROUND_2(COMP_CALC_ARMOR_PC(c.armor))}% Armor,`,
        'shield':           (c:any) => `+${ROUND_2(COMP_CALC_SHIELD_PC(c.shield))}% Shielding,`,
        'officers':         (c:any) => c.type != 'bridge' ? `Quarters for ${c.officers} officers,`: '',
        'craft':            (c:any) => `Adds ${c.craft} Craft Hangar,`,
        'jump_cost':        (c:any) => c.type != 'hyperwarp' ? `${c.jump_cost > 0 ? '+' : '-'}${c.jump_cost} Jump Cost` : '',

    }
    var description = [];
    var base_desc = component.base_desc
    if(base_desc) {
        description.push(base_desc + ';')
    }
    var type_desc_fmt = DESC_TYPE[component.type]
    if(type_desc_fmt) {
        description.push(type_desc_fmt(component))
    }
    for(var tag in DESC) {
        var value = component[tag]
        if(value === undefined) {continue;}
        var text = DESC[tag](component)
        description.push(text)
    }
    component._description = description.join(' ')
}

function process_weapon(comp:types.Component) {
    let weap = comp.weapon!;
    var weapon_types: {[index:number] : string} = {
        1: "Autocannon",
        2: "Lance",
        3: "Plasma Cannon",
        4: "Railgun",
        5: "Gravity Driver",
        6: "Missile System",
        7: "Torpedo",
    }
    weap._weapon_type_text = weapon_types[weap.weapon_type];

}

export function postprocess_comp(components:types.Component[]) {
    for(var i in components) {
        var comp = components[i]
        if(comp.type == 'weapon'){
            process_weapon(comp)
        }
        process_description(comp)

    }
    return components;
}

export function get_craft_slots(crafts: types.Craft[]): types.CraftSlot[] {
  var craft_slots: types.CraftSlot[] = [];
  for(var i in crafts) {
    craft_slots.push({
      'id': parseInt(i),
      'craft': crafts[i]
    } as types.CraftSlot)
  }
  return craft_slots;
}

export function get_component_slots(components:types.Component[]): types.ComponentSlot[] {
  var componentSlots: types.ComponentSlot[] = [];
  for(var i in components) {
    componentSlots.push({
      'id': parseInt(i),
      'component': components[i]
    } as types.ComponentSlot)
  }
  console.log("componentSlots", componentSlots)
  return componentSlots;

}

export function comp_parse_props(component:types.Component) {
    var props = []
    for(var i in component) {
        // TODO: borked
        if(!i.startsWith('skill_')) {continue;}
        var img = img_get_prop(i.replace('skill_', ''));
        var name = i.replace('skill_', '').replace('_', ' ');
        var val = component[i];
        props.push({'img': img, 'val': `${val} ${PROP_DISP(name)}`} )
    }
    return props;
}


export function components_to_ids(components: types.Component[]): number[] {
    let component_ids = []
    for(let c of components) {
        component_ids.push(c._id);
    }
    return component_ids;
}

export function crafts_to_ids(crafts: types.Craft[]): number[] {
    let component_ids = []
    for(let c of crafts) {
        component_ids.push(c._id);
    }
    return component_ids;
}

export function component_rolling_stats(ship:types.Ship): [types.ShipStats, any] {
    var rolling_components = []
    var totals = {
        "hull": ship.hullpoints,
        "mass": 0,
        "pilot": 0,
        "shipops": 0,
        "electronics": 0,
        "navigation": 0,
        "gunnery": 0,
        "officers": 0,
        "passengers": 0,
        "crew": 0,
        "prisoners": 0,
        "medical": 0,
        "fuel": ship.fuel,
        "craft": 0,
        "armor": ship.armor,
        "shield": ship.shield,
        "jump_cost": 0,
        "install_cost": 0,
    } as types.ShipStats;
    for(const [slot_id, component] of ship.components.entries()) {
        for(var i in totals){
            totals[i] += (component[i]|0)
        }
        rolling_components.push({
            "mass": totals.mass,
            "pilot": totals.pilot,
            "shipops": totals.shipops,
            "electronics": totals.electronics,
            "navigation": totals.navigation,
            "gunnery": totals.gunnery,
            "officers": totals.officers,
            "armor": totals.armor,
            "shield": totals.shield,
            "jump_cost": totals.jump_cost,
            "install_cost": totals.install_cost,
            "component": component,
            "id": slot_id,
        });
    }
    return [totals, rolling_components];
    // this.ship_stats = totals;
    // return rolling_components;


}
