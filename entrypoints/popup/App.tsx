import { buildingsAbbr } from "../utils/constants";
import BuildingSelector from "./building-selector";

function App() {
  const [selections, setSelections] = useState(() => {
    const savedData = localStorage.getItem("buildingSelections");
    return savedData
      ? JSON.parse(savedData)
      : buildingsAbbr.map(() => ["", "", ""]);
  });

  return (
    <div className="p-4">
      {buildingsAbbr.map((group, index) => (
        <BuildingSelector
          key={index}
          buildings={group.buildings}
          index={index}
          selections={selections}
          setSelections={setSelections}
        />
      ))}
    </div>
  );
}

export default App;
