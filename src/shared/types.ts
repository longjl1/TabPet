export type PetMood = "idle" | "walk" | "sleep" | "happy";

export type TabPetSettings = {
  enabled: boolean;
  petName: string;
  speechEnabled: boolean;
};

export const defaultSettings: TabPetSettings = {
  enabled: true,
  petName: "TabPet",
  speechEnabled: true
};
