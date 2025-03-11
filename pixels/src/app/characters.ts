export type ch_array = {
    character: number,
    character_name: string,
    description: string,
}
export const character_array: ch_array[] = [
{
    character : 1,
    character_name: "Ghost_Rider",
    description : "lor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco "
},{
    character : 2,
    character_name: "Mario",
    description : "lor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco "
},{
    character : 3,
    character_name : "Buu",
    description : "lor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco "
},{
    character : 4,
    character_name : "Sasuke",
    description : "lor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco "
},{
    character : 5,
    character_name : "Naruto",
    description : "lor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco "
}];
let n = character_array.length;
export function get_random() : ch_array{
    return character_array[Math.floor(Math.random() * n)];
}