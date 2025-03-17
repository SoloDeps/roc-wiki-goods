import { buildings } from "./constants";

function App() {
  const buildingNames = buildings.flatMap((obj) => Object.keys(obj));

  // Regrouper les noms en sous-tableaux de 3 éléments
  const groupedBuildingNames = [];
  for (let i = 0; i < buildingNames.length; i += 3) {
    groupedBuildingNames.push(buildingNames.slice(i, i + 3));
  }

  return (
    <div className="popup p-4 bg-neutral-800">

      {groupedBuildingNames.map((group, index) => (
        <div key={index}>
          <h3>Groupe {index + 1}</h3>
          <ul>
            {group.map((building, idx) => (
              <li key={idx}>{building}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
