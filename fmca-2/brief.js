"use strict";

const service = document.getElementById("service");
const country = document.getElementById("country");
const city = document.getElementById("city");
const objectType = document.getElementById("object");
const task = document.getElementById("task");
const preview = document.getElementById("preview");
const statusLine = document.getElementById("status");

const openingsRu = {
  "": "Помогите выбрать услугу FMCA для нашего объекта.",
  management: "Хотим обсудить комплексное управление нашим объектом.",
  engineering: "Хотим обсудить техническую эксплуатацию инженерных систем нашего объекта.",
  service: "Хотим обсудить сервисное обслуживание нашего объекта.",
  audit: "Нас интересует аудит текущего управления объектом.",
  bts: "Нужен расчет тарифа на эксплуатацию объекта для сделки build-to-suit."
};

const uiNodes = Array.from(document.querySelectorAll("[data-copy]"));
const translations = {
  ru: {
    ...Object.fromEntries(uiNodes.map(node => [node.dataset.copy, node.textContent])),
    services: Object.fromEntries(Array.from(service.options, item => [item.value, item.textContent])),
    countries: Object.fromEntries(Array.from(country.options, item => [item.value, item.textContent])),
    openings: openingsRu, greeting: "Добрый день!", navigation: "Навигация", logo: "FMCA, главная",
    cityExample: city.placeholder, objectExample: objectType.placeholder, taskExample: task.placeholder,
    copied: "Текст скопирован.", selected: "Текст выделен. Выберите «Копировать» в меню браузера.",
    downloaded: "Текст подготовлен для скачивания.", filename: "FMCA-запрос.txt"
  },
  en: {
    home: "Home", title: "Prepare an enquiry", details: "Your requirements", serviceLabel: "Service",
    intro: "Choose a service and add the property details you have. You can copy the enquiry into an email or save it as a file.",
    countryLabel: "Country", cityLabel: "City", objectLabel: "Property type", taskLabel: "What do you need?", optional: "optional",
    previewTitle: "Your enquiry", previewNote: "The draft stays in this tab until you refresh the page.",
    recipient: "To", seePreview: "View your enquiry",
    copy: "Copy text", download: "Download .txt", greeting: "Hello,", navigation: "Navigation", logo: "FMCA home",
    cityExample: "For example, Almaty", objectExample: "For example, a warehouse",
    taskExample: "What would you like to improve or clarify?",
    copied: "Text copied.", selected: "Text selected. Choose Copy in your browser menu.",
    downloaded: "Your text is ready to download.", filename: "FMCA-enquiry.txt",
    countries: {
      "": "Choose a country", kz: "Kazakhstan", kg: "Kyrgyzstan", uz: "Uzbekistan", tj: "Tajikistan"
    },
    services: {
      "": "Help me choose a service", management: "Comprehensive property management",
      engineering: "Technical operation of engineering systems", service: "Facility services",
      audit: "Audit of current facility management", bts: "Operating rates for build-to-suit projects"
    },
    openings: {
      "": "Please help us choose an FMCA service for our property.",
      management: "We would like to discuss comprehensive management of our property.",
      engineering: "We would like to discuss technical operation of the engineering systems at our property.",
      service: "We would like to discuss facility services for our property.",
      audit: "We are interested in an audit of our current facility management.",
      bts: "We would like an estimate of the operating rates for a build-to-suit project."
    }
  }
};

const query = new URLSearchParams(location.search);
const requestedService = query.get("service");
if (Object.hasOwn(openingsRu, requestedService)) service.value = requestedService;
const requestedCountry = query.get("country");
if (Object.hasOwn(translations.ru.countries, requestedCountry)) country.value = requestedCountry;
let language = query.get("lang") === "en" ? "en" : "ru";
const languageLink = document.getElementById("language");

function pageQuery(lang) {
  const params = new URLSearchParams(location.search);
  params.set("lang", lang);
  for (const field of [service, country]) {
    if (field.value) params.set(field.id, field.value);
    else params.delete(field.id);
  }
  return "?" + params.toString() + location.hash;
}

function applyLanguage() {
  const copy = translations[language];
  document.documentElement.lang = language;
  document.title = copy.title + " | FMCA";
  for (const node of uiNodes) node.textContent = copy[node.dataset.copy];
  for (const option of service.options) option.textContent = copy.services[option.value];
  for (const option of country.options) option.textContent = copy.countries[option.value];
  city.placeholder = copy.cityExample;
  objectType.placeholder = copy.objectExample;
  task.placeholder = copy.taskExample;
  document.querySelector(".brand").setAttribute("aria-label", copy.logo);
  document.querySelector("nav").setAttribute("aria-label", copy.navigation);
  const homeUrl = language === "en" ? "index.html?lang=en" : "index.html";
  document.querySelector(".brand").setAttribute("href", homeUrl);
  document.querySelector(".home-link").setAttribute("href", homeUrl);
  const nextLanguage = language === "en" ? "ru" : "en";
  languageLink.textContent = nextLanguage === "en" ? "English" : "Русский";
  languageLink.lang = nextLanguage;
  languageLink.hreflang = nextLanguage;
  languageLink.href = pageQuery(nextLanguage);
  updatePreview();
}

languageLink.addEventListener("click", event => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  language = languageLink.hreflang;
  try {
    history.replaceState(null, "", pageQuery(language));
  } catch {
    // Some browsers restrict URL updates on local files. Keep the current draft visible.
  }
  applyLanguage();
});

function updatePreview() {
  const copy = translations[language];
  const parts = [copy.greeting, copy.openings[service.value]];
  const details = [];
  if (country.value) details.push(copy.countryLabel + ": " + copy.countries[country.value]);
  if (city.value.trim()) details.push(copy.cityLabel + ": " + city.value.trim());
  if (objectType.value.trim()) details.push(copy.objectLabel + ": " + objectType.value.trim());
  if (details.length) parts.push(details.join("\n"));
  if (task.value.trim()) parts.push(task.value.trim());
  preview.textContent = parts.join("\n\n");
  statusLine.textContent = "";
}

for (const field of [service, country]) {
  field.addEventListener("change", () => {
    languageLink.href = pageQuery(languageLink.hreflang);
    updatePreview();
  });
}
for (const input of [city, objectType, task]) input.addEventListener("input", updatePreview);
applyLanguage();

document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(preview.textContent);
    statusLine.textContent = translations[language].copied;
  } catch {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    statusLine.textContent = translations[language].selected;
  }
});

document.getElementById("download").addEventListener("click", () => {
  const file = new Blob(["\uFEFF", preview.textContent.replace(/\n/g, "\r\n"), "\r\n"], {
    type: "text/plain;charset=utf-8"
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = translations[language].filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  statusLine.textContent = translations[language].downloaded;
});
