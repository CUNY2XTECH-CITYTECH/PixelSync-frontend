const Schoolclasses = {
  "Baruch College": ["ENG 2100", "ENG 2150", "ENG 2150T", "MTH 2001", "MTH 2610"],
  "BMCC": ["ENG 101", "ENG 102", "MAT 206", "MAT 301"],
  "Bronx Community College": ["ENG 111", "ENG 114", "BCC MAT", "BCC MAT 201"],
  "Brooklyn College": ["ENGL 1010", "ENG 1020", "MAT 1011", "MAT 1201"],
  "City College of New York": ["ENGL 11000", "ENG 11200", "ENGL 33000", "MAT 19500", "MAT 20100"],
  "College of Staten Island": ["ENG 111", "MTH 130", "MTH 230"],
  "CUNY Graduate Center": [],
  "CUNY Graduate School of Journalism": [],
  "CUNY Graduate School of Public Health and Health Policy": [],
  "CUNY Law School": [],
  "Guttman Community College": ["ENGL 103", "MATH 201", "MATH 210"],
  "Hostos Community College": ["ENG 100", "MAT 160"],
  "Hunter College": ["ENGL 12000", "ENG 22000", "MAT 12500", "MAT 12550"],
  "John Jay College": ["ENG 101", "ENG 1010", "MAT 141", "MAT 151"],
  "Kingsborough Community College": ["ENG 2200", "ENG 2400", "MAT 1400"],
  "LaGuardia Community College": ["ENG 101", "MATH 200", "MAT 201"],
  "Lehman College": ["ENG 113", "ENG 121", "MAT 172", "MAT 175"],
  "Medgar Evers College": ["ENGL 112", "ENGL 150", "MTH 151", "MTH 202"],
  "New York City College of Technology": ["ENG 1101", "ENG 1101CO", "ENG 1101ML", "ENG 1121", "MAT 1375", "MAT 1475"],
  "Queens College": ["ENGL 110", "ENGL 110H", "ENGL 130", "ENGL 130H", "MATH 122", "MATH 141"],
  "Queensborough Community College": ["ENGL 101", "ENGL 102", "MA-440", "MA-128"],
  "School of Labor and Urban Studies": ["ENG 2100", "ENG 2150", "MTH 2001", "MTH 2610"],
  "School of Professional Studies": ["ENG 101", "ENG 102", "MATH 102", "MATH 999"],
  "Stella and Charles Guttman Community College": ["ENGL 103", "ENGL 203", "MATH 120", "MATH 201"],
  "York College": ["ENG 125", "ENG 126", "MATH 121", "MATH 141"]
};

const schoolSelect = document.getElementById("schools");
const classInput = document.getElementById("classes");
const classDatalist = document.getElementById("classOptions");
const result = document.getElementById("result");

let selectedSchool = "";

schoolSelect.addEventListener("change", () => {
  selectedSchool = schoolSelect.value;
  result.textContent = "";
  classInput.value = "";
  updateDatalist("");
});

classInput.addEventListener("input", () => {
  const inputValue = classInput.value.trim().toUpperCase();
  updateDatalist(inputValue);

  if (!selectedSchool || !inputValue) {
    result.textContent = "";
    return;
  }

  const classes = Schoolclasses[selectedSchool] || [];
  const exactMatch = classes.some(cls => cls.toUpperCase() === inputValue);

  result.textContent = exactMatch
    ? `Class "${inputValue}" was found at ${selectedSchool}.`
    : `Class "${inputValue}" was not found at ${selectedSchool}.`;
  result.style.color = exactMatch ? "green" : "red";
});

function updateDatalist(filter) {
  classDatalist.innerHTML = "";
  if (!selectedSchool) return;

  const classes = Schoolclasses[selectedSchool] || [];
  const filtered = classes.filter(cls =>
    cls.toUpperCase().includes(filter.toUpperCase())
  );

  filtered.forEach(cls => {
    const option = document.createElement("option");
    option.value = cls;
    classDatalist.appendChild(option);
  });
}