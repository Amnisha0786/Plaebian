import { locationIcon, titles } from "./constants";

//api
import { API_END_POINTS } from "./apiConstants";
import { getRequest } from "helper/api";

//toastify
import { toast } from "react-toastify";

export const getTitle = (followerCount) => {
  let title = "";
  for (const key in titles) {
    const element = titles[key];
    if (followerCount >= element.min && followerCount <= element.max) {
      title = key;
      break;
    }
  }

  return title;
};

export const getFollowerCount = (followerCount) => {
  let title = "";
  for (const key in locationIcon) {
    const element = locationIcon[key];
    if (followerCount >= element.min && followerCount <= element.max) {
      title = key;
      break;
    }
  }

  return title;
};

export function convertBase64ToFile(file) {
  const block = file.split(";");
  // Get the content type of the image
  const contentType = block[0].split(":")[1]; // In this case "image/gif"
  // get the real base64 content of the file
  const realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."

  // Convert it to a blob to upload
  const blob = b64toBlob(realData, contentType);
  return blob;
}

export function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || "";
  sliceSize = sliceSize || 512;

  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export const formatNumberWithOneDecimal = (value) => {
  // Convert the number to a string
  var stringValue = value?.toString();

  // Check if the number has a decimal point
  if (stringValue?.indexOf(".") === -1) {
    // If no decimal point found, append '.0' to the end
    return stringValue + ".0";
  } else {
    var parts = stringValue?.split(".");

    // If the decimal part has more than one digit, truncate to one digit
    if (parts?.[1]?.length > 1) {
      parts[1] = parts[1]?.substring(0, 1);
    }

    return parts?.join(".");
  }
};

export const addAcountToStripe = async (user, setProcessing) => {
  if (!user && !setProcessing) {
    return;
  }
  setProcessing(true);
  try {
    const response = await getRequest({
      API: `${API_END_POINTS.ADD_STRIPE_ACCOUNT}/${user?.account?.id || 0}`,
    });
    if (response?.success) {
      window.location.href = response.data.url;
    }
  } catch (error) {
    toast(error || "Something went wrong");
  }
  setProcessing(false);
};
