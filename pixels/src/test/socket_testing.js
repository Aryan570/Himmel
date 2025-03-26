import ws from 'k6/ws';
import { check } from 'k6';

export let options = {
  vus: 100,
  // duration : '10s',
  // iterations : 100,
  stages: [
    { duration: '5s', target: 50 },
    { duration: '10s', target: 100 },
    { duration: '5s', target: 10 }
  ],
}
const character_array = [
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
    }]
// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
    const url = "ws://127.0.0.1:8000";
    const response = ws.connect(url, null, function (socket) {
      socket.on("open", () => {
        const random_character = character_array[Math.floor(Math.random() * character_array.length)];
        socket.send(random_character.character_name);
      });
  
      socket.on("message", (data) => {
        const res = JSON.parse(data);
        res.move_type = 2;
        socket.send(JSON.stringify(res));
      });
  
      socket.on("close", () => {
        console.log("Disconnected");
      });
  
      socket.on("error", (e) => {
        console.error("Error:", e);
      });

      socket.setTimeout(() => {
        socket.close();
      }, 3000);
    });

    check(response, { "status is 101": (r) => r && r.status === 101 });
  }