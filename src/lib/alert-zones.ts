import type { AlertZone } from "@/types";

export const ALERT_ZONES: AlertZone[] = [
  {
    id: "ukraine-russia",
    name: "Ukraine / Russia Front",
    description:
      "Active armed conflict along the eastern and southern front lines of Ukraine, including occupied territories.",
    type: "active-conflict",
    severity: "red",
    polygon: [
      [52.4, 23.5],
      [52.4, 40.2],
      [44.3, 40.2],
      [44.3, 33.0],
      [46.0, 30.0],
      [48.5, 23.5],
    ],
  },
  {
    id: "gaza-israel",
    name: "Gaza / Israel",
    description:
      "Ongoing military operations in Gaza and surrounding areas. Humanitarian crisis zone.",
    type: "active-conflict",
    severity: "red",
    polygon: [
      [31.8, 34.0],
      [31.8, 34.7],
      [31.1, 34.7],
      [31.1, 34.0],
    ],
  },
  {
    id: "taiwan-strait",
    name: "Taiwan Strait",
    description:
      "Heightened military tension between China and Taiwan. Frequent naval and air incursions into the strait.",
    type: "tension-zone",
    severity: "amber",
    polygon: [
      [26.5, 117.0],
      [26.5, 122.5],
      [22.0, 122.5],
      [22.0, 117.0],
    ],
  },
  {
    id: "south-china-sea",
    name: "South China Sea",
    description:
      "Disputed maritime territory with overlapping claims from China, Vietnam, Philippines, Malaysia, and others.",
    type: "disputed-territory",
    severity: "amber",
    polygon: [
      [23.0, 109.0],
      [23.0, 121.0],
      [15.0, 121.0],
      [7.0, 117.0],
      [3.0, 110.0],
      [7.0, 105.0],
      [15.0, 109.0],
    ],
  },
  {
    id: "korean-dmz",
    name: "Korean DMZ",
    description:
      "Demilitarized zone between North and South Korea. One of the most heavily fortified borders in the world.",
    type: "tension-zone",
    severity: "amber",
    polygon: [
      [38.8, 124.5],
      [38.8, 128.5],
      [37.5, 128.5],
      [37.5, 124.5],
    ],
  },
  {
    id: "iran-israel",
    name: "Iran / Israel Tensions",
    description:
      "Elevated regional tension including proxy conflicts, missile threats, and nuclear program concerns.",
    type: "tension-zone",
    severity: "amber",
    polygon: [
      [37.5, 44.0],
      [37.5, 60.0],
      [25.0, 60.0],
      [25.0, 44.0],
    ],
  },
  {
    id: "sudan",
    name: "Sudan",
    description:
      "Civil war between SAF and RSF factions. Widespread displacement and humanitarian emergency.",
    type: "active-conflict",
    severity: "red",
    polygon: [
      [22.0, 21.8],
      [22.0, 38.6],
      [8.7, 38.6],
      [8.7, 21.8],
    ],
  },
  {
    id: "syria",
    name: "Syria",
    description:
      "Ongoing multi-party conflict with areas of active combat, territorial fragmentation, and foreign military presence.",
    type: "active-conflict",
    severity: "red",
    polygon: [
      [37.3, 35.7],
      [37.3, 42.4],
      [32.3, 42.4],
      [32.3, 35.7],
    ],
  },
];
