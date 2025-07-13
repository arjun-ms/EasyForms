let fieldCount = 0;
let currentEditingField = null;

// Field type configurations
const fieldTypeConfig = {
  text: {
    name: 'TEXT',
    label: 'New text field',
    placeholder: 'Enter text',
    hasOptions: false
  },
  textarea: {
    name: 'TEXTAREA',
    label: 'New textarea field',
    placeholder: 'Enter text',
    hasOptions: false
  },
  select: {
    name: 'SELECT',
    label: 'New select field',
    placeholder: 'Enter select',
    hasOptions: true
  },
  checkbox: {
    name: 'CHECKBOX',
    label: 'New checkbox field',
    placeholder: '',
    hasOptions: false
  },
  date: {
    name: 'DATE',
    label: 'New date field',
    placeholder: 'Select date',
    hasOptions: false
  },
  email: {
    name: 'EMAIL',
    label: 'New email field',
    placeholder: 'Enter email',
    hasOptions: false
  }
};

// Mock function for loading users - replace with your actual API call
async function loadUsersDropdown(selectedUserId = null) {
  const token = localStorage.getItem("access_token");
  const dropdown = document.getElementById("assign-user");
  
  dropdown.innerHTML = `<option value="">-- Select a user --</option>`;

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
    // Fallback to mock data if API fails
    const users = [
      { id: 1, username: "admin" },
      { id: 2, username: "user1" },
      { id: 3, username: "user2" }
    ];

    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.username;
      dropdown.appendChild(option);
    });

    if (selectedUserId) {
      dropdown.value = selectedUserId.toString();
    }
  }
}

function addField(type = 'text') {
  const container = document.getElementById("fields-container");
  const config = fieldTypeConfig[type];
  
  fieldCount++;
  updateFieldCount();
  updateEmptyState();

  const fieldData = {
    id: `field-${Date.now()}`,
    type: type,
    label: config.label,
    placeholder: config.placeholder,
    required: false,
    options: type === 'select' ? ['Option 1', 'Option 2'] : []
  };

  const fieldElement = createFieldElement(fieldData);
  container.appendChild(fieldElement);
}

function createFieldElement(fieldData) {
  const config = fieldTypeConfig[fieldData.type];
  const div = document.createElement('div');
  div.className = 'field-component';
  div.dataset.fieldId = fieldData.id;

  div.innerHTML = `
    <div class="field-header">
      <i class="fas fa-grip-vertical drag-handle"></i>
      <span class="field-type-badge">${config.name}</span>
      <span class="field-id">Field #${fieldCount}</span>
      <div class="field-controls">
        <div class="required-toggle">
          <span>Required</span>
          <div class="toggle-switch ${fieldData.required ? 'active' : ''}" onclick="toggleRequired(this)">
            <div class="toggle-slider"></div>
          </div>
        </div>
        <button class="field-action-btn" onclick="editField('${fieldData.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="field-action-btn delete" onclick="removeField('${fieldData.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="field-content">
      <div class="field-label">${fieldData.label}</div>
      <div class="field-description">Placeholder: "${fieldData.placeholder}"</div>
      ${fieldData.type === 'select' ? `<div class="field-description">Options: ${fieldData.options.join(', ')}</div>` : ''}
      <div class="field-preview">
        <div class="preview-label">Preview:</div>
        ${generatePreviewHTML(fieldData)}
      </div>
    </div>
  `;

  return div;
}

function generatePreviewHTML(fieldData) {
  switch (fieldData.type) {
    case 'text':
    case 'email':
      return `<input type="${fieldData.type}" class="preview-input" placeholder="${fieldData.placeholder}" />`;
    case 'textarea':
      return `<textarea class="preview-input" placeholder="${fieldData.placeholder}" rows="3"></textarea>`;
    case 'select':
      const options = fieldData.options.map(opt => `<option>${opt}</option>`).join('');
      return `<select class="preview-input"><option>${fieldData.placeholder}</option>${options}</select>`;
    case 'checkbox':
      return `<label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem;"><input type="checkbox" /> ${fieldData.label}</label>`;
    case 'date':
      return `<input type="date" class="preview-input" />`;
    default:
      return `<input type="text" class="preview-input" placeholder="${fieldData.placeholder}" />`;
  }
}

function toggleRequired(toggle) {
  toggle.classList.toggle('active');
}

function editField(fieldId) {
  const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
  const fieldData = getFieldDataFromElement(fieldElement);
  
  currentEditingField = fieldId;
  
  document.getElementById('edit-label').value = fieldData.label;
  document.getElementById('edit-placeholder').value = fieldData.placeholder;
  
  const optionsSection = document.getElementById('options-section');
  if (fieldData.type === 'select') {
    optionsSection.style.display = 'block';
    renderOptions(fieldData.options);
  } else {
    optionsSection.style.display = 'none';
  }
  
  document.getElementById('edit-modal').classList.add('active');
}

function getFieldDataFromElement(element) {
  const type = element.querySelector('.field-type-badge').textContent.toLowerCase();
  const label = element.querySelector('.field-label').textContent;
  const description = element.querySelector('.field-description').textContent;
  const placeholder = description.match(/Placeholder: "([^"]+)"/)?.[1] || '';
  const required = element.querySelector('.toggle-switch').classList.contains('active');
  
  let options = [];
  if (type === 'select') {
    const selectElement = element.querySelector('select');
    if (selectElement) {
      options = Array.from(selectElement.options)
        .map(opt => opt.textContent)
        .filter(opt => opt && opt !== placeholder);
    }
  }

  return {
    type: type === 'textarea' ? 'textarea' : type,
    label,
    placeholder,
    required,
    options
  };
}

function renderOptions(options) {
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  
  options.forEach((option, index) => {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.innerHTML = `
      <input type="text" class="option-input" value="${option}" />
      <button type="button" class="remove-option" onclick="removeOption(this)">−</button>
    `;
    container.appendChild(div);
  });
}

function addOption() {
  const container = document.getElementById('options-container');
  const div = document.createElement('div');
  div.className = 'option-item';
  div.innerHTML = `
    <input type="text" class="option-input" value="New Option" />
    <button type="button" class="remove-option" onclick="removeOption(this)">−</button>
  `;
  container.appendChild(div);
}

function removeOption(button) {
  button.parentElement.remove();
}

function saveFieldEdit() {
  if (!currentEditingField) return;
  
  const fieldElement = document.querySelector(`[data-field-id="${currentEditingField}"]`);
  const newLabel = document.getElementById('edit-label').value.trim();
  const newPlaceholder = document.getElementById('edit-placeholder').value.trim();
  
  if (!newLabel) {
    showMessage('Field label is required', 'error');
    return;
  }
  
  // Update field data
  const fieldData = getFieldDataFromElement(fieldElement);
  fieldData.label = newLabel;
  fieldData.placeholder = newPlaceholder;
  
  // Get options if it's a select field
  if (fieldData.type === 'select') {
    const optionInputs = document.querySelectorAll('#options-container .option-input');
    fieldData.options = Array.from(optionInputs).map(input => input.value.trim()).filter(val => val);
  }
  
  // Recreate the field element
  const newFieldElement = createFieldElement({
    ...fieldData,
    id: currentEditingField
  });
  
  fieldElement.parentNode.replaceChild(newFieldElement, fieldElement);
  
  closeEditModal();
  showMessage('Field updated successfully', 'success');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
  currentEditingField = null;
}

function removeField(fieldId) {
  if (confirm('Are you sure you want to remove this field?')) {
    const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
    fieldElement.remove();
    fieldCount--;
    updateFieldCount();
    updateEmptyState();
    showMessage('Field removed', 'success');
  }
}

function updateFieldCount() {
  document.getElementById('field-count').textContent = fieldCount;
}

function updateEmptyState() {
  const emptyState = document.getElementById('empty-state');
  
  if (fieldCount === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }
}

function showMessage(text, type) {
  const container = document.getElementById('message-container');
  const div = document.createElement('div');
  div.className = `message ${type}-message`;
  div.textContent = text;
  
  container.appendChild(div);
  
  setTimeout(() => {
    div.remove();
  }, 3000);
}

function cancelEdit() {
  if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
    localStorage.removeItem("edit_form_id");
    window.location.href = "/admin";
  }
}

function displayError(message) {
  showMessage(message, 'error');
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

    document.getElementById("form-title").value = form.title;
    document.getElementById("form-description").value = form.description || "";

    // Load users dropdown with pre-selected user
    if (form.assigned_user) {
      await loadUsersDropdown(form.assigned_user.id);
    } else {
      await loadUsersDropdown();
    }

    const fieldContainer = document.getElementById("fields-container");
    fieldContainer.innerHTML = "";
    fieldCount = 0;

    (form.fields || []).forEach((f) => {
      const fieldData = {
        id: `field-${Date.now()}-${fieldCount}`,
        type: f.field_type,
        label: f.label,
        placeholder: f.placeholder || fieldTypeConfig[f.field_type]?.placeholder || '',
        required: f.required || false,
        options: f.options || (f.field_type === 'select' ? ['Option 1', 'Option 2'] : [])
      };
      
      fieldCount++;
      const fieldElement = createFieldElement(fieldData);
      fieldContainer.appendChild(fieldElement);
    });
    
    updateFieldCount();
    updateEmptyState();
  } catch (err) {
    displayError(err.message);
    console.error("Error preloading form:", err.message);
  }
}

async function saveForm() {
  const title = document.getElementById("form-title").value.trim();
  const description = document.getElementById("form-description").value.trim();

  if (!title) {
    showMessage("Form title is required.", 'error');
    return;
  }

  const fields = Array.from(document.querySelectorAll('.field-component')).map(element => {
    return getFieldDataFromElement(element);
  });

  if (fields.length === 0) {
    showMessage("Please add at least one field.", 'error');
    return;
  }

  const emptyLabels = fields.filter(f => !f.label.trim());
  if (emptyLabels.length > 0) {
    showMessage("All fields must have labels.", 'error');
    return;
  }

  // ✅ Validate select fields have at least one option
  const invalidSelects = fields.filter(f =>
    f.type === 'select' && (!f.options || f.options.length === 0)
  );

  if (invalidSelects.length > 0) {
    const fieldNames = invalidSelects.map(f => `"${f.label}"`).join(", ");
    showMessage(`Select field(s) ${fieldNames} must have at least one option.`, 'error');
    return;
  }

  const assignUserId = document.getElementById("assign-user").value;

  const schema = {
    fields: fields.map((f, idx) => ({
      label: f.label,
      field_type: f.type,
      required: f.required,
      order: idx,
      options: f.options || []
    })),
  };
  
  
  const payload = {
    title,
    description,
    schema,
    fields: fields.map((f, idx) => ({
      label: f.label,
      field_type: f.type,  // 🔁 convert type → field_type
      required: f.required,
      order: idx,
      options: f.options || []
    })),
    assigned_user_id: assignUserId ? parseInt(assignUserId) : null
  };
  

  try {
    const token = localStorage.getItem("access_token");
    const editFormId = localStorage.getItem("edit_form_id");
    
    const url = editFormId ? `/forms/${editFormId}` : "/forms/";
    console.log(`URL: ${url}`);
    const method = editFormId ? "PUT" : "POST";
    console.log(`Method: ${method}`);

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

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

    const result = await response.json();

    // Handle user assignment if needed
    if (assignUserId && !editFormId) {
      const updateRes = await fetch(`/forms/${result.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          assigned_user_id: parseInt(assignUserId)
        })
      });
    
      if (!updateRes.ok) {
        const updateError = await updateRes.json();
        throw new Error(updateError.detail || "Failed to reassign form.");
      }
    }
    
    showMessage(editFormId ? "Form updated successfully!" : "Form created successfully!", 'success');
    
    localStorage.removeItem("edit_form_id");
    setTimeout(() => {
      window.location.href = "/admin";
    }, 1500);
  } catch (err) {
    showMessage(err.message, 'error');
    console.error("Error saving form:", err);
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  updateEmptyState();
  
  // Check if we're editing an existing form
  const editFormId = localStorage.getItem("edit_form_id");
  if (editFormId) {
    await preloadFormData(editFormId);
  } else {
    await loadUsersDropdown();
  }

  // Quick add buttons
  document.querySelectorAll('.quick-add-btn').forEach(button => {
    button.addEventListener('click', () => {
      const fieldType = button.dataset.type;
      addField(fieldType);
    });
  });

  // Save form button
  document.getElementById("save-form-btn").addEventListener("click", async function (e) {
    e.preventDefault();
    
    const saveBtn = this;
    const originalHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;

    try {
      await saveForm();
    } finally {
      saveBtn.innerHTML = originalHTML;
      saveBtn.disabled = false;
    }
  });

  // Close modal when clicking overlay
  document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeEditModal();
    }
  });
});