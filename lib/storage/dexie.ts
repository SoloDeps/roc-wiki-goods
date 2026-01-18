import Dexie, { Table } from "dexie";

export type GoodsEntry = {
  type: string;
  amount: number;
};

export interface BuildingEntity {
  id: string;
  costs: {
    [key: string]: number | Array<{ type: string; amount: number }>;
  };
  maxQty: number;
  quantity: number;
  hidden: boolean;
  updatedAt: number;
}

export interface TechnoEntity {
  id: string;
  costs: {
    [key: string]: number | Array<{ type: string; amount: number }>;
  };
  hidden: boolean;
  updatedAt: number;
}

export interface UserResourceEntity {
  id: string;
  amount: number;
  type: string;
  lastUpdated: string;
  updatedAt: number;
}

// Wiki DB - buildings and technologies
export class RocWikiDB extends Dexie {
  buildings!: Table<BuildingEntity, string>;
  technos!: Table<TechnoEntity, string>;

  constructor() {
    super("roc_wiki_db");

    this.version(1).stores({
      buildings: "id,updatedAt",
      technos: "id,updatedAt",
    });

    this.open().catch((err) => {
      console.error("Failed to open roc_wiki_db:", err);
    });
  }
}

// Game DB - user resources
export class RocGameDB extends Dexie {
  userResources!: Table<UserResourceEntity, string>;

  constructor() {
    super("roc_game_db");

    this.version(1).stores({
      userResources: "id,type,updatedAt",
    });

    this.open().catch((err) => {
      console.error("Failed to open roc_game_db:", err);
    });
  }
}

export const db = new RocWikiDB();
export const gameDb = new RocGameDB();
