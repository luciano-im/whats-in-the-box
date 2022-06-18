"use strict";

const video = document.getElementById("video");
let videoDimensions = null;
let intrinsecDimensions = null;
const labels = document.getElementById("labels");
let activeLabels = [];
// Expiry = 2 hours
const EXPIRY = 7200000000;

if (!("BarcodeDetector" in window)) {
  console.log("Barcode Detector is not supported by this browser.");
}
// create new qr code detector
const barcodeDetector = new BarcodeDetector({
  formats: ["qr_code"],
});

// Contraints for media device
const CONSTRAINTS = {
  video: {
    width: {
      min: 320,
    },
    height: {
      ideal: 480,
    },
    facingMode: "environment",
  },
};

const getVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      videoDimensions = getVideoDimensions(video);
      intrinsecDimensions = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      // Run detect code function every 100 milliseconds
      setInterval(detectCode, 100);
    });
  } catch (err) {
    console.error(err);
  }
};

// Detect code function
const detectCode = () => {
  // Start detecting codes on to the video element
  barcodeDetector
    .detect(video)
    .then((codes) => {
      // If no codes exit function
      if (codes.length === 0) {
        hideLabels();
        return;
      }

      for (const barcode of codes) {
        // boundingBox data is related to intrinsec video dimensions
        const { x, y, width, height } = barcode.boundingBox;
        const realX = (videoDimensions.width * x) / intrinsecDimensions.width;
        const realY = (videoDimensions.height * y) / intrinsecDimensions.height;
        const qrWidth =
          (videoDimensions.width * width) / intrinsecDimensions.width;
        const qrHeight =
          (videoDimensions.height * height) / intrinsecDimensions.height;
        const centerPoint = {
          x: realX + qrWidth / 2,
          y: realY + qrHeight / 2,
        };
        const rawValue = barcode.rawValue;

        updateLabel(centerPoint, rawValue);
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const hideLabels = () => {
  activeLabels.map((id) => {
    const label = document.getElementById(`label-${id}`);
    label.style.display = "none";
  });
  activeLabels = [];
};

const updateLabel = async (centerPoint, id) => {
  let cachedLabel = null;
  const now = new Date();
  if (!activeLabels.includes(id)) {
    cachedLabel = await getCachedLabel(id);
    if (!cachedLabel || now.getTime() > cachedLabel.value.expiry) {
      fetchAPI(id).then((res) => {
        if (res) {
          const item = {
            value: res,
            expiry: now.getTime() + EXPIRY,
          };
          writeLabelToCache(id, item);
          cachedLabel = res;
        }
      });
    }
  }

  if (cachedLabel != null) {
    if (!document.getElementById(`label-${id}`)) {
      let el = document.createElement("span");
      el.id = `label-${cachedLabel.value.id}`;
      el.innerHTML = cachedLabel.value.content.replace(/[\r\n]/gm, "");
      labels.appendChild(el);
    }

    const label = document.getElementById(`label-${id}`);
    if (!activeLabels.includes(cachedLabel.value.id)) {
      activeLabels.push(cachedLabel.value.id);
      label.style.display = "inline-block";
    }
    label.style.left = `${centerPoint.x}px`;
    label.style.top = `${centerPoint.y}px`;
  }
};

const fetchAPI = async (id) => {
  const url = `http://127.0.0.1:8000/api/container/${id}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    const status_code = response.status;
    if (status_code != 200) {
      console.log("Error in getting brand info!");
      return false;
    }

    return result;
  } catch (error) {
    console.log(error);
  }
};

const writeLabelToCache = (id, data) => {
  return localStorage.setItem(`label-${id}`, JSON.stringify(data));
};

const getCachedLabel = (id) => {
  return JSON.parse(localStorage.getItem(`label-${id}`)) || null;
};

window.addEventListener("load", () => {
  getVideo();
});

// Finding the true dimensions of an HTML5 video’s active area
// https://nathanielpaulus.wordpress.com/2016/09/04/finding-the-true-dimensions-of-an-html5-videos-active-area/
// helper function
const getVideoDimensions = (video) => {
  // Ratio of the video's intrisic dimensions
  var videoRatio = video.videoWidth / video.videoHeight;
  // The width and height of the video element
  var width = video.offsetWidth,
    height = video.offsetHeight;
  // The ratio of the element's width to its height
  var elementRatio = width / height;
  // If the video element is short and wide
  if (elementRatio > videoRatio) width = height * videoRatio;
  // It must be tall and thin, or exactly equal to the original ratio
  else height = width / videoRatio;

  return {
    width: width,
    height: height,
  };
};
