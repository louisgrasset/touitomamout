const getFormattedLabel = (field) =>
  field.label ?? field.name.charAt(0).toUpperCase() + field.name.slice(1);

export { getFormattedLabel };
