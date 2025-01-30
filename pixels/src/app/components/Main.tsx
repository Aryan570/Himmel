// import Login from './Login'
import { getServerAuthSession } from '../auth'
import Banner from './Banner';
const Main = async () => {
  const session = await getServerAuthSession();
  // console.log(session);
  return (
      <Banner/>
  )
}

export default Main
