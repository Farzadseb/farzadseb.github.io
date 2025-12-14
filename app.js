let data = {};

fetch("pdcs_a1_sample.json")
  .then(res => res.json())
  .then(json => {
    data = json;
  });

const input = document.querySelector("input");
const result = document.getElementById("result");

input.addEventListener("input", () => {
  const word = input.value.trim().toLowerCase();

  if (data[word]) {
    result.innerHTML = `
      <h2>${word}</h2>
      <p><b>فارسی:</b> ${data[word].fa}</p>
      <p><b>Definition:</b> ${data[word].definition}</p>
      <p><b>Example:</b> ${data[word].example}</p>
    `;
  } else {
    result.innerHTML = "";
  }
});
