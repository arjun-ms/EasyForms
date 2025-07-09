// Add field to the form
function addField() {
  const container = document.getElementById("fields");
  const group = document.createElement("div");
  group.className = "field-group";

  group.innerHTML = `
      <input type="text" name="label" placeholder="Field Label" />
      <select name="type">
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="dropdown">Dropdown</option>
        <option value="checkbox">Checkbox</option>
      </select>
    `;

  container.appendChild(group);
}

function cancelEdit() {
  localStorage.removeItem("edit_form_id");
  window.location.href = "/admin";
}
// Display error message
function displayError(message) {
  const errorBox = document.getElementById("error-message");
  if (errorBox) errorBox.textContent = message;
}

// Preload existing form data for editing
async function preloadFormData(formId) {
  const token = localStorage.getItem("access_token");
  if (!token) return displayError("Missing token");

  try {
    const res = await fetch(`/forms/${formId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!res.ok) throw new Error("Failed to load form");

    const form = await res.json();

    document.querySelector("[name='title']").value = form.title;
    document.querySelector("[name='description']").value =
      form.description || "";

    const fieldContainer = document.getElementById("fields");
    fieldContainer.innerHTML = ""; // clear default field

    (form.fields || []).forEach((f) => {
      const group = document.createElement("div");
      group.className = "field-group";

      group.innerHTML = `
          <input type="text" name="label" placeholder="Field Label" value="${
            f.label
          }" />
          <select name="type">
            <option value="text" ${
              f.field_type === "text" ? "selected" : ""
            }>Text</option>
            <option value="number" ${
              f.field_type === "number" ? "selected" : ""
            }>Number</option>
            <option value="dropdown" ${
              f.field_type === "dropdown" ? "selected" : ""
            }>Dropdown</option>
            <option value="checkbox" ${
              f.field_type === "checkbox" ? "selected" : ""
            }>Checkbox</option>
          </select>
        `;

      fieldContainer.appendChild(group);
    });
  } catch (err) {
    displayError(err.message);
    console.error("Error preloading form:", err.message);
  }
}

// Form submit logic (create or update)
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("add-field-btn").addEventListener("click", addField);

  const editFormId = localStorage.getItem("edit_form_id");
  if (editFormId) {
    await preloadFormData(editFormId);
  }

  document
    .getElementById("create-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const token = localStorage.getItem("access_token");
      if (!token) {
        displayError("Access token not found. Please log in.");
        return;
      }

      const title = document.querySelector("[name='title']").value;
      const description = document.querySelector("[name='description']").value;

      const fields = Array.from(
        document.querySelectorAll("#fields .field-group")
      ).map((group) => {
        const label = group.querySelector("[name='label']").value;
        const type = group.querySelector("[name='type']").value;
        return { label, field_type: type };
      });

      const schema = {
        fields: fields.map((f, idx) => ({
          label: f.label,
          type: f.field_type,
          required: false,
          order: idx,
        })),
      };

      const payload = {
        title,
        description,
        schema,
        fields,
      };

      try {
        const url = editFormId ? `/forms/${editFormId}` : "/forms/";
        const method = editFormId ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to save form.");
        }

        alert(editFormId ? "Form updated!" : "Form created!");
        localStorage.removeItem("edit_form_id");
        window.location.href = "/admin";
      } catch (err) {
        displayError(err.message);
        console.error("Error saving form:", err.message);
      }
    });
});
