function getScript(id, imageCount) {
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
        var caption = sliderImages[1].getAttribute("data-caption") + " <span>" + sliderImages[1].getAttribute("data-credit") + "</span>";
        document.querySelector(".q-imageslider-caption").innerHTML = caption;
        var width = sliderImages[1].getAttribute("data-width");
        var height = sliderImages[1].getAttribute("data-height");
        var imageRatio = (height / width) * 100;
        sliderImages[1].parent.style.paddingBottom = Math.round(imageRatio * 100) / 100 + "%";
      } else {
        sliderImages[0].classList.add("q-imageslider-image--is-visible");
        sliderImages[0].classList.remove("q-imageslider-image--is-hidden");
        sliderImages[1].classList.add("q-imageslider-image--is-hidden");
        sliderImages[1].classList.remove("q-imageslider-image--is-visible");
        var caption = sliderImages[0].getAttribute("data-caption") + " <span>" + sliderImages[0].getAttribute("data-credit") + "</span>";
        document.querySelector(".q-imageslider-caption").innerHTML = caption;
        var width = sliderImages[0].getAttribute("data-width");
        var height = sliderImages[0].getAttribute("data-height");
        var imageRatio = (height / width) * 100;
        sliderImages[0].parentNode.style.paddingBottom = Math.round(imageRatio * 100) / 100 + "%";
      }
    });
  };
  ${id}_initImageslider();
  `;

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
            var caption = sliderImage.getAttribute("data-caption") + " <span>" + sliderImage.getAttribute("data-credit") + "</span>";
            document.querySelector(".q-imageslider-caption").innerHTML = caption;
            var width = sliderImage.getAttribute("data-width");
            var height = sliderImage.getAttribute("data-height");
            var imageRatio = (height / width) * 100;
            sliderImage.parentNode.style.paddingBottom = Math.round(imageRatio * 100) / 100 + "%";
          } else {
            sliderImage.classList.add("q-imageslider-image--is-hidden");
            sliderImage.classList.remove("q-imageslider-image--is-visible");
          }
        });
      });
    });
  }
  ${id}_initImageslider();
  `;
  return imageCount > 2 ? multipleImagesScript : twoImagesScript;
}

module.exports = {
  getScript: getScript
};
