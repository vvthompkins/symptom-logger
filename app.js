// Edit this object to change the symptom and detail choices.
const symptoms = {
  fatigue: {
    label: "Fatigue",
    details: []
  },
  pain: {
    label: "Pain",
    details: [
      "Back",
      "Hips",
      "Legs",
      "Abdomen",
      "Head",
      "Joints",
      "Widespread",
      "Skin",
      "Hands",
      "Neck",
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
      "Reflux",
      "Other"
    ]
  },
  dizziness: {
    label: "Dizziness",
    details: []
  },
  brain_fog: {
    label: "Brain fog",
    details: []
  },
  heart: {
    label: "Heart",
    details: [
      "Palpitations",
      "Fast heart rate",
      "Other"
    ]
  },
  headache: {
    label: "Headache",
    details: []
  },
  other: {
    label: "Other",
    details: []
  }
};

const STORAGE_KEY = "symptomLoggerEntries";

let current = {
  symptom: null,
  details: [],
  severity: null
};

const screens = {
  symptom: document.getElementById("symptomScreen"),
  detail: document.getElementById("detailScreen"),
  severity: document.getElementById("severityScreen"),
  note: document.getElementById("noteScreen"),
  settings: document.getElementById("settingsScreen")
};

const status = document.getElementById("status");

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.add("hidden"));
  screens[name].classList.remove("hidden");
  status.textContent = "";
}

function getEntries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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

  // If there are no details, skip directly to severity.
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

function saveEntry(note = "") {
  const entries = getEntries();

  entries.push({
    timestamp: new Date().toISOString(),
    symptom: current.symptom,
    details: current.details,
    severity: current.severity,
    note: note.trim()
  });

  saveEntries(entries);

  const symptomLabel = symptoms[current.symptom].label;
  status.textContent = `Saved: ${symptomLabel} · ${current.severity}/4`;

  current = {
    symptom: null,
    details: [],
    severity: null
  };

  document.getElementById("note").value = "";
  showScreen("symptom");

  // showScreen clears status, so restore it after the reset.
  status.textContent = `Saved: ${symptomLabel} · ${entries.at(-1).severity}/4`;
}

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
  saveEntry();
});

document.getElementById("saveButton").addEventListener("click", () => {
  saveEntry(document.getElementById("note").value);
});

document.getElementById("settingsButton").addEventListener("click", () => {
  document.getElementById("entryCount").textContent = getEntries().length;
  showScreen("settings");
});

document.getElementById("closeSettings").addEventListener("click", () => {
  showScreen("symptom");
});

document.getElementById("exportButton").addEventListener("click", () => {
  const entries = getEntries();

  if (entries.length === 0) {
    status.textContent = "There is no data to export.";
    return;
  }

  const header = ["timestamp", "symptom", "details", "severity", "note"];

  const rows = entries.map(entry => [
    entry.timestamp,
    entry.symptom,
    entry.details.join("; "),
    entry.severity,
    entry.note
  ]);

  const csv = [header, ...rows]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `symptoms-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
});

document.getElementById("clearButton").addEventListener("click", () => {
  const confirmed = window.confirm(
    "Delete all symptom data stored on this device? This cannot be undone."
  );

  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  document.getElementById("entryCount").textContent = "0";
  status.textContent = "All data deleted.";
});

renderSymptoms();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
