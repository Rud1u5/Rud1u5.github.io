// ============================================================
//  WRITEUPS DATA — Edit here to add new machines
//  Each object = one solved machine
// ============================================================
const WRITEUPS = [
  {
    id: "cl-byp4ss3d",
    title: "Byp4ss3d",
    platform: "CyLab",
    type: "challenge",
    category: "web",
    difficulty: "medium",
    locked: false,
    date: "2026-08-24",
    release_date: "2025-10-01",
    completed_date: "2026-08-24",
    avatar: "/assets/icon/web.svg",
    tags: ["burp-suite", "file-upload", "web-exploitation"],
    desc: "Upload Filter Bypass / ID Card Verification."
  },
  {
    id: "cl-factcheck",
    title: "FactCheck",
    platform: "CyLab",
    type: "challenge",
    category: "reversing",
    difficulty: "medium",
    locked: false,
    date: "2026-08-13",
    release_date: "2024-xx-xx",
    completed_date: "2026-08-12",
    avatar: "/assets/icon/reversing.svg",
    tags: ["ELF", "radare2", "debugging", "little-endian"],
    desc: "Dynamic flag assembly in ELF binary; extracted via radare2 debugging and heap inspection."
  },
  {
    id: "cl-keygenme",
    title: "Keygenme",
    platform: "CyLab",
    type: "challenge",
    category: "reversing",
    difficulty: "hard",
    locked: false,
    date: "2026-08-11",
    release_date: "2022-xx-xx",
    completed_date: "2026-08-10",
    avatar: "/assets/icon/reversing.svg",
    tags: ["ELF", "x86-64", "radare2", "MD5"],
    desc: "Static reverse engineering of a stripped x86-64 ELF binary that dynamically reconstructs a hardcoded base string, derives an MD5 digest."
  },
  {
    id: "htb-armsrace",
    title: "ARMs Race",
    platform: "HTB",
    type: "challenge",
    category: "reversing",
    difficulty: "easy",
    locked: true,
    date: "2026-07-23",
    release_date: "2024-02-16",
    completed_date: "2026-07-23",
    avatar: "/assets/icon/reversing.svg",
    tags: ["ARM", "Unicorn Engine"],
    desc: "Automated solve of a 50-level timed ARM opcode challenge using Unicorn Engine emulation to compute register r0 within a timeout."
  },
  {
    id: "htb-wingdata",
    title: "WingData",
    platform: "HTB",
    type: "machine",
    os: "linux",
    difficulty: "easy",
    locked: false,
    date: "2026-04-23",
    release_date: "2026-02-14",
    completed_date: "2026-04-23",
    avatar: "https://htb-mp-prod-public-storage.s3.eu-central-1.amazonaws.com/avatars/d419202507a3bbf06e764c1c4a524f66.png",
    tags: ["CVE-2025-47812", "Lua", "CVE-2025-4517"],
    desc: "Unauthenticated RCE in Wing FTP Server v7.4.3 (CVE-2025-47812) and privilege escalation abusing python tar extraction (CVE-2025-4517)."
  },
];

// Helpers
const OS_ICONS = {
  linux: '<i class="fa-brands fa-linux"></i>',
  windows: '<i class="fa-brands fa-windows"></i>'
};
const DIFF_MAP = { easy: "Easy", medium: "Medium", hard: "Hard" };
const PLAT_CLASS = { HTB: "plat-htb", CyLab: "plat-cylab", THM: "plat-thm", DockerLabs: "plat-docker" };
const PLAT_LOGOS = {
  HTB: "Hackthebox-Logo.svg",
  CyLab: "CyLab-Logo.svg",
  THM: "Tryhackme-Logo.svg",
  DockerLabs: "Docker-Logo.svg"
};
