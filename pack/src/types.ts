export interface ComponentWeapon { 
    weapon_type: number
    _weapon_type_text?:string
    ap: number
    range: number
    damage_min: number
    damage_max: number
    effect_min: number
    effect_max: number
    effect: string
}
export interface ComponentEngine {
    speed: number
    agility: number
    ap: number
    ap_cost: number
}
export interface Component {
    [key:string]: any
    _id: number
    shortname?: string
    name: string
    img: string
    type: string
    size: string
    base_desc?: string
    _description?: string
    weapon?: ComponentWeapon
    engine?: ComponentEngine
    drive_mass?: number
}
export interface ComponentSlot {
    id: number
    component: Component
}
export interface CrewmanSlot {
    id: number
    crewman: Crewman
}

export interface Ship {
    _id: number
    faction?: number
    name: string
    skin_name: string
    hullpoints: number
    basemass: number
    smallslots: number
    mediumslots: number
    largeslots: number
    components: Component[]
    armor: number
    shield: number
    fuel: number
    max_craft: number
    max_crew: number
    max_officers: number
}

export interface JSONShip {
    _id: number
    faction?: number
    name: string
    skin_name: string
    hullpoints: number
    basemass: number
    smallslots: number
    mediumslots: number
    largeslots: number
    components: number[]
    armor: number
    shield: number
    fuel: number
    max_craft: number
    max_crew: number
    max_officers: number
}

export interface ShipStats {
    [key:string]: number
    pilot: number
    shipops: number
    gunnery: number
    electronics: number
    navigation: number
    officers: number
    passengers: number
    crew: number
    prisoners: number
    medical: number
    fuel: number
    craft: number
    armor: number
    shield: number
    jump_cost: number
    install_cost: number


}

export interface CrewStats {
    [key:string]: number
    pilot: number
    shipops: number
    gunnery: number
    electronics: number
    navigation: number

}
export interface JobTalent {
  talent: Talent
  level: number
}

export interface Talent {
    _id: number
    name: string
    desc: string
    cool: number
    type: number
    icon: string
}
export interface Job {
    _id: number
    name: string
    skills: string[]
    levels: [][]
}

export interface CrewJob {
  type: Job
  level: number
}

export interface ImportCrewman {
    job: number
    level: number
    talents: number[]
}

export interface FillCrewman {
    job: Job
    level: number
    count: number
}

export interface Captain {
  job1: CrewJob
  job2: CrewJob
  job3: CrewJob
  talents: Talent[]
}

export interface Crewman {
    job: CrewJob
    talents: Talent[]

}
