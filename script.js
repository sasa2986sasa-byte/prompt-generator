// ===============================
// 初期化
// ===============================
window.onload = () => {
  loadPresetOptions();
  loadSavedData();
  loadFromURL();
};

// ===============================
// プリセット一覧をドロップダウンに入れる
// ===============================
function loadPresetOptions() {
  const select = document.getElementById("preset-select");
  Object.keys(PRESETS).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    select.appendChild(option);
  });

  select.addEventListener("change", () => applyPreset(select.value));
}

// ===============================
// プリセットをフォームに反映
// ===============================
function applyPreset(key) {
  const preset = PRESETS[key];

  fillCheckbox("roles-checkbox", preset.roles);
  fillCheckbox("goals-checkbox", preset.goals);
  fillCheckbox("tasks-checkbox", preset.tasks);
  fillCheckbox("output-checkbox", preset.output);
  fillCheckbox("style-checkbox", preset.style);
  fillCheckbox("constraints-checkbox", preset.constraints);

  clearCustomFields();
}

// ===============================
// チェックボックス生成
// ===============================
function fillCheckbox(id, items) {
  const area = document.getElementById(id);
  area.innerHTML = "";
  items.forEach(item => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = item;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(item));
    area.appendChild(label);
    area.appendChild(document.createElement("br"));
  });
}

// ===============================
// 自由記述欄をクリア
// ===============================
function clearCustomFields() {
  document.getElementById("roles-custom").value = "";
  document.getElementById("goals-custom").value = "";
  document.getElementById("tasks-custom").value = "";
  document.getElementById("output-custom").value = "";
  document.getElementById("style-custom").value = "";
  document.getElementById("constraints-custom").value = "";
}

// ===============================
// チェックボックス＋自由記述をまとめる
// ===============================
function collect(checkId, customId) {
  const checks = [...document.querySelectorAll(`#${checkId} input:checked`)].map(c => c.value);
  const custom = document.getElementById(customId).value.trim();
  return custom ? [...checks, custom] : checks;
}

// ===============================
// ハレーション防止の軽いバリデーション
// ===============================
function validatePrompt(roles, goals, tasks, output, style, constraints) {
  let errors = [];

  if (roles.length === 0) errors.push("役割（Role）が選択されていません。");
  if (goals.length === 0) errors.push("目的（Goal）が選択されていません。");
  if (tasks.length === 0) errors.push("タスク（Task）が選択されていません。");

  if (output.length === 0) {
    output.push("箇条書き");
  }

  if (constraints.length === 0) {
    constraints.push("不明点は質問する");
    constraints.push("出力前に内容を精査し、文脈に合わない部分や矛盾がないか確認する");
  }

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return false;
  }

  return true;
}

// ===============================
// プロンプト生成
// ===============================
document.getElementById("generate-btn").onclick = () => {
  const roles = collect("roles-checkbox", "roles-custom");
  const goals = collect("goals-checkbox", "goals-custom");
  const tasks = collect("tasks-checkbox", "tasks-custom");
  const output = collect("output-checkbox", "output-custom");
  const style = collect("style-checkbox", "style-custom");
  const constraints = collect("constraints-checkbox", "constraints-custom");

  if (!validatePrompt(roles, goals, tasks, output, style, constraints)) return;

  const prompt = `
[Role]
${roles.join("\n")}

[Goal]
${goals.join("\n")}

[Task]
${tasks.join("\n")}

[Output Format]
${output.join("\n")}

[Style]
${style.join("\n")}

[Constraints]
${constraints.join("\n")}
`;

  document.getElementById("output-text").value = prompt;
};

// ===============================
// localStorage 保存
// ===============================
document.getElementById("save-btn").onclick = () => {
  const data = {
    roles: collect("roles-checkbox", "roles-custom"),
    goals: collect("goals-checkbox", "goals-custom"),
    tasks: collect("tasks-checkbox", "tasks-custom"),
    output: collect("output-checkbox", "output-custom"),
    style: collect("style-checkbox", "style-custom"),
    constraints: collect("constraints-checkbox", "constraints-custom")
  };
  localStorage.setItem("promptgen-data", JSON.stringify(data));
  alert("保存しました");
};

// ===============================
// localStorage 読み込み（完全版）
// ===============================
function loadSavedData() {
  const data = JSON.parse(localStorage.getItem("promptgen-data"));
  if (!data) return;

  fillCheckbox("roles-checkbox", data.roles);
  fillCheckbox("goals-checkbox", data.goals);
  fillCheckbox("tasks-checkbox", data.tasks);
  fillCheckbox("output-checkbox", data.output);
  fillCheckbox("style-checkbox", data.style);
  fillCheckbox("constraints-checkbox", data.constraints);
}

// ===============================
// URL共有リンク生成（強化版）
// ===============================
document.getElementById("share-btn").onclick = () => {
  const params = new URLSearchParams({
    roles: collect("roles-checkbox", "roles-custom").join(","),
    goals: collect("goals-checkbox", "goals-custom").join(","),
    tasks: collect("tasks-checkbox", "tasks-custom").join(","),
    output: collect("output-checkbox", "output-custom").join(","),
    style: collect("style-checkbox", "style-custom").join(","),
    constraints: collect("constraints-checkbox", "constraints-custom").join(",")
  });

  const url = `${location.origin}${location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(url);
  alert("URLをコピーしました");
};

// ===============================
// URLから読み込んでフォームに反映
// ===============================
function loadFromURL() {
  const params = new URLSearchParams(location.search);
  if (!params.has("roles")) return;

  fillCheckbox("roles-checkbox", params.get("roles").split(","));
  fillCheckbox("goals-checkbox", params.get("goals").split(","));
  fillCheckbox("tasks-checkbox", params.get("tasks").split(","));
  fillCheckbox("output-checkbox", params.get("output").split(","));
  fillCheckbox("style-checkbox", params.get("style").split(","));
  fillCheckbox("constraints-checkbox", params.get("constraints").split(","));
}

// ===============================
// コピー
// ===============================
document.getElementById("copy-btn").onclick = () => {
  navigator.clipboard.writeText(document.getElementById("output-text").value);
  alert("コピーしました");
};

// ===============================
// クリア
// ===============================
document.getElementById("clear-btn").onclick = () => {
  document.getElementById("output-text").value = "";
};
