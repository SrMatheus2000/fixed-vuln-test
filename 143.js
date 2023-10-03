function email (em) {
  if (em.length > 254) {
    return new Error(requirements.email.length)
  }
  if (!em.match(/^[^@]+@.+\..+$/)) {
    return new Error(requirements.email.valid)
  }

  return null
}