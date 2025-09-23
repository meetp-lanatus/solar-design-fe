import SolarMap from './components/Solarmap';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1">
        <SolarMap />
      </div>
    </div>
  );
}

export default App;
