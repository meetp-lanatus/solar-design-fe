import Sidebar from '../../components/Sidebar';
import SolarMap from '../../components/Solarmap';

export const StepperForm = () => {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-1">
        <Sidebar />
      </div>
      <div className="flex-1">
        <SolarMap />
      </div>
    </div>
  );
};
