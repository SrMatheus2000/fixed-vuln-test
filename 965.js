function unique_name_556(value) {
  return (value !== '*' ? '"' + value.replace(/"/g, '""') + '"' : '*');
}