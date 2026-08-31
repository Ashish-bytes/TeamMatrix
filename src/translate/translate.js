import axios from "axios";

async function translate(text, toLang) {
  try {
    const response = await axios.post(
      "https://teammatrix-backend.onrender.com/api/translate",
      {
        textArr: text,
        toLang: toLang,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

async function translateObj(obj, toLang) {
  return await translate(JSON.stringify(obj), toLang);
}

async function translateLocalStorage(key, toLang) {
  const item = JSON.parse(localStorage.getItem(key));

  if (!item) {
    return null;
  }

  const translatedText = await translateObj(item, toLang);

  let translated;

  try {
    translated = JSON.parse(translatedText);
  } catch (error) {
    console.error("Could not parse translated roadmap:", error);
    return null;
  }

  localStorage.setItem(key, JSON.stringify(translated));

  return translated;
}

export { translate, translateObj, translateLocalStorage };