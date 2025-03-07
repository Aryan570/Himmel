use phf::phf_map;
#[derive(Clone)]
pub struct Character {
    pub basic_attack : u8,
    pub debuff : u8,
    pub armor_rating : u8,
    pub regen : u8,
    pub additional_attack : u8,
}

macro_rules! c {
    ($ba : expr , $de : expr, $ar : expr, $rg : expr, $aa : expr) => {
        Character {basic_attack : $ba , debuff : $de, armor_rating : $ar, regen : $rg, additional_attack : $aa}
    };
}

pub static CHARS : phf::Map<&'static str, Character> = phf_map!{
    "Sonic" => c!(10,3,1,1,5),
    "Some_girl" => c!(8,5,0,2,5),
    "1" => c!(9,4,0,0,7),
    "Ghost_Rider" => c!(9,9,3,4,9),
    "Mario" => c!(5,5,0,2,4),
    "Buu" => c!(9,7,2,5,5)
};
