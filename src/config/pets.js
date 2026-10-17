let Role = [
    'customer',
    'host',
    'admin'
]

let PetTypes = [
    "Dog",
    "Cat",
    "Bird",
    "smallPet"
];

let petGender = [
    'Male',
    'Female'
]

let petSize = [
    'Small',
    'Medium',
    'Large'
]

let amenities = [
     '24/7_CCTV',
    'ac_rooms',
    'agility_setup',
    'anti_tick_treatment',
    'cage_free',
    'cooler',
    'customized_meals',
    'daily_cleanings',
    'daily_real_time_stamped_photo_video',
    'dry_dog_food',
    'extended_hours',
    'fresh_drinking_water',
    'glass_doors',
    'grooming',
    'home_food',
    'individual_cage',
    'personal_beds',
    'pet_cafe',
    'pet_friendly_music',
    'pet_store',
    'pick_and_drop_facility',
    'play_areas',
    'plush_blankets',
    'scheduled_leash_walks',
    'solo_attention',
    'spa',
    'swimming',
    'vaccinated_pets_only',
    'veg_meals',
    'veterinary_support'
]

let bookingType = [
    'hourly',
    'daily',
    'multidays'
]

let bookingStatus = [
    'initiated',
    'scheduled',
    'running',
    'completed',
    'cancelled'
]

let hostStatus = [
    'verified',
    'unverified',
    'rejected',
    'suspend'
]

let bussinessType = [
    'Homestay',
    'Professional'
]

let property = [
    'Owned',
    'Rented'
]

let Services = [
    'overnight_multiday_boarding',
    'emergency_boarding'
]

module.exports = {
    hostStatus,
    petGender,
    bookingStatus,
    PetTypes,
    amenities,
    bookingType,
    bussinessType,
    property,
    Services,
    petSize,
    Role
};