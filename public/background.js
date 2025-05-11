chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    "tabpet:settings": {
      enabled: true,
      petName: "TabPet",
      speechEnabled: true
    }
  });
});
