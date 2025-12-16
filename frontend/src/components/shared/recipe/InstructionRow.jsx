import React from "react";

export function InstructionRow({
  index,
  value,
  onUpdate,
  onRemove,
  disableRemove,
}) {
  return (
    <div className="instruction-row">
      <div className="form-field">
        <label>Step {index + 1} *</label>
        <textarea
          value={value}
          onChange={(e) => onUpdate(index, e.target.value)}
          placeholder="Describe this step..."
          rows="3"
          required
        />
      </div>
      <div className="form-actions">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="remove-btn"
          disabled={disableRemove}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
