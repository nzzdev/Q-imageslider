const querystring = require("querystring");

function getScript(
  id,
  toolBaseUrl,
  item,
  method,
  queryParams,
  requestBodyString
) {
  const showOrHideCaptionFunction = `
  function showOrHideCaption(imageSliderRootElement, sliderImage) {
    if(!sliderImage) return;

    var index = sliderImage.getAttribute("data-imageIndex");
    var image = document._${id}_item.images[index];
    var caption = imageSliderRootElement.querySelector(".q-imageslider-description__caption");
    var author = imageSliderRootElement.querySelector(".q-imageslider-description__author");
    
    if (image.caption || (image.credit && image.credit.text)) {
      imageSliderRootElement.querySelector(".q-imageslider-description").style.display = "flex";
    } else {
      imageSliderRootElement.querySelector(".q-imageslider-description").style.display = "none";
    }
  };`;

  const setCaptionFunction = `
  function setCaption(imageSliderRootElement, sliderImage) {
    if (!sliderImage) return;

    var index = sliderImage.getAttribute("data-imageIndex");
    var image = document._${id}_item.images[index];
    var caption = imageSliderRootElement.querySelector(".q-imageslider-description__caption");
    var author = imageSliderRootElement.querySelector(".q-imageslider-description__author");
    
    caption.innerHTML = "";
    if (image.caption) {
      caption.innerHTML = image.caption;
    }

    author.innerHTML = "";
    if(image.credit && image.credit.text) {
      if(image.credit.link && image.credit.link.url && image.credit.link.isValid) {
        author.innerHTML = "<a class='q-imageslider-description__author__url' href='" + image.credit.link.url + "' target='blank' rel='noopener noreferrer'>" + image.credit.text + "</a>";
      } else {
        author.innerHTML = image.credit.text;
      }
    }
  };`;

  const showSliderImageFunction = `
  function showSliderImage(sliderImage) {
    if(sliderImage) {
      sliderImage.classList.add("q-imageslider-image--is-visible");
      sliderImage.classList.remove("q-imageslider-image--is-hidden");
    }
  };`;

  const hideSliderImageFunction = `
  function hideSliderImage(sliderImage) {
    if(sliderImage) {
      sliderImage.classList.add("q-imageslider-image--is-hidden");
      sliderImage.classList.remove("q-imageslider-image--is-visible");
    }
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
    var imageSliderControlEvent = new CustomEvent('q-tracking-event', {
      bubbles: true,
      detail: {
        eventInfo: {
          componentName: "q-imageslider",
          eventAction: "nextImage-qId-" + itemId,
          eventNonInteractive: false
        }
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

    showOrHideCaption(imageSliderRootElement, sliderImages[0]);

    sliderSwitch.addEventListener("change", function() {
      if(this.checked) {
        hideSliderImage(sliderImages[0]);
        showSliderImage(sliderImages[1]);
        showOrHideCaption(imageSliderRootElement, sliderImages[1]);
        setCaption(imageSliderRootElement, sliderImages[1]);
        trackImageSwitch(imageSliderRootElement, 1);
      } else {
        hideSliderImage(sliderImages[1]);
        showSliderImage(sliderImages[0]);
        showOrHideCaption(imageSliderRootElement, sliderImages[0]);
        setCaption(imageSliderRootElement, sliderImages[0]);
        trackImageSwitch(imageSliderRootElement, 0);
      }
    });
  }`;

  const addClickEventListenersMultipleFunction = `
  function addClickEventListenersMultiple(imageSliderRootElement) {
    var sliderButtons = imageSliderRootElement.querySelectorAll(".q-imageslider-button");
    var sliderImages = imageSliderRootElement.querySelectorAll(".q-imageslider-image");

    showOrHideCaption(imageSliderRootElement, sliderImages[0]);

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
            showOrHideCaption(imageSliderRootElement, sliderImage);
            setCaption(imageSliderRootElement, sliderImage);
            trackImageSwitch(imageSliderRootElement, imageIndex);
          } else {
            hideSliderImage(sliderImage);
          }
        });
      });
    });
  }`;

  const loadImagesFunction = `
  function loadImages(imageSliderRootElement, multiple) {
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
      fetch("${toolBaseUrl}/rendering-info/web-images?${querystring.stringify(
    queryParams
  )}&width=" + imageSliderRootElement.getBoundingClientRect().width, {
        method: "${method}",
        ${requestBodyString ? "body: " + JSON.stringify(requestBodyString) : ""}
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(renderingInfo) {
        if (renderingInfo.markup) {
          document.querySelector("#${id} .q-imageslider-images").innerHTML = renderingInfo.markup;
          if(multiple) {
            addClickEventListenersMultiple(imageSliderRootElement);
          } else {
            addClickEventListeners(imageSliderRootElement);
          }
        }
      });
    });
  }`;

  const twoImagesScript = `
  function ${id}_initImageslider() {
    document._${id}_item = ${JSON.stringify(item)};
    ${showOrHideCaptionFunction}
    ${setCaptionFunction}
    ${showSliderImageFunction}
    ${hideSliderImageFunction}
    ${fireTrackingEventFunction}
    ${trackImageSwitchFunction}
    ${addClickEventListenersFunction}
    ${loadImagesFunction}

    var imageSliderRootElement = document.querySelector("#${id}");
    var sliderImageElements = Array.prototype.slice.call(imageSliderRootElement.querySelector(".q-imageslider-images").children);
    // Construct picture element on client side if not already done on server-side
    if(sliderImageElements.length === 0) {
      loadImages(imageSliderRootElement, false);
    } else {
      addClickEventListeners(imageSliderRootElement);
    }
  };
  ${id}_initImageslider();`;

  const multipleImagesScript = `
  function ${id}_initImageslider() {
    document._${id}_item = ${JSON.stringify(item)};
    ${showOrHideCaptionFunction}
    ${setCaptionFunction}
    ${showSliderImageFunction}
    ${hideSliderImageFunction}
    ${enableSliderButtonFunction}
    ${disableSliderButtonFunction}
    ${fireTrackingEventFunction}
    ${trackImageSwitchFunction}
    ${addClickEventListenersMultipleFunction}
    ${loadImagesFunction}

    var imageSliderRootElement = document.querySelector("#${id}");
    var sliderImageElements = Array.prototype.slice.call(imageSliderRootElement.querySelector(".q-imageslider-images").children);
    // Construct picture element on client side if not already done on server-side
    if(sliderImageElements.length === 0) {
      loadImages(imageSliderRootElement, true);
    } else {
      addClickEventListenersMultiple(imageSliderRootElement);
    }
  }
  ${id}_initImageslider();`;

  return item.images.length > 2 ? multipleImagesScript : twoImagesScript;
}

module.exports = {
  getScript: getScript,
};
