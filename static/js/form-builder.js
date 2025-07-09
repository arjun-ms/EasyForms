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
  
  function displayError(message) {
    const errorBox = document.getElementById("error-message");
    if (errorBox) errorBox.textContent = message;
  }
  
  // Create new form
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("add-field-btn").addEventListener("click", addField);
  
    document.getElementById("create-form").addEventListener("submit", async function (e) {
      e.preventDefault();
  
      const token = localStorage.getItem("access_token");
      if (!token) {
        displayError("Access token not found. Please log in.");
        return;
      }
  
      const title = document.querySelector("[name='title']").value;
      const description = document.querySelector("[name='description']").value;
  
      const fields = Array.from(document.querySelectorAll("#fields .field-group")).map(group => {
        const label = group.querySelector("[name='label']").value;
        const type = group.querySelector("[name='type']").value;
        return { label,  field_type: type };
      });
      
      const schema = {
        fields: fields.map((f, idx) => ({
          label: f.label,
          type: f.field_type,
          required: false,
          order: idx
        }))
      };

      const payload = { title, description,schema, fields };
  
      try {
        const response = await fetch("/forms/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to create form.");
        }
  
        alert("Form created successfully!");
        window.location.href = "/admin"; // Redirect to dashboard
      } catch (err) {
        displayError(err.message);
        console.error("Error creating form:", err.message);
      }
    });
  });
  