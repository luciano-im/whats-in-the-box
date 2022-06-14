"use strict";

const video = document.getElementById("video");
// const canvas = document.getElementById("canvas");
// var context = canvas.getContext("2d");
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
      ideal: 640,
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
    // Run detect code function every 100 milliseconds
    setInterval(detectCode, 100);
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
        const { x, y, width, height } = barcode.boundingBox;
        const centerPoint = {
          x: x + width / 2,
          y: y + height / 2,
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

// 1. Read QR Code (OK)
// 2. Get raw value (OK)
// 3. AJAX Fetch to the backend (OK)
// 4. Create label (OK)
// 5. Show label (OK)
// 6. Hide label when QR hides (OK)
// 7. Implement localStorage (OK)
// 8. Set expiry to localStorage data (OK)
// 9. Styles and layout
// 10. Generate QR code
// 11. Test expiry date
// 12. Implement socket.io
