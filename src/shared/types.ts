export type PetMood = "idle" | "walk" | "sleep" | "happy";

export type TabPetSettings = {
  enabled: boolean;
  petName: string;
  speechEnabled: boolean;
  customAssetUrl: string;
  petScale: number;
  roamSpeed: number;
};

export const defaultSettings: TabPetSettings = {
  enabled: true,
  petName: "TabPet",
  speechEnabled: true,
  customAssetUrl: "",
  petScale: 1,
  roamSpeed: 1
};
