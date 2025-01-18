(function test() {
  "use strict";
  let navigateEnabled = false;
  let mobileW = 768;

  const getLastElement = (nodeList) => {
    return [...nodeList].at(-1);
  };

  const getElementsByDataAttribute = (attribute, value, elem = "") => {
    return document.querySelectorAll(`${elem}[data-${attribute}="${value}"]`);
  };

  document.addEventListener("keydown", function (e) {
    if (document.documentElement.clientWidth <= mobileW) {
      let el = document.querySelector('div[data-virtualkeyboard="true"]');
      if (document.activeElement === el) {
        if (e.key === "Enter") {
          e.preventDefault();
          let btn = getElementsByDataAttribute("testid", "send-button")[0];
          if (btn) {
            btn.click();
          }
        }
      }
    }

    if ((e.key === "PageUp") | (e.key === "PageDown")) {
      if (!navigateEnabled) {
        e.preventDefault();
        let el = getLastElement(
          getElementsByDataAttribute("testid", "copy-turn-action-button"),
        );
        if (el) {
          el.focus();
          el.addEventListener("blur", () => {
            navigateEnabled = false;
          });
          navigateEnabled = true;
        }
      }
    }
  });
})();
