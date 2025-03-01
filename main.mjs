// @ts-check

/**
 * @template {HTMLElement} T
 * @param {string} id
 * @param {new () => T} type
 * @returns T
 */
const getElementAs = (id, type) => {
  const element = document.getElementById(id);
  if (!(element instanceof type)) {
    throw new Error(`Expected element ${id} to have type ${type}: ${element}`);
  }
  return element;
};

const fallbackForm = getElementAs("fallback-form", HTMLFormElement);
const previewForm = getElementAs("preview-form", HTMLFormElement);

const fallbackPreview = getElementAs("fallback", HTMLElement);
const webfontPreview = getElementAs("target", HTMLElement);
const previewSpacer = getElementAs("preview-spacer", HTMLElement);

const fallbackCSSSnippet = getElementAs("fallback-font-css", HTMLElement);

const styleElement = document.createElement("style");
webfontPreview.appendChild(styleElement);

const previewText = [
  "The quick brown fox jumps over the lazy dog.",
  "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.",
  "Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna.",
];

/**
 * @param {HTMLElement} element
 */
const setPreviewText = (element) => {
  previewText.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    element.appendChild(paragraph);
  });
};

setPreviewText(fallbackPreview);
setPreviewText(webfontPreview);

/** @type {number | undefined} */
let currentInterval = undefined;

/**
 * @param {Event=} event
 */
const updateFonts = (event) => {
  event?.preventDefault();
  const fallbackFormData = new FormData(fallbackForm);

  const targetFont = fallbackFormData.get("target-font")?.toString();
  const fallbackFont = fallbackFormData.get("fallback-font")?.toString();
  const sizeAdjust = fallbackFormData.get("size-adjust")?.toString();
  const ascentOverride = fallbackFormData.get("ascent-override")?.toString();
  const descentOverride = fallbackFormData.get("descent-override")?.toString();
  const lineGapOverride = fallbackFormData.get("line-gap-override")?.toString();

  const previewFormData = new FormData(previewForm);
  const fontSize = previewFormData.get("font-size")?.toString();
  const fontWeight = previewFormData.get("font-weight")?.toString();
  const lineHeight = previewFormData.get("line-height")?.toString();
  const simulateLoad = previewFormData.get("simulate-load")?.valueOf();

  clearInterval(currentInterval);

  if (simulateLoad) {
    webfontPreview.classList.remove("hidden");
    fallbackPreview.classList.remove("hidden");

    webfontPreview.classList.add("hidden");
    fallbackPreview.classList.add("black");

    currentInterval = setInterval(() => {
      if (webfontPreview.classList.contains("hidden")) {
        webfontPreview.classList.remove("hidden");
      } else {
        webfontPreview.classList.add("hidden");
      }

      if (fallbackPreview.classList.contains("hidden")) {
        fallbackPreview.classList.remove("hidden");
      } else {
        fallbackPreview.classList.add("hidden");
      }
    }, 1000);
  } else {
    fallbackPreview.classList.remove("black");
    fallbackPreview.classList.remove("hidden");
    webfontPreview.classList.remove("hidden");
  }

  styleElement.innerText = "";
  const fontFaceCSS = `@font-face {
  font-family: 'Fallback';
  src: local('${fallbackFont}');
  size-adjust: ${sizeAdjust ? `${sizeAdjust}%` : "initial"};
  ascent-override: ${ascentOverride ? `${ascentOverride}%` : "initial"};
  descent-override: ${descentOverride ? `${descentOverride}%` : "initial"};
  line-gap-override: ${lineGapOverride ? `${lineGapOverride}%` : "initial"};
}`;

  const outputCSS = `
.output {
  font-size: ${fontSize}px;
  font-weight: ${fontWeight};
  line-height: ${lineHeight};
}`;

  styleElement.textContent = fontFaceCSS + outputCSS;
  fallbackCSSSnippet.textContent = fontFaceCSS;

  webfontPreview.style.fontFamily = targetFont ?? "unset";

  const previewHeight = Math.max(
    webfontPreview.getBoundingClientRect().height,
    fallbackPreview.getBoundingClientRect().height
  );
  previewSpacer.style.height = `${previewHeight}px`;
};

updateFonts();
fallbackForm.addEventListener("change", updateFonts);
previewForm.addEventListener("change", updateFonts);
window.addEventListener("resize", updateFonts);

const disableInputs = document.querySelectorAll(
  '.input-disable > input[type="checkbox"]'
);
for (const input of disableInputs) {
  if (input instanceof HTMLInputElement) {
    const [inputID] = input.name.split("-disable");
    const actualInput = document.getElementById(inputID);

    if (actualInput instanceof HTMLInputElement) {
      input.addEventListener("click", () => {
        if (input.checked) {
          actualInput.disabled = true;
        } else {
          actualInput.disabled = false;
        }
      });
    }
  }
}
