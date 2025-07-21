const images = [
  "https://images.unsplash.com/photo-1555529669-ec1489f6457b?auto=format&fit=crop&w=800&q=80",  // keyboard lock
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",  // padlock on screen
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",  // cyber security
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",  // coding lock
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80"   // digital security
];

function setRandomImage() {
  const img = document.getElementById('randomImage');
  const randomIndex = Math.floor(Math.random() * images.length);
  img.src = images[randomIndex];
  img.alt = "Password and digital safety related image";
}

window.addEventListener('load', setRandomImage);
