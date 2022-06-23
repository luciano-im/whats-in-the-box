"use strict";

// HTML video tag
const video = document.getElementById("video");
// videoDimensions store the size of the html video tag
let videoDimensions = null;
// intrinsecDimensions store the dimensions of the captured video
let intrinsecDimensions = null;
// Labels container
const labels = document.getElementById("labels");
// Array of active labels on camera
let activeLabels = [];
// Expiry = 2 hours
const EXPIRY = 7200000000;
// Backend URL
let backendURL = null;

if (!("BarcodeDetector" in window)) {
  console.log("Barcode Detector is not supported by this browser.");
}
// Create new QR code detector
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

// Get the media (video) stream and assign it to the video tag
// Get video dimensions once video has been loaded, and run detectCode() every 100 milliseconds
const getVideo = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
    video.srcObject = stream;
    // Video dimensions are available on loadedmetadata event
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

// Detect QR codes on to the video element
// Calculate position for each QR code label
const detectCode = () => {
  barcodeDetector
    .detect(video)
    .then((codes) => {
      // If no codes exit function and hide all labels
      if (codes.length === 0) {
        hideLabels();
        return;
      }

      for (const barcode of codes) {
        // boundingBox data is related to intrinsec video dimensions
        const { x, y, width, height } = barcode.boundingBox;
        // Calculate the position of x and y relative to the size of the video element
        const realX = (videoDimensions.width * x) / intrinsecDimensions.width;
        const realY = (videoDimensions.height * y) / intrinsecDimensions.height;
        // Calculate the width and height of the QR code relative to the size of the video element
        const qrWidth =
          (videoDimensions.width * width) / intrinsecDimensions.width;
        const qrHeight =
          (videoDimensions.height * height) / intrinsecDimensions.height;
        // Calculate the center point of each QR code
        const centerPoint = {
          x: realX + qrWidth / 2,
          y: realY + qrHeight / 2,
        };
        const rawValue = barcode.rawValue;

        // Update the position of the label indicated in rawValue (id)
        updateLabel(centerPoint, rawValue);
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

// Hide all labels
const hideLabels = () => {
  activeLabels.map((id) => {
    const label = document.getElementById(`label-${id}`);
    label.style.display = "none";
  });
  activeLabels = [];
};

// Update label position and content
// Search for label in local storage cache. If it not exists or has expired then fetch label data to the backend
// and save label in cache.
const updateLabel = async (centerPoint, id) => {
  let cachedLabel = null;
  const now = new Date();
  if (!activeLabels.includes(id)) {
    cachedLabel = await getCachedLabel(id);
    // If label does not exist or has expired, then fetch data to the backend
    if (!cachedLabel || now.getTime() > cachedLabel.value.expiry) {
      fetchAPI(id).then((res) => {
        if (res) {
          const item = {
            value: res,
            expiry: now.getTime() + EXPIRY,
          };
          // Save label to local cache
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
      // Set label content
      el.innerHTML = cachedLabel.value.content.replace(/[\r\n]/gm, "");
      labels.appendChild(el);
    }

    const label = document.getElementById(`label-${id}`);
    if (!activeLabels.includes(cachedLabel.value.id)) {
      // Add label to active labels array
      activeLabels.push(cachedLabel.value.id);
      // Show label
      label.style.display = "inline-block";
    }
    // Set label position
    label.style.left = `${centerPoint.x}px`;
    label.style.top = `${centerPoint.y}px`;
  }
};

// Fetch container data to the backend
const fetchAPI = async (id) => {
  const url = `${backendURL}/api/container/${id}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Parse json response
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

// Write label data to local cache
const writeLabelToCache = (id, data) => {
  return localStorage.setItem(`label-${id}`, JSON.stringify(data));
};

// Read label data from local cache
const getCachedLabel = (id) => {
  return JSON.parse(localStorage.getItem(`label-${id}`)) || null;
};

// Helper function that calculates the real dimensions of the video element active area
// https://nathanielpaulus.wordpress.com/2016/09/04/finding-the-true-dimensions-of-an-html5-videos-active-area/
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

// Initialize the script
window.addEventListener("load", () => {
  backendURL = document.location.origin;
  getVideo();
});
