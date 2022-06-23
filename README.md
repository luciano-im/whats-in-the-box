
# What's in the Box?

Scan a QR code with your mobile camera and see what' inside the box.

Create a box, add a list of the things stored inside the box, print the QR code and stick it on the box, and never open box after box again to search for something.


## About the project

This is a test app I made to learn how to implement an agumented-reality-like functionality. The idea is based on some tweets from WesBos.

I used **Python** for backend with the **Django** framework:

* I created tests for the backend.
* I developed views for creating, deleting and editing boxes/containers; and for printing QR codes.
* I explosed a JSON view as an endpoint for getting boxes data.
* I added a signal to create the QR code after creating a box.


I used vanilla **Javascript** for the "QR scanner" client:
* I implemented localStorage as a cache to prevent fetching the backend each time a QR is read.
* I used getUserMedia() to access the camera.
* I'm using browser built-in BarcodeDetector feature.
* I used fetch to make HTTP requests.


## Demo

![](https://github.com/luciano-im/whats-in-the-box/raw/main/demo.gif)
## Tech Stack

**Client:** Vanilla Javascript

**Server:** Python, Django


## Installation

1. Clone this repo
2. Create a Python 3 virtual environment
3. Install the dependencies:
```bash
  $ pip install -r requirements.txt
```
4. Run the Django local server:
```bash
  $ python manage.py runserver
```
5. If you want to test it with your mobile device you has to share your local Django server with a tool like [ngrok](https://ngrok.com/):
```bash
  $ ngrok http 8000
```
6. Create a .env file inside the backend directory and set the BACKEND_URL environment variable with the hostname ngrok gave you. This will setup the ALLOWED_HOSTS and CORS_ORIGIN_WHITELIST settings:
```text
  BACKEND_URL='https://425e-190-92-102-253.sa.ngrok.io'
```
## Authors

- [@luciano_dev](https://twitter.com/luciano_dev)


## License

[MIT](https://choosealicense.com/licenses/mit/)

