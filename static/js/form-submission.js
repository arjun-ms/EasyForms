document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access_token");
  const params = new URLSearchParams(window.location.search);
  const formId = params.get("form_id");

  if (!token || !formId) {
    alert("Missing token or form ID.");
    return;
  }

  try {
    const response = await fetch(`/user/forms/${formId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 403) {
        alert("Access denied. This form is not assigned to you.");
      } else if (response.status === 404) {
        alert("Form not found.");
      } else {
        alert("Something went wrong while fetching the form.");
      }
      window.location.href = "/user-dashboard.html";
      return;
    }

    const form = await response.json();
    console.log("Fetched form from backend:", form);

    let schema = form.schema;

    // console.log("Fetched form schema:", schema);
    // console.log("Type of form schema:", (typeof schema));

    // Parse schema if it's stored as a JSON string
    if (typeof schema === "string") {
      try {
        schema = JSON.parse(schema);
      } catch (err) {
        alert("Invalid form schema format.");
        return;
      }
    }

    // console.log("Full schema object:", schema);
    // console.log("schema.sections:", schema?.sections);
    // console.log("schema.sections.length:", schema?.sections?.length);
    if (!schema || !schema.fields || !schema.fields.length) {
      alert("⚠️ FORM SCHEMA is invalid or missing fields.");
      return;
    }

    // Normalize schema
    if (!schema.sections) {
      schema.sections = [
        {
          title: `${form.title}`,
          fields: schema.fields || [],
        },
      ];
    }

    document.querySelector("h2").textContent = `Fill Form:`;

    const dynamicForm = document.getElementById("dynamic-form");
    dynamicForm.innerHTML = ""; // Clear any previous content

    // Map to store field references for submission
    const fieldRefs = {};

    // Render sections and fields
    schema.sections.forEach((section, sectionIndex) => {
      const sectionTitle = document.createElement("h3");
      sectionTitle.textContent = section.title || `Section ${sectionIndex + 1}`;
      dynamicForm.appendChild(sectionTitle);

      //- Sort fields by `order` before rendering
      section.fields.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      section.fields.forEach((field) => {
        const fieldType = field.field_type || field.type;

        if (!fieldType) {
          console.warn("Missing field type for field:", field);
          return;
        }

        const label = document.createElement("label");
        label.textContent = field.label;
        dynamicForm.appendChild(label);

        let input;
        if (
          fieldType === "text" ||
          fieldType === "number" ||
          fieldType === "email" ||
          fieldType === "date"
        ) {
          input = document.createElement("input");
          input.type = fieldType;
        } else if (fieldType === "textarea") {
          input = document.createElement("textarea");
        } else if (fieldType === "select" || fieldType === "dropdown") {
          input = document.createElement("select");
          (field.options || []).forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt;
            input.appendChild(option);
          });
        } else if (fieldType === "checkbox") {
          input = document.createElement("input");
          input.type = "checkbox";
        } else {
          console.warn("Unsupported field type:", fieldType);
          return;
        }

        input.name = field.label;
        if (field.required) input.required = true;
        dynamicForm.appendChild(input);

        // Store field reference
        fieldRefs[field.label] = { input, field };
      });
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
      Object.entries(fieldRefs).forEach(([label, { input, field }]) => {
        if (field.field_type === "checkbox") {
          data[label] = input.checked;
        } else {
          data[label] = input.value;
        }
      });

      try {
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
      } catch (err) {
        console.error("Form submission error:", err);
        alert("Unexpected error during submission.");
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Could not load the form. Please try again later.");
  }
});
