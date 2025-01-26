(function () {
  const createSearchElement = (targetEl) => {
    let fragment = document.createDocumentFragment();
    let searchBox = document.createElement("div");
    let searchInput = document.createElement("input");
    let clearBtn = document.createElement("button");

    searchBox.style.width = "auto";
    searchBox.style.margin = "10px 10px";
    searchBox.classList = [
      "Layout-sc-1xcs6mc-0",
      "hRzxkQ",
      "tw-combo-input",
    ].join(" ");

    searchInput.type = "text";
    searchInput.style.width = "80%";
    searchInput.classList = [
      "ScInputBase-sc-vu7u7d-0",
      "ScInput-sc-19xfhag-0",
      "gNGlOQ",
      "dPoukZ",
      "InjectLayout-sc-1i43xsx-0",
      "eRDdjS",
      "tw-input",
      "tw-input--large",
    ].join(" ");

    clearBtn.style.width = "25px";
    clearBtn.textContent = "X";
    clearBtn.classList = [
      "ScCoreButton-sc-ocjdkq-0",
      "gFUsAR",
      "tw-combo-input__button-icon",
      "tw-combo-input__button-icon--large",
    ].join(" ");

    searchBox.append(searchInput);
    searchBox.append(clearBtn);

    fragment.append(searchBox);

    if (targetEl) {
      targetEl.prepend(fragment);
    }

    const handleSearchInputKeyUp = function (e) {
      let channels = targetEl.children;
      for (let i = 1; i < channels.length; i++) {
        let name = channels[i].querySelector(
          "div.side-nav-card__title > p",
        ).innerText;
        if (name.toLowerCase().includes(e.target.value.toLowerCase())) {
          channels[i].style.display = "block";
        } else {
          channels[i].style.display = "none";
        }
      }
    };

    const handleClearBtnClick = function (e) {
      let input = e.target.previousElementSibling;
      input.value = "";
      input.dispatchEvent(
        new KeyboardEvent("keyup", {
          key: "",
          bubbles: true,
          cancelable: true,
        }),
      );
    };

    searchInput.addEventListener("keyup", handleSearchInputKeyUp);
    clearBtn.addEventListener("click", handleClearBtnClick);
  };
  const navMutationHandler = function (targetEl) {
    return function (mutationList, observer) {
      for (let mutation of mutationList) {
        if (mutation.type === "childList") {
          let btnShowMore = targetEl.querySelector(
            'button[data-test-selector="ShowMore"]',
          );
          let followGroupEl = targetEl
            .querySelector("div.side-nav-section")
            .querySelector("div.tw-transition-group");
          if (followGroupEl && !btnShowMore) {
            createSearchElement(followGroupEl);
            observer.disconnect();
            break;
          }
          if (btnShowMore) {
            btnShowMore.click();
          }
        }
      }
    };
  };
  const bodyMutationHandler = function (mutationList, observer) {
    for (let mutation of mutationList) {
      if (mutation.type === "childList") {
        let el = document.querySelector("nav#side-nav");
        if (el) {
          let navObserver = new MutationObserver(navMutationHandler(el));
          navObserver.observe(el, { childList: true, subtree: true });
          observer.disconnect();
          break;
        }
      }
    }
  };

  let bodyObserver = new MutationObserver(bodyMutationHandler);
  bodyObserver.observe(document.body, { childList: true, subtree: true });
})();
