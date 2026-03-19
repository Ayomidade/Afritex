export const getPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  const fileName = parts[parts.length - 1];
  const folder = parts[parts.length - 2];

  const publicId = `${folder}/${fileName.split(".")[0]}`;

  return publicId;
};

export const generateThumbnail = (url) => {
  return url.replace("/upload/", "/upload/w_300,h_300,c_fill/");
};