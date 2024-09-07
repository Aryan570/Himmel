import Start from "./components/Start";
export default function Home() {
  return (
    <main className="min-h-screen min-w-full w-full h-full">
      <div className="bg-[url('/background3.gif')] aspect-video bg-no-repeat w-screen h-screen bg-contain bg-center flex justify-center items-center">
        <Start />
      </div>
    </main>
  );
}
