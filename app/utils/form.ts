// convert form data with brackets into array
export function getArray(formData: FormData, key: string) {
  const array = []
  for(const entry of formData.entries()) {
    if (entry[0].match(`${key}\\[\\d+\\]`)) {
      array.push(entry[1])
    }
  }
  return array
}
