import dynamic from 'next/dynamic';
const Main = dynamic(() => import('./components/Main'), { ssr: false })
export default function Home() {
  return (
    // <main className="min-h-screen min-w-full w-full h-full">
    //   <div className="bg-[url('/background3.gif')] aspect-video bg-no-repeat w-screen h-screen bg-contain bg-center flex justify-center items-center">
    //     {/* <Start /> */}
    //   </div>
    // </main>
    <Main/>
  );
}
