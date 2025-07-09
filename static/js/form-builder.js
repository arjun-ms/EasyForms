async function loadUsersDropdown(selectedUserId = null) {
  const token = localStorage.getItem("access_token");
  const dropdown = document.getElementById("assign-user");

  dropdown.innerHTML = `<option value="">-- Select a user --</option>`; // Clear and add default

  try {
    const res = await fetch("/user/users", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch users");

    const users = await res.json();
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.username;
      dropdown.appendChild(option);
    });

    if (selectedUserId) {
      dropdown.value = selectedUserId.toString();
    }
  } catch (err) {
    console.error("Error loading users:", err);
    displayError("Failed to load user list");
  }
}

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

function displayError(message) {
  const errorBox = document.getElementById("error-message");
  if (errorBox) errorBox.textContent = message;
}

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

    const assignUserContainer = document.getElementById(
      "assign-user-container"
    );
    const assignedBlock = document.getElementById("assigned-user-block");
    const usernameBlock = document.getElementById("assigned-user-name");

    // ✅ load dropdown with pre-selected user
    if (form.assigned_user) {
      await loadUsersDropdown(form.assigned_user.id);
      assignUserContainer.style.display = "block";
      assignedBlock.style.display = "none";
    } else {
      await loadUsersDropdown();
      assignUserContainer.style.display = "block";
      assignedBlock.style.display = "none";
    }

    const fieldContainer = document.getElementById("fields");
    fieldContainer.innerHTML = "";

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

document.addEventListener("DOMContentLoaded", async () => {
  const editFormId = localStorage.getItem("edit_form_id");

  if (editFormId) {
    await preloadFormData(editFormId); // dropdown loaded inside
  } else {
    await loadUsersDropdown(); // for create mode
  }

  document.getElementById("add-field-btn").addEventListener("click", addField);

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

      const assignUserDropdown = document.getElementById("assign-user");
      const isDropdownVisible =
        assignUserDropdown && assignUserDropdown.offsetParent !== null;
      const selectedUserId = isDropdownVisible
        ? assignUserDropdown.value
        : null;

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

        const createdForm = await response.json();

        if (selectedUserId) {
          // Re-send the form update with assigned_user_id
          const updateRes = await fetch(`/forms/${createdForm.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token
            },
            body: JSON.stringify({
              assigned_user_id: parseInt(selectedUserId)
            })
          });
        
          if (!updateRes.ok) {
            const updateError = await updateRes.json();
            throw new Error(updateError.detail || "Failed to reassign form.");
          }
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
