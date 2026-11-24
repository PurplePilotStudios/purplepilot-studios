/*
 * PURPLEPILOT STUDIOS — ONE PLACE TO EDIT THE SITE
 * Empty URLs intentionally hide links until you supply the real ones.
 * Purple Bot can update this file through GitHub in the future.
 */
window.PURPLEPILOT_CONFIG = {
  studio: {
    name: "PurplePilot Studios",
    tagline: "Small worlds. Big fun.",
    description: "Original Roblox experiences crafted with creativity and AI-assisted development.",
    contactEmail: "", // Add your real studio email if you want it publicly visible.
    communityUrl: "https://www.roblox.com/share/g/487500166", // Official PurplePilot Studios Roblox community.
  },
  socials: [
    // TikTok stays hidden until its account is rebranded and the handle is confirmed.
    { name: "TikTok", handle: "@purplepilotstudios", url: "", plannedUrl: "https://www.tiktok.com/@purplepilotstudios" },
    { name: "Instagram", handle: "@purplepilotstudios", url: "https://www.instagram.com/purplepilotstudios/" },
    { name: "YouTube", handle: "@PurplePilotStudios", url: "https://www.youtube.com/@PurplePilotStudios" },
  ],
  // Platform-specific Roblox campaigns. These are for posting on each platform.
  // Website Play buttons should eventually use separately generated Website campaigns.
  games: [
    {
      id: "type-your-power-weapon",
      name: "Type Your Power + Weapon",
      eyebrow: "POWER UP",
      type: "Word-based battle game",
      description: "Choose your power, pick your weapon, and take on the competition.",
      status: "playable",
      // Temporary until a dedicated Website campaign or canonical experience URL is provided.
      url: "https://www.roblox.com/join/vswln",
      campaigns: {
        tiktok: "https://www.roblox.com/join/vswln",
        instagram: "https://www.roblox.com/join/wx88u",
        youtube: "https://www.roblox.com/join/w8phj",
        website: "",
      },
      art: "power",
      featured: true,
    },
    {
      id: "christmas-obby",
      name: "Christmas Obby 2026",
      eyebrow: "HOLIDAY GAME",
      type: "Obstacle course",
      description: "A festive obstacle-course adventure. Jump in and see how far you can make it.",
      status: "playable",
      // Canonical link; website traffic won't be misattributed to a social campaign.
      url: "https://www.roblox.com/games/71224004487082/Christmas-Obby-2026",
      campaigns: {
        tiktok: "https://www.roblox.com/join/hul79",
        instagram: "https://www.roblox.com/join/svvtm",
        youtube: "https://www.roblox.com/join/x50vy",
        website: "",
      },
      art: "christmas",
      featured: false,
    },
    {
      id: "arcade-experience",
      name: "Arcade Experience",
      eyebrow: "GAME COLLECTION",
      type: "Arcade collection",
      description: "Explore a growing arcade packed with different games, challenges, and rewards.",
      status: "playable",
      // Temporary until a dedicated Website campaign or canonical experience URL is provided.
      url: "https://www.roblox.com/join/jpsch",
      campaigns: {
        tiktok: "https://www.roblox.com/join/jpsch",
        instagram: "https://www.roblox.com/join/d582y",
        youtube: "https://www.roblox.com/join/h5jew",
        website: "",
      },
      art: "arcade",
      featured: false,
    },
  ],
  // Curated clips: { gameId: "christmas-obby", title: "Gameplay", url: "https://www.youtube.com/shorts/VIDEO_ID" }
  // Add only actual published clips; YouTube URLs (including Shorts) are supported.
  clips: [],
  announcement: {
    eyebrow: "STUDIO UPDATE",
    title: "Three ways to play. More on the way.",
    body: "Play Type Your Power + Weapon, Christmas Obby 2026, and Arcade Experience. New experiences are on the way.",
  },
};
