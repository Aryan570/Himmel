use phf::phf_map;
pub struct Character {
    basic_attack : u8,
    debuff : u8,
}

macro_rules! c {
    ($ba : expr , $de : expr) => {
        Character {basic_attack : $ba , debuff : $de}
    };
}

pub static CHARS : phf::Map<&'static str, Character> = phf_map!{
    "Sonic" => c!(10,3),
    "Some_girl" => c!(8,5),
    "1" => c!(9,4)
};
