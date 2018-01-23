function getScript(id, item) {
  const setPaddingBottomFunction = `
  function setPaddingBottom(sliderImage) {
    var width = sliderImage.getAttribute("data-width");
    var height = sliderImage.getAttribute("data-height");
    var imageRatio = (height / width) * 100;
    sliderImage.parentNode.style.paddingBottom = Math.round(imageRatio * 100) / 100 + "%";
  };`;

  const setCaptionFunction = `
  function setCaption(imageSliderRootElement, sliderImage) {
    var index = sliderImage.getAttribute("data-imageIndex");
    var image = document._${id}_item.images[index];
    var captionElement = imageSliderRootElement.querySelector(".q-imageslider-caption");
    captionElement.childNodes[0].nodeValue = image.caption;
    captionElement.childNodes[1].innerHTML = "";
    if(image.credit) {
      if(image.credit.link.url && image.credit.link.isValid) {
        captionElement.childNodes[1].innerHTML = " (Bild: <a href='" + image.credit.link.url + "' target='blank' rel='noopener noreferrer'>" + image.credit.text + "</a>)";
      } else if(image.credit.text) {
        captionElement.childNodes[1].innerHTML = " (Bild: " + image.credit.text + ")";
      }
    }
  };`;

  const showSliderImageFunction = `
  function showSliderImage(sliderImage) {
    sliderImage.classList.add("q-imageslider-image--is-visible");
    sliderImage.classList.remove("q-imageslider-image--is-hidden");
  };`;

  const hideSliderImageFunction = `
  function hideSliderImage(sliderImage) {
    sliderImage.classList.add("q-imageslider-image--is-hidden");
    sliderImage.classList.remove("q-imageslider-image--is-visible");
  };`;

  const enableSliderButtonFunction = `
  function enableSliderButton(sliderButton) {
    sliderButton.children[0].children[0].classList.add("s-color-gray-9");
    sliderButton.children[0].children[0].classList.remove("s-color-gray-4");
    sliderButton.children[1].classList.add("s-color-primary-5");
    sliderButton.children[1].classList.remove("s-color-gray-4");
  }`;

  const disableSliderButtonFunction = `
  function disableSliderButton(sliderButton) {
    sliderButton.children[0].children[0].classList.add("s-color-gray-4");
    sliderButton.children[0].children[0].classList.remove("s-color-gray-9");
    sliderButton.children[1].classList.add("s-color-gray-4");
    sliderButton.children[1].classList.remove("s-color-primary-5");
  }`;

  const fireTrackingEventFunction = `
  function fireTrackingEvent(imageSliderRootElement, itemId) {
    // dispatch CustomEvent on next-image for tracking
    // or anyone else interested in it
    var imageSliderControlEvent = new CustomEvent('q-imageslider-next-image', {
      bubbles: true,
      detail: {
        id: itemId
      }
    });
    imageSliderRootElement.dispatchEvent(imageSliderControlEvent);
  }`;

  const trackImageSwitchFunction = `
  function trackImageSwitch(imageSliderRootElement, imageIndex) {
    // only fire image-switch tracking event if the image wasn't already visited before
    if(!document._${id}_item.images[imageIndex].visited) {
      fireTrackingEvent(imageSliderRootElement, document._${id}_item.id);
    }
    document._${id}_item.images[imageIndex].visited = true;
  }`;

  const twoImagesScript = `
  function ${id}_initImageslider() {
    document._${id}_item = ${JSON.stringify(item)};
    ${setPaddingBottomFunction}
    ${setCaptionFunction}
    ${showSliderImageFunction}
    ${hideSliderImageFunction}
    ${fireTrackingEventFunction}
    ${trackImageSwitchFunction}
    var imageSliderRootElement = document.querySelector("#${id}");
    var sliderSwitch = imageSliderRootElement.querySelector(".q-imageslider-switch");
    var sliderImages = imageSliderRootElement.querySelectorAll(".q-imageslider-image");

    sliderSwitch.addEventListener("change", function() {
      if(this.checked) {
        hideSliderImage(sliderImages[0]);
        showSliderImage(sliderImages[1]);
        setCaption(imageSliderRootElement, sliderImages[1]);
        setPaddingBottom(sliderImages[1]);
        trackImageSwitch(imageSliderRootElement, 1);
      } else {
        hideSliderImage(sliderImages[1]);
        showSliderImage(sliderImages[0]);
        setCaption(imageSliderRootElement, sliderImages[0]);
        setPaddingBottom(sliderImages[0]);
        trackImageSwitch(imageSliderRootElement, 0);
      }
    });
  };
  ${id}_initImageslider();`;

  const multipleImagesScript = `
  function ${id}_initImageslider() {
    document._${id}_item = ${JSON.stringify(item)};
    ${setPaddingBottomFunction}
    ${setCaptionFunction}
    ${showSliderImageFunction}
    ${hideSliderImageFunction}
    ${enableSliderButtonFunction}
    ${disableSliderButtonFunction}
    ${fireTrackingEventFunction}
    ${trackImageSwitchFunction}
    var imageSliderRootElement = document.querySelector("#${id}");
    var sliderButtons = imageSliderRootElement.querySelectorAll(".q-imageslider-button");
    var sliderImages = imageSliderRootElement.querySelectorAll(".q-imageslider-image");

    sliderButtons.forEach(function(sliderButton, buttonIndex) {
      sliderButton.addEventListener("click", () => {
        // Set selected state on sliderButtons
        sliderButtons.forEach(function(sliderButton, index) {
          if(buttonIndex === index) {
            enableSliderButton(sliderButton);
          } else {
            disableSliderButton(sliderButton);
          }
        });
        // Show selected image and hide other images
        sliderImages.forEach(function(sliderImage, imageIndex) {
          if(buttonIndex === imageIndex) {
            showSliderImage(sliderImage);
            setCaption(imageSliderRootElement, sliderImage);
            setPaddingBottom(sliderImage);
            trackImageSwitch(imageSliderRootElement, imageIndex);
          } else {
            hideSliderImage(sliderImage);
          }
        });
      });
    });
  }
  ${id}_initImageslider();`;

  return item.images.length > 2 ? multipleImagesScript : twoImagesScript;
}

module.exports = {
  getScript: getScript
};
