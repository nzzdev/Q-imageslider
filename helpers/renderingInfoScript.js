function getScript (id, imageCount) {
  const twoImagesScript = `
    function ${id}_initImageslider() {
      var sliderSwitch = document.querySelector(".q-imageslider-switch");
      var sliderImages = document.querySelectorAll(".q-imageslider-image");
      sliderSwitch.addEventListener("change", function() {
        if(this.checked) {
          sliderImages[0].classList.add("q-imageslider-image--is-hidden");
          sliderImages[0].classList.remove("q-imageslider-image--is-visible");
          sliderImages[1].classList.add("q-imageslider-image--is-visible");
          sliderImages[1].classList.remove("q-imageslider-image--is-hidden");
        } else {
          sliderImages[0].classList.add("q-imageslider-image--is-visible");
          sliderImages[0].classList.remove("q-imageslider-image--is-hidden");
          sliderImages[1].classList.add("q-imageslider-image--is-hidden");
          sliderImages[1].classList.remove("q-imageslider-image--is-visible");
        }
      });
    };
    ${id}_initImageslider();
    `

    const multipleImagesScript = `
    function ${id}_initImageslider() {
      var sliderButtons = document.querySelectorAll(".q-imageslider-button");
      var sliderImages = document.querySelectorAll(".q-imageslider-image");
      sliderButtons.forEach(function(sliderButton, buttonIndex) {
          sliderButton.addEventListener("click", () => {
              // Set selected state on sliderButtons
              sliderButtons.forEach(function(sliderButton, index) {
                  if(buttonIndex === index) {
                      sliderButton.children[0].classList.add("s-color-gray-9");
                      sliderButton.children[0].classList.remove("s-color-gray-4");
                      sliderButton.children[1].classList.add("s-color-primary-5");
                      sliderButton.children[1].classList.remove("s-color-gray-4");
                  } else {
                      sliderButton.children[0].classList.add("s-color-gray-4");
                      sliderButton.children[0].classList.remove("s-color-gray-9");
                      sliderButton.children[1].classList.add("s-color-gray-4");
                      sliderButton.children[1].classList.remove("s-color-primary-5");
                  }
              });
              // Show selected image and hide other images
              sliderImages.forEach(function(sliderImage, imageIndex) {
                  if(buttonIndex === imageIndex) {
                      sliderImage.classList.add("q-imageslider-image--is-visible");
                      sliderImage.classList.remove("q-imageslider-image--is-hidden");
                  } else {
                      sliderImage.classList.add("q-imageslider-image--is-hidden");
                      sliderImage.classList.remove("q-imageslider-image--is-visible");
                  }
              });
          });
      });
    }
    ${id}_initImageslider();
    `
    return (imageCount > 2) ? multipleImagesScript: twoImagesScript
}

module.exports = {
  getScript: getScript
}
