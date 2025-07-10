document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("access_token");
    const params = new URLSearchParams(window.location.search);
    const formId = params.get("form_id");
  
    if (!token || !formId) {
      alert("Missing token or form ID.");
      return;
    }
  
    const response = await fetch(`/user/forms/${formId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert("Access denied. This form is not assigned to you.");
      } else if (response.status === 404) {
        alert("Form not found.");
      } else {
        alert("Something went wrong.");
      }
      window.location.href = "/user-dashboard.html";
      return;
    }
  
    const form = await response.json();
    document.querySelector("h2").textContent = `Fill Form: ${form.title}`;
  
    const dynamicForm = document.getElementById("dynamic-form");
    dynamicForm.innerHTML = ""; // Clear existing hardcoded fields
  
    form.schema.fields.forEach((field) => {
      const label = document.createElement("label");
      label.textContent = field.label;
      dynamicForm.appendChild(label);
  
      let input;
      if (field.field_type === "text" || field.field_type === "number") {
        input = document.createElement("input");
        input.type = field.field_type;
      } else if (field.field_type === "dropdown") {
        input = document.createElement("select");
        (field.options || []).forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          input.appendChild(option);
        });
      } else if (field.field_type === "checkbox") {
        input = document.createElement("input");
        input.type = "checkbox";
      }
  
      input.name = field.label;
      if (field.required) input.required = true;
      dynamicForm.appendChild(input);
    });
  
    // Add Submit Button
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Submit";
    dynamicForm.appendChild(submitBtn);
  
    // Handle Submit
    dynamicForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const data = {};
      form.schema.fields.forEach((field) => {
        const input = dynamicForm.querySelector(`[name="${field.label}"]`);
        if (field.field_type === "checkbox") {
          data[field.label] = input.checked;
        } else {
          data[field.label] = input.value;
        }
      });
  
      const submitRes = await fetch(`/user/forms/${formId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response_data: data }),
      });
  
      if (submitRes.ok) {
        alert("Form submitted successfully!");
        window.location.href = "/user";
      } else {
        const error = await submitRes.json();
        alert("Submission failed: " + error.detail);
      }
    });
  });
  