const Schoolclasses = {
  "Baruch College": ["CIS 2300", "CIS 3110", "CIS 3400", "CIS 3500", "CIS 3630", "CIS 4650", "CIS 4800", "CIS 7000", "CIS 7050", "ELEC 1111", "BUS 7500"],
  "BMCC": ["CIS 1", "CSC 101", "CSC 110", "CSC 111", "ELEC 1000", "GEN 1"],
  "Bronx Community College": ["BIS 99", "CSI 31", "CSI 99", "DAT 30", "DAT 46", "DAT 99", "ELC 18", "ELC 99"],
  "Brooklyn College": ["CISC. 1000", "CISC. 1035", "CISC. 1050", "CISC. 1110", "CISC. 1115", "CISC. 3320", "CISC. 3343", "CISC. 3650", "CISC. 3660", "CISC. 3800", "CISC. 3810", "CISC. 9999R"],
  "City College of New York": ["CSC 99902", "ELEC 1000", "ENGR 99902", "HUM 99902"],
  "College of Staten Island": ["BUS 150", "CSC 102", "CSC 126", "CSC 199", "CSC 199R", "CSC 225", "CSC 299", "CSC 299R", "ELEC 1000"],
  "CUNY Graduate Center": ["CBA 1000", "CBA 1000N"],
  "CUNY Graduate School of Journalism": [],
  "CUNY Graduate School of Public Health and Health Policy": [],
  "CUNY Law School": [],
  "Guttman Community College": ["ELEC 1000", "ELEC 1000R", "INFT 211", "INFT 217", "INFT 221", "INFT 223"],
  "Hostos Community College": ["CSC 1111", "CST 1111", "ELEC 1000"],
  "Hunter College": ["ELECT 111NL", "FCSW 1000", "MEDP 28500", "CSCI 12000", "CSCI 23200"],
  "John Jay College": ["CSCI 1", "CSCI 171", "CSCI 271", "CSCI 362", "CSCI 375", "ELEC 1000"],
  "Kingsborough Community College": ["CP 2100", "CP 500", "CP 6100", "CIS 1200", "CIS 2100", "CIS 2200", "CIS 3100", "CIS 6100", "ELEC 1000"],
  "LaGuardia Community College": ["BTC 100", "ELEC 1000", "MAC 109", "MAC 125", "MAC 199", "MAC 233", "MAC 250"],
  "Lehman College": ["CIS 2000", "CIS 242", "CIS 244", "CIS 252", "CIS 331", "CIS 346", "CMP 128", "CMP 167", "MAT 128"],
  "Medgar Evers College": ["CS 100", "CS 151", "CS 315", "CS 381", "CS 999", "CIS 1000", "CIS 999"],
  "New York City College of Technology": ["CST 1100", "CST 1101", "CST 1201", "CST 1204", "CST 1215", "CST 2301", "CST 2307", "CST 2309", "CST 2312", "CST 2400", "CST 2402", "CST 2403", "CST 2405", "CST 2406", "CST 2409"],
  "Queens College": ["CSCI 85", "CSCI 90", "CSCI 111", "CSCI 112", "CSCI 499"],
  "Queensborough Community College": ["CS 100", "CS 101", "CIS 152", "CIS 153", "CIS 201", "CIS 204", "CIS 208", "CIS 251", "ELEC 1000", "ET 575", "ET 710"],
  "School of Labor and Urban Studies": ["ELEC 1000", "IS 205", "IS 310", "IS 361", "IS 374"],
  "School of Professional Studies": ["CS 493", "CS 497", "CS 498", "CS 999", "FCSW 1000", "IS 205", "IS 210", "IS 260", "IS 310", "IS 320", "IS 361", "IS 999", "CIS 999"],
  "Stella and Charles Guttman Community College": ["ELEC 1000", "ELEC 1000R", "INFT 211", "INFT 217", "INFT 221", "INFT 223"],
  "York College": ["CS 100", "CS 172", "CS 292", "CS 381", "CS 493", "CS 495", "CS 497", "CS 498", "CS 999"]
};

const schoolSelect = document.getElementById("schools");
const classInput = document.getElementById("classes");
const matchlist = document.getElementById("matchlist");
const result = document.getElementById("result");

let selectedSchool = "";

schoolSelect.addEventListener("change", () => {
  selectedSchool = schoolSelect.value;
  result.textContent = "";
  classInput.value = "";
  updateMatchList("");
});

classInput.addEventListener("input", () => {
  const inputValue = classInput.value.trim().toUpperCase();
  updateMatchList(inputValue);

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

function updateMatchList(filter) {
  matchlist.innerHTML = "";

  if (!selectedSchool || !filter) return;

  const classes = Schoolclasses[selectedSchool] || [];
  const filtered = classes.filter(cls =>
    cls.toUpperCase().includes(filter.toUpperCase())
  );

  filtered.forEach(cls => {
    const li = document.createElement("li");
    li.textContent = cls;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      classInput.value = cls;
      matchlist.innerHTML = "";
      result.textContent = `Class "${cls}" was found at ${selectedSchool}.`;
      result.style.color = "green";
    });
    matchlist.appendChild(li);
  });

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No matches found";
    li.style.fontStyle = "italic";
    li.style.color = "#999";
    matchlist.appendChild(li);
  }
}