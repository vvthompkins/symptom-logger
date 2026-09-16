// Google OAuth Setup
const GOOGLE_CLIENT_ID = "483421872463-fbpp0fe6s8r91h1i62vfubdls19auafg.apps.googleusercontent.com";
const SPREADSHEET_ID = "1R9tTJ5qFplGBowABDZSY85jeGdQbkV1ICkzuQygEodE";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const PENDING_KEY = "symptomLoggerPendingEntries";

// Edit these objects to change the symptom and food choices.
const symptoms = {
  fatigue: {
    label: "Fatigue",
    details: []
  },
  pain: {
    label: "Pain",
    details: [
      "Lower Back",
      "Upper Back",
      "Mid Back",
      "Neck",
      "Shoulder(s)",
      "Hip(s)",
      "Knee(s)",
      "Hand(s)",
      "Feet",
      "Skin",
      "Widespread",
      "Other"
    ]
  },
  gi: {
    label: "GI",
    details: [
      "Bloating",
      "Abdominal pain",
      "Constipation",
      "Diarrhea",
      "Nausea",
      "Heartburn",
      "Other"
    ]
  },
  brain: {
    label: "Brain",
    details: [
      "Brain fog",
      "Depression",
      "Anxiety",
      "Migraine Aura",
      "Migraine",
      "Other"
    ]
  },
  heart: {
    label: "Heart and circulation",
    details: [
      "Palpitations",
      "Tachycardia",
      "Lightheadedness",
      "Other"
    ]
  },
  other: {
    label: "Other",
    details: []
  }
};

const foodCategories = [
  {
    key: "wheat_products",
    label: "Wheat / wheat products",
    description:
      "Wheat bread, regular pasta, flour tortillas, crackers, cookies, cakes, pastries, breadcrumbs, wheat-based cereal.",
    exclude:
      "Do not select for rice, oats, corn, quinoa, buckwheat, or potatoes."
  },
  {
    key: "onion_garlic",
    label: "Onion / garlic",
    description:
      "Onion, garlic, shallots, leeks (white/light-green parts), onion or garlic powder, and sauces or seasoning blends containing them.",
    exclude:
      "Do not select for herbs or spices that do not contain onion or garlic."
  },
  {
    key: "legumes",
    label: "Legumes",
    description:
      "Beans, chickpeas, lentils, split peas, hummus, and bean-based dips or spreads.",
    exclude:
      "Do not select for peanuts or ordinary green peas."
  },
  {
    key: "high_fodmap_fruit",
    label: "High-FODMAP fruit",
    description:
      "Apples, pears, mango, watermelon, cherries, peaches, nectarines, plums, apricots, and dried versions of these fruits.",
    exclude:
      "Do not select for berries, citrus, grapes, kiwi, pineapple, strawberries, or bananas."
  },
  {
    key: "high_fodmap_vegetables",
    label: "High-FODMAP vegetables",
    description:
      "Cauliflower, mushrooms, asparagus, artichokes, and other vegetables known to be high-FODMAP at the amount eaten.",
    exclude:
      "Do not select for carrots, spinach, bell peppers, tomatoes, potatoes, zucchini, cucumber, or lettuce."
  },
  {
    key: "high_fodmap_sweeteners",
    label: "High-FODMAP sweeteners",
    description:
      "Honey, agave syrup, high-fructose corn syrup, sorbitol, mannitol, xylitol, maltitol, and isomalt.",
    exclude:
      "Do not select for ordinary table sugar, maple syrup, glucose, or dextrose."
  },
  {
    key: "dairy",
    label: "Dairy",
    description:
      "Milk, ice cream, cream, yogurt, and fresh or soft cheeses.",
    exclude:
      "Do not select for lactose-free dairy or plant-based products unless another category applies."
  },
  {
    key: "high_fat",
    label: "High-fat / fried",
    description:
      "Deep-fried foods, very greasy foods, or meals that are obviously high in added fat.",
    exclude:
      "Do not select simply because a meal contains some oil, butter, nuts, avocado, or another source of fat."
  },
  {
    key: "spicy",
    label: "Spicy",
    description:
      "Hot peppers, chili flakes, cayenne, hot sauce, spicy salsa, or dishes that are noticeably hot/spicy.",
    exclude:
      "Do not select for ordinary black pepper or non-spicy herbs and spices."
  },
  {
    key: "caffeine",
    label: "Caffeine",
    description:
      "Coffee, espresso, caffeinated tea, energy drinks, caffeinated soda, and other caffeinated drinks or foods.",
    exclude:
      "Do not select for decaf coffee or caffeine-free drinks."
  },
  {
    key: "alcohol",
    label: "Alcohol",
    description:
      "Beer, wine, liquor, cocktails, and other alcoholic drinks.",
    exclude:
      "Do not select for nonalcoholic drinks."
  },
  {
    key: "carbonated",
    label: "Carbonated",
    description:
      "Seltzer, sparkling water, soda, kombucha, and other carbonated drinks.",
    exclude:
      "Do not select for still water or other non-carbonated drinks."
  },
  {
    key: "fermented_aged",
    label: "Fermented / aged",
    description:
      "Yogurt, kefir, kimchi, sauerkraut, kombucha, fermented vegetables, aged cheeses, and fermented soy products.",
    exclude:
      "Do not select simply because a food is stored or cooked; use this for intentionally fermented or aged foods."
  },
  {
    key: "cured_processed",
    label: "Cured / processed",
    description:
      "Bacon, salami, pepperoni, prosciutto, sausage, hot dogs, deli meats, smoked meats, and similar cured or processed meats.",
    exclude:
      "Do not select for fresh, unprocessed meat, poultry, or fish."
  },
  {
    key: "leftovers",
    label: "Leftovers / long-stored",
    description:
      "Food cooked previously and refrigerated or stored for a substantial period before you ate it.",
    exclude:
      "Do not select for food cooked and eaten immediately."
  }
];

let current = {
  symptom: null,
  details: [],
  severity: null
};

let currentFood = {};
let tokenClient = null;
let accessToken = null;

const screens = {
  home: document.getElementById("homeScreen"),
  symptom: document.getElementById("symptomScreen"),
  detail: document.getElementById("detailScreen"),
  severity: document.getElementById("severityScreen"),
  note: document.getElementById("noteScreen"),
  food: document.getElementById("foodScreen"),
  foodNote: document.getElementById("foodNoteScreen"),
  settings: document.getElementById("settingsScreen")
};

const status = document.getElementById("status");

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.add("hidden"));
  screens[name].classList.remove("hidden");
  status.textContent = "";
}

function getPendingEntries() {
  return JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
}

function savePendingEntries(entries) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(entries));
}

function addPendingEntry(entry) {
  const entries = getPendingEntries();
  entries.push(entry);
  savePendingEntries(entries);
}

function renderSymptoms() {
  const container = document.getElementById("symptomButtons");
  container.innerHTML = "";

  Object.entries(symptoms).forEach(([key, symptom]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = symptom.label;
    button.addEventListener("click", () => selectSymptom(key));
    container.appendChild(button);
  });
}

function selectSymptom(key) {
  current = {
    symptom: key,
    details: [],
    severity: null
  };

  const symptom = symptoms[key];

  if (symptom.details.length === 0) {
    showScreen("severity");
    return;
  }

  document.getElementById("detailHeading").textContent =
    `${symptom.label}: what kind?`;

  renderDetails(symptom.details);
  showScreen("detail");
}

function renderDetails(details) {
  const container = document.getElementById("detailButtons");
  container.innerHTML = "";

  details.forEach(detail => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = detail;

    button.addEventListener("click", () => {
      button.classList.toggle("selected");

      if (current.details.includes(detail)) {
        current.details = current.details.filter(item => item !== detail);
      } else {
        current.details.push(detail);
      }
    });

    container.appendChild(button);
  });
}

function renderFoodCategories() {
  const container = document.getElementById("foodButtons");
  container.innerHTML = "";

  foodCategories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "food-button";
    button.dataset.key = category.key;

    const label = document.createElement("strong");
    label.textContent = category.label;

    const examples = document.createElement("span");
    examples.textContent = `${category.description} ${category.exclude}`;

    button.append(label, examples);

    button.addEventListener("click", () => {
      button.classList.toggle("selected");
      currentFood[category.key] = button.classList.contains("selected");
    });

    container.appendChild(button);
  });
}

function resetFood() {
  currentFood = Object.fromEntries(
    foodCategories.map(category => [category.key, false])
  );

  document.querySelectorAll("#foodButtons button").forEach(button => {
    button.classList.remove("selected");
  });

  document.getElementById("foodNote").value = "";
}

function getFoodRow(entry) {
  return [
    entry.timestamp,
    ...foodCategories.map(category => entry[category.key]),
    entry.note
  ];
}

function getSymptomRow(entry) {
  return [
    entry.timestamp,
    entry.symptom,
    entry.details.join("; "),
    entry.severity,
    entry.note
  ];
}

function getAccessToken() {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith("YOUR_")) {
      reject(new Error("Google OAuth client ID has not been configured."));
      return;
    }

    if (accessToken) {
      resolve(accessToken);
      return;
    }

    if (!tokenClient) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SHEETS_SCOPE,
        callback: response => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }

          accessToken = response.access_token;
          resolve(accessToken);
        }
      });
    } else {
      tokenClient.callback = response => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }

        accessToken = response.access_token;
        resolve(accessToken);
      };
    }

    tokenClient.requestAccessToken({
      prompt: "consent"
    });
  });
}

async function appendToSheet(sheetName, row) {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.startsWith("YOUR_")) {
    throw new Error("Google Sheet ID has not been configured.");
  }

  if (!accessToken) {
    throw new Error("Google Sheets is not connected.");
  }

  const range = `${sheetName}!A1:ZZ`;
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append`
  );

  url.searchParams.set("valueInputOption", "RAW");
  url.searchParams.set("insertDataOption", "INSERT_ROWS");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      values: [row]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Google Sheets error: ${response.status}`
    );
  }
}

async function syncPendingEntries() {
  const pending = getPendingEntries();

  if (pending.length === 0) return;

  const remaining = [];

  for (const entry of pending) {
    try {
      const row = entry.type === "symptom"
        ? getSymptomRow(entry)
        : getFoodRow(entry);
      const sheet = entry.type === "symptom" ? "Symptoms" : "Food";

      await appendToSheet(sheet, row);
    } catch (error) {
      remaining.push(entry);
      break;
    }
  }

  savePendingEntries(remaining);
  updateDataStatus();

  if (remaining.length === 0 && pending.length > 0) {
    status.textContent = "All pending entries synced to Google Sheets.";
  }
}

async function saveSymptomEntry(note = "") {
  const entry = {
    type: "symptom",
    timestamp: new Date().toISOString(),
    symptom: current.symptom,
    details: current.details,
    severity: current.severity,
    note: note.trim()
  };

  addPendingEntry(entry);

  const symptomLabel = symptoms[current.symptom].label;

  current = {
    symptom: null,
    details: [],
    severity: null
  };

  document.getElementById("note").value = "";
  showScreen("home");
  status.textContent = `Saved: ${symptomLabel} · ${entry.severity}/4`;

  syncPendingEntries().catch(() => {});
}

async function saveFoodEntry(note = "") {
  const entry = {
    type: "food",
    timestamp: new Date().toISOString(),
    ...currentFood,
    note: note.trim()
  };

  addPendingEntry(entry);
  resetFood();
  showScreen("home");
  status.textContent = "Food logged.";

  syncPendingEntries().catch(() => {});
}

function updateDataStatus() {
  const pendingCount = getPendingEntries().length;
  document.getElementById("pendingCount").textContent = pendingCount;

  const connected = Boolean(accessToken);
  document.getElementById("connectionStatus").textContent = connected
    ? "Connected to Google Sheets"
    : "Not connected to Google Sheets";
}

document.getElementById("logSymptomButton").addEventListener("click", () => {
  showScreen("symptom");
});

document.getElementById("logFoodButton").addEventListener("click", () => {
  resetFood();
  showScreen("food");
});

document.getElementById("continueDetail").addEventListener("click", () => {
  showScreen("severity");
});

document.getElementById("skipDetail").addEventListener("click", () => {
  current.details = [];
  showScreen("severity");
});

document.getElementById("backToSymptoms").addEventListener("click", () => {
  showScreen("symptom");
});

document.getElementById("backToHomeFromSymptoms").addEventListener("click", () => {
  showScreen("home");
});

document.getElementById("backToDetail").addEventListener("click", () => {
  const details = symptoms[current.symptom].details;

  if (details.length === 0) {
    showScreen("symptom");
  } else {
    renderDetails(details);
    showScreen("detail");
  }
});

document.querySelectorAll("[data-severity]").forEach(button => {
  button.addEventListener("click", () => {
    current.severity = Number(button.dataset.severity);
    showScreen("note");
  });
});

document.getElementById("backToSeverity").addEventListener("click", () => {
  showScreen("severity");
});

document.getElementById("skipNote").addEventListener("click", () => {
  saveSymptomEntry();
});

document.getElementById("saveButton").addEventListener("click", () => {
  saveSymptomEntry(document.getElementById("note").value);
});

document.getElementById("continueFood").addEventListener("click", () => {
  showScreen("foodNote");
});

document.getElementById("backToHomeFromFood").addEventListener("click", () => {
  showScreen("home");
});

document.getElementById("backToFood").addEventListener("click", () => {
  showScreen("food");
});

document.getElementById("skipFoodNote").addEventListener("click", () => {
  saveFoodEntry();
});

document.getElementById("saveFoodButton").addEventListener("click", () => {
  saveFoodEntry(document.getElementById("foodNote").value);
});

document.getElementById("settingsButton").addEventListener("click", () => {
  updateDataStatus();
  showScreen("settings");
});

document.getElementById("closeSettings").addEventListener("click", () => {
  showScreen("home");
});

document.getElementById("connectButton").addEventListener("click", async () => {
  try {
    await getAccessToken();
    updateDataStatus();
    status.textContent = "Connected to Google Sheets.";
    await syncPendingEntries();
  } catch (error) {
    status.textContent = error.message;
  }
});

document.getElementById("syncButton").addEventListener("click", async () => {
  try {
    await syncPendingEntries();
    if (getPendingEntries().length > 0) {
      status.textContent = "Some entries could not be synced. Check your Google Sheets connection.";
    }
  } catch (error) {
    status.textContent = error.message;
  }
});

renderSymptoms();
renderFoodCategories();
resetFood();
updateDataStatus();

window.addEventListener("online", () => {
  syncPendingEntries().catch(() => {});
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
