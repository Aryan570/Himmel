export type ch_array = {
    character: number,
    character_name: string,
    description: string,
}
export const character_array: ch_array[] = [{
    character: 1,
    character_name: "Kazuha",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco "
}, {
    character: 2,
    character_name: "Genos",
    description: "laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
},{
    character : 3,
    character_name: "Sonic",
    description : "lor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco "
}];
let i = character_array.length;
export function get_random() : ch_array{
    return character_array[Math.floor(Math.random() * i)];
}
// export type websocket_message = {
//     message_type : "matchmaking" | "game_state_update"
// }