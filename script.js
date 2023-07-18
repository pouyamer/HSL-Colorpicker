const hslStringify = (h, s, l, a = 1) => `hsl(${h}, ${s}%, ${l}%, ${a})`

function hslToRgb(hue, saturation, lightness, alpha = 1) {
  hue /= 360
  saturation /= 100
  lightness /= 100

  let red, green, blue

  if (saturation === 0) {
    red = green = blue = lightness
  } else {
    const hueToRgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation
    const p = 2 * lightness - q
    red = hueToRgb(p, q, hue + 1 / 3)
    green = hueToRgb(p, q, hue)
    blue = hueToRgb(p, q, hue - 1 / 3)
  }

  red = Math.round(red * 255)
  green = Math.round(green * 255)
  blue = Math.round(blue * 255)
  alpha = Math.min(Math.max(alpha, 0), 1)

  return [red, green, blue, alpha]
}

function rgbToHex(r, g, b) {
  const hexDigits = [r.toString(16), g.toString(16), b.toString(16)]

  // Pad the hex digits with zeros if they are less than 2 digits long.
  for (let i = 0; i < hexDigits.length; i++) {
    hexDigits[i] = hexDigits[i].length === 1 ? `0${hexDigits[i]}` : hexDigits[i]
  }

  return `#${hexDigits.join("")}`
}

const colorBoxEl = document.querySelector(".colorbox")
const hexTextEl = colorBoxEl.querySelector(".hex")
const rgbTextEl = colorBoxEl.querySelector(".rgb")
const hslTextEl = colorBoxEl.querySelector(".hsl")

const hueCanvas = document.querySelector(".hue-canvas")
const saturationCanvas = document.querySelector(".saturation-canvas")
const lightCanvas = document.querySelector(".light-canvas")

const canvasEls = [hueCanvas, saturationCanvas, lightCanvas]

// setting all canvas width and height to avoid stretching

canvasEls.forEach(canvas => {
  canvas.width = getComputedStyle(canvas).width.split("px")[0]
  canvas.height = getComputedStyle(canvas).height.split("px")[0]
  console.log({
    w: canvas.width,
    h: canvas.height
  })
})

const hCtx = hueCanvas.getContext("2d")
const sCtx = saturationCanvas.getContext("2d")
const lCtx = lightCanvas.getContext("2d")

let currentHue = 0
let currentSaturation = 0
let currentLight = 0

const hueValueTextElement = document.querySelector(".hue-value")
const saturationValueTextElement = document.querySelector(".saturation-value")
const lightValueTextElement = document.querySelector(".light-value")

const saturationPercentageCharacterSpanElement =
  document.querySelector(".s-percent")
const lightPercentageCharacterSpanElement = document.querySelector(".l-percent")

const setColorValue = (propertyString, value) => {
  switch (propertyString) {
    case "hue":
      currentHue = value
      return
    case "saturation":
      currentSaturation = value
      return
    case "light":
      currentLight = value
      return
    default:
    // Do nothing
  }
}

const updateColorValueText = (propertyString, value, updateByClick = false) => {
  const valueSliced = value
    .toString()
    .slice(0, value.toString().lastIndexOf(".") + 3)

  switch (propertyString) {
    case "hue":
      hueValueTextElement.innerText = valueSliced
      return
    case "saturation":
      saturationValueTextElement.innerText = valueSliced
      return
    case "light":
      lightValueTextElement.innerText = valueSliced
      if (value < 45) {
        if (updateByClick) {
          hueValueTextElement.style.color = "#eee"
          saturationValueTextElement.style.color = "#eee"
          saturationPercentageCharacterSpanElement.style.color = "#eee"
        }
        lightValueTextElement.style.color = "#eee"
        lightPercentageCharacterSpanElement.style.color = "#eee"
      } else {
        if (updateByClick) {
          hueValueTextElement.style.color = "#111"
          saturationValueTextElement.style.color = "#111"
          saturationPercentageCharacterSpanElement.style.color = "#111"
        }
        lightValueTextElement.style.color = "#111"
        lightPercentageCharacterSpanElement.style.color = "#111"
      }
      return
    default:
    // Do nothing
  }
}

setColorValue("hue", 40.0)
setColorValue("saturation", 50.0)
setColorValue("light", 60.0)
updateColorValueText("hue", 40.0)
updateColorValueText("saturation", 50.0)
updateColorValueText("light", 60.0, true)

const updateColorPropertyElements = () => {
  const hueMultiplier = 10

  for (let i = 0; i < 360 * hueMultiplier; i++) {
    hCtx.fillStyle = hslStringify(
      i / hueMultiplier,
      currentSaturation,
      currentLight
    )

    hCtx.fillRect(
      (i * hueCanvas.width) / (hueMultiplier * 360),
      0,
      hueCanvas.width,
      hueCanvas.height
    )
  }

  const saturationMultiplier = 10

  for (let i = 0; i < 100 * hueMultiplier; i++) {
    sCtx.fillStyle = hslStringify(
      currentHue,
      i / saturationMultiplier,
      currentLight
    )

    sCtx.fillRect(
      (i * saturationCanvas.width) / (saturationMultiplier * 100),
      0,
      saturationCanvas.width,
      saturationCanvas.height
    )

    // color the colorbox element
    colorBoxEl.style.backgroundColor = hslStringify(
      currentHue,
      currentSaturation,
      currentLight
    )

    // set the colorbox texts
    hslTextEl.innerText = `hsl(${currentHue
      .toString()
      .slice(
        0,
        currentHue.toString().lastIndexOf(".") + 2.0
      )}, ${currentSaturation
      .toString()
      .slice(
        0,
        currentSaturation.toString().lastIndexOf(".") + 2.0
      )}%, ${currentLight
      .toString()
      .slice(0, currentLight.toString().lastIndexOf(".") + 2.0)}%)`

    const rgbaValues = hslToRgb(currentHue, currentSaturation, currentLight)

    rgbTextEl.innerText = `rgb(${rgbaValues[0]}, ${rgbaValues[1]}, ${rgbaValues[2]}, ${rgbaValues[3]})`

    const hexValue = rgbToHex(...rgbaValues)

    hexTextEl.innerText = `${hexValue}`
  }

  const lightMultiplier = 10

  for (let i = 0; i < 100 * hueMultiplier; i++) {
    lCtx.fillStyle = hslStringify(
      currentHue,
      currentSaturation,
      i / lightMultiplier
    )

    lCtx.fillRect(
      (i * saturationCanvas.width) / (lightMultiplier * 100),
      0,
      saturationCanvas.width,
      saturationCanvas.height
    )
  }

  const indicatorColor =
    currentLight > 50
      ? hslStringify(0, 0, 0, 0.75)
      : hslStringify(0, 0, 100, 0.75)

  hCtx.strokeStyle = indicatorColor

  hCtx.strokeRect(
    (currentHue / 360) * hueCanvas.width - 3,
    0,
    6,
    hueCanvas.height
  )

  sCtx.strokeStyle = indicatorColor
  sCtx.strokeRect(
    (currentSaturation / 100) * saturationCanvas.width - 3,
    0,
    6,
    saturationCanvas.height
  )

  lCtx.strokeStyle = indicatorColor
  lCtx.strokeRect(
    (currentLight / 100) * lightCanvas.width - 3,
    0,
    6,
    lightCanvas.height
  )
}

updateColorPropertyElements()

hueCanvas.addEventListener("mousemove", e => {
  const newHue = (e.offsetX / hueCanvas.width) * 360
  updateColorValueText("hue", newHue)
})

hueCanvas.addEventListener("mouseleave", () => {
  updateColorValueText("hue", currentHue)
})

hueCanvas.addEventListener("click", e => {
  const newHue = (e.offsetX / hueCanvas.width) * 360
  setColorValue("hue", newHue)
  updateColorValueText("hue", currentHue)
  updateColorPropertyElements()
})

// Saturation canvas
saturationCanvas.addEventListener("mousemove", e => {
  const newSaturation = (e.offsetX / saturationCanvas.width) * 100
  updateColorValueText("saturation", newSaturation)
})

saturationCanvas.addEventListener("mouseleave", () => {
  updateColorValueText("saturation", currentSaturation)
})

saturationCanvas.addEventListener("click", e => {
  const newSaturation = (e.offsetX / saturationCanvas.width) * 100
  setColorValue("saturation", newSaturation)
  updateColorValueText("saturation", currentSaturation)
  updateColorPropertyElements()
})

// Lightness canvas
lightCanvas.addEventListener("mousemove", e => {
  const newLight = (e.offsetX / lightCanvas.width) * 100
  updateColorValueText("light", newLight)
})

lightCanvas.addEventListener("mouseleave", () => {
  updateColorValueText("light", currentLight)
})

lightCanvas.addEventListener("click", e => {
  const newLight = (e.offsetX / lightCanvas.width) * 100
  setColorValue("light", newLight)
  updateColorValueText("light", currentLight, true)
  updateColorPropertyElements()
})
