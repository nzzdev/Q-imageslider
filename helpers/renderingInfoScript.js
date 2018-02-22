function getScript(id, item, imageServiceUrl) {
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

  const addClickEventListenersFunction = `
  function addClickEventListeners(imageSliderRootElement) {
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
  }`;

  const addClickEventListenersMultipleFunction = `
  function addClickEventListenersMultiple(imageSliderRootElement) {
    var sliderButtons = imageSliderRootElement.querySelectorAll(".q-imageslider-button");
    var sliderImages = imageSliderRootElement.querySelectorAll(".q-imageslider-image");
    sliderButtons.forEach(function(sliderButton, buttonIndex) {
      sliderButton.addEventListener("click", function() {
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
  }`;

  const elementMarkup =
    '<source type="image/webp" srcset="{webp1x} 1x, {webp2x} 2x"><source srcset="{image1x} 1x {image2x} 2x"><img class="q-imageslider-image" data-imageIndex="{index}" style="position:absolute; display:block; width:100%; opacity: {opacityValue};" src="{image1x}">';

  const constructPictureElementFunction = `
  function constructPictureElement(imageSliderRootElement, sliderImageElements, multiple) {
    if (!window.q_domready) {
      window.q_domready = new Promise(function(resolve) {
        if (document.readyState && (document.readyState === 'interactive' || document.readyState === 'complete')) {
          resolve();
        } else {
          function onReady() {
            resolve();
            document.removeEventListener('DOMContentLoaded', onReady, true);
          }
          document.addEventListener('DOMContentLoaded', onReady, true);
          document.onreadystatechange = function() {
            if (document.readyState === "interactive") {
              resolve();
            }
          }
        }
      })
    }

    window.q_domready.then(function() {
      document._${id}_item.width = imageSliderRootElement.getBoundingClientRect().width;
      sliderImageElements.forEach(function(sliderImage) {
        var imageIndex = sliderImage.getAttribute("data-imageIndex");
        var startImage = sliderImage.getAttribute("data-startImage");
        var opacityValue = imageIndex === startImage ? 1 : 0;
        var imageKey = sliderImage.getAttribute("data-imageKey");
        var urls = getImageUrls(imageKey, document._${id}_item.width);
        var innerHTMLPictureElement = '${elementMarkup}'.replace(/{image1x}/g, urls.image1x).replace(/{image2x}/g, urls.image2x).replace(/{webp1x}/g, urls.webp1x).replace(/{webp2x}/g, urls.webp2x).replace(/{index}/g, imageIndex).replace(/{opacityValue}/g, opacityValue);
        sliderImage.innerHTML = innerHTMLPictureElement;
      });
      if(multiple) {
        addClickEventListenersMultiple(imageSliderRootElement);
      } else {
        addClickEventListeners(imageSliderRootElement);
      }
    });
  }`;

  const imageUrlFunction = `
  function getFileExtension(imageKey) {
    var fileExtensionPattern = /\.([0-9a-z]+$)/i;
    var fileExtension = imageKey.match(fileExtensionPattern)[1];
    if(fileExtension === "png") {
      return "png";
    }
    return "pjpg";
  }
  function getImageUrl(imageKey, width, format) {
    return '${imageServiceUrl}'.replace(/{key}/g, imageKey)
      .replace(/{width}/g, width)
      .replace(/{format}/g, format);
  }
  function getImageUrls(imageKey, width) {
    return {
      image1x: getImageUrl(imageKey, width, getFileExtension(imageKey)),
      image2x: getImageUrl(imageKey, width * 2, getFileExtension(imageKey)),
      webp1x: getImageUrl(imageKey, width, "webply"),
      webp2x: getImageUrl(imageKey, width * 2, "webply")
    };
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
    ${addClickEventListenersFunction}
    ${imageUrlFunction}
    ${constructPictureElementFunction}

    var imageSliderRootElement = document.querySelector("#${id}");
    var sliderImageElements = Array.prototype.slice.call(imageSliderRootElement.querySelector(".q-imageslider-image-container").children);
    // Construct picture element on client side if not already done on server-side
    if(sliderImageElements[0].children.length === 0) {
      constructPictureElement(imageSliderRootElement, sliderImageElements, false);
    } else {
      addClickEventListeners(imageSliderRootElement);
    }
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
    ${addClickEventListenersMultipleFunction}
    ${imageUrlFunction}
    ${constructPictureElementFunction}

    var imageSliderRootElement = document.querySelector("#${id}");
    var sliderImageElements = Array.prototype.slice.call(imageSliderRootElement.querySelector(".q-imageslider-image-container").children);
    // Construct picture element on client side if not already done on server-side
    if(sliderImageElements[0].children.length === 0) {
      constructPictureElement(imageSliderRootElement, sliderImageElements, true);
    } else {
      addClickEventListenersMultiple(imageSliderRootElement);
    }
  }
  ${id}_initImageslider();`;

  return item.images.length > 2 ? multipleImagesScript : twoImagesScript;
}

module.exports = {
  getScript: getScript
};
