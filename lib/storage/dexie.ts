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

// ✅ NOUVEAU : Ottoman Types
export interface OttomanAreaEntity {
  id: string;
  areaIndex: number;
  costs: {
    [key: string]: number | Array<{ type: string; amount: number }>;
  };
  hidden: boolean;
  updatedAt: number;
}

export interface OttomanTradePostEntity {
  id: string;
  name: string;
  area: number;
  resource: string;
  levels: {
    unlock: boolean;
    lvl2: boolean;
    lvl3: boolean;
    lvl4: boolean;
    lvl5: boolean;
  };
  costs: {
    [key: string]: number | Array<{ type: string; amount: number }>;
  };
  sourceData?: {
    levels: {
      [key: number]: Array<{ resource: string; amount: number }>;
    };
  };
  hidden: boolean;
  updatedAt: number;
}

// Wiki DB - buildings, technologies, and Ottoman
export class RocWikiDB extends Dexie {
  buildings!: Table<BuildingEntity, string>;
  technos!: Table<TechnoEntity, string>;
  ottomanAreas!: Table<OttomanAreaEntity, string>;
  ottomanTradePosts!: Table<OttomanTradePostEntity, string>;

  constructor() {
    super("roc_wiki_db");

    // Version 1: Original tables
    this.version(1).stores({
      buildings: "id,updatedAt",
      technos: "id,updatedAt",
    });

    // ✅ Version 2: Add Ottoman tables
    this.version(2).stores({
      buildings: "id,updatedAt",
      technos: "id,updatedAt",
      ottomanAreas: "id,areaIndex,updatedAt",
      ottomanTradePosts: "id,name,updatedAt",
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
