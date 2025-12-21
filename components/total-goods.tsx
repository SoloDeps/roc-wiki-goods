const ResourceItem = ({ icon, name, amount }: any) => {
  if (!icon && !name && !amount) return null;

  return (
    <div className="flex items-center h-[60px] gap-2 px-2 py-1.5 bg-white/5">
      {icon && <img src={icon} alt="" />}
      <div className="flex flex-col min-w-0">
        {name && (
          <span className="text-[10px] font-medium leading-tight uppercase">
            {name}
          </span>
        )}
        {amount !== undefined && (
          <span className="text-sm font-bold text-amber-900 leading-tight">
            {amount.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

const EraBlock = ({ title, bg, resources }: any) => {
  // on complète à 3 ressources minimum (ou 6 si tu veux 2 lignes, etc.)
  const padded = [...resources];
  while (padded.length < 3) {
    padded.push({}); // “slot” vide mais garde la place
  }

  return (
    <section className="rounded-md overflow-hidden bg-white/5">
      <header className={`${bg} py-1 px-2 border-b-2 border-background`}>
        <h3 className="text-xs font-bold uppercase tracking-wide text-white">
          {title}
        </h3>
      </header>

      {/* 3 colonnes fixes, pas de divide conditionnel */}
      <div className="grid grid-cols-3">
        {padded.map((r: any, i: any) => (
          <ResourceItem key={i} {...r} />
        ))}
      </div>
    </section>
  );
};


const GoodsDisplay = () => {
  return (
    <div className="grid grid-cols-[1.1fr_0.9fr] gap-3">
      {/* LIGNE 1 : Byzantine + Franks  |  Maya */}
      <div className="space-y-3">
        <EraBlock
          title="Byzantine Era"
          bg="bg-gradient-to-r from-orange-300 to-transparent"
          resources={[
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Planks.png/30px-Planks.png",
              name: "Planks",
              amount: 2070,
            },
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Parchment.png/30px-Parchment.png",
              name: "Parchment",
              amount: 2542,
            },
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Pepper.png/30px-Pepper.png",
              name: "Pepper",
              amount: 1170,
            },
          ]}
        />

        <EraBlock
          title="Age of the Franks"
          bg="bg-gradient-to-r from-green-300 to-transparent"
          resources={[
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Cartwheel.png/30px-Cartwheel.png",
              name: "Cartwheel",
              amount: 36,
            },
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Ink.png/30px-Ink.png",
              name: "Ink",
              amount: 541,
            },
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Salt.png/30px-Salt.png",
              name: "Salt",
              amount: 119,
            },
          ]}
        />
      </div>

      <div className="self-stretch flex">
        {/* Bloc allié centré verticalement en face des 2 ères */}
        <div className="m-auto w-full">
          <EraBlock
            title="Maya Empire"
            bg="bg-gradient-to-r from-lime-200 to-transparent"
            resources={[
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Ancestor_Mask.png/30px-Ancestor_Mask.png",
                name: "Ancestor Mask",
                amount: 23785,
              },
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Calendar_Stone.png/30px-Calendar_Stone.png",
                name: "Calendar Stone",
                amount: 16350,
              },
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Headdress.png/30px-Headdress.png",
                name: "Headdress",
                amount: 33299,
              },
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Ritual_Dagger.png/30px-Ritual_Dagger.png",
                name: "Ritual Dagger",
                amount: 30546,
              },
            ]}
          />
        </div>
      </div>

      {/* LIGNE 2 : Feudal + Iberian  |  Vikings */}
      <div className="space-y-3">
        <EraBlock
          title="Feudal Age"
          bg="bg-gradient-to-r from-amber-200 to-transparent"
          resources={[
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Barrel.png/30px-Barrel.png",
              name: "Barrel",
              amount: 1077,
            },
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Manuscript.png/30px-Manuscript.png",
              name: "Manuscript",
              amount: 173800,
            },
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Herbs.png/30px-Herbs.png",
              name: "Herbs",
              amount: 732,
            },
          ]}
        />

        <EraBlock
          title="Iberian Era"
          bg="bg-gradient-to-r from-orange-300 to-transparent"
          resources={[
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Door.png/30px-Door.png",
              name: "Door",
              amount: 53177,
            },
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Wax_Seal.png/30px-Wax_Seal.png",
              name: "Wax Seal",
              amount: 25672,
            },
            {
              icon: "https://riseofcultures.wiki.gg/images/thumb/Saffron.png/30px-Saffron.png",
              name: "Saffron",
              amount: 85276,
            },
          ]}
        />
      </div>

      <div className="self-stretch flex">
        <div className="m-auto w-full">
          <EraBlock
            title="Viking Kingdom"
            bg="bg-gradient-to-r from-sky-300 to-transparent"
            resources={[
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Mead.png/30px-Mead.png",
                name: "Mead",
                amount: 21958,
              },
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Ceramic_Treasure.png/30px-Ceramic_Treasure.png",
                name: "Ceramic Treasure",
                amount: 9931,
              },
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Gold_Treasure.png/30px-Gold_Treasure.png",
                name: "Gold Treasure",
                amount: 10701,
              },
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Stockfish.png/30px-Stockfish.png",
                name: "Stockfish",
                amount: 63813,
              },
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Spice_Treasure.png/30px-Spice_Treasure.png",
                name: "Spice Treasure",
                amount: 4150,
              },
              {
                icon: "https://riseofcultures.wiki.gg/images/thumb/Jewel_Treasure.png/30px-Jewel_Treasure.png",
                name: "Jewel Treasure",
                amount: 1479,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default GoodsDisplay;
