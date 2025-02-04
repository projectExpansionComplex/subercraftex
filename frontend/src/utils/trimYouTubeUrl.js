export const trimYouTubeUrl = (url) => {
  const videoRegex = "https://youtu.be/";
  const barRegex = "https://www.youtube.com/watch?v=";

  const checkWatchMode = url.includes("v=");

  if (checkWatchMode) {
    const newUrl = url.replace(barRegex, "https://www.youtube.com/embed/");
    return `${newUrl}?controls=0`;
  } else if (!checkWatchMode) {
    const newUrl = url.replace(videoRegex, "https://www.youtube.com/embed/");
    return `${newUrl}?controls=0`;
  } else {
    return null;
  }
};
