(function () {
  const { unzipSync, zipSync } = fflate;
  const downloadElementText = "Download directory";
  const downloadELementFetchingText = "Downloading...";
  const html = document.documentElement;
  const colorMode = html.getAttribute("data-color-mode");
  const lightTheme = html.getAttribute("data-light-theme");
  const darkTheme = html.getAttribute("data-dark-theme");
  const classTheme = {
    light: {
      light: "itAoNO",
      light_high_contrast: "IHKDc",
      light_colorblind: "esmSWX",
      light_tritanopia: "esmSWX",
    },
    dark: {
      dark: "bCWJNG",
      dark_high_contrast: "faAMPl",
      dark_colorblind: "dqXGJn",
      dark_tritanopia: "dqXGJn",
      dark_dimmed: "hViPfw",
    },
  };

  const getFilesFromRepoZip = async function (repoUrl) {
    const parseUrlPathName = (urlPathname) => {
      const parts = urlPathname.split("/");
      return {
        owner: parts[1],
        repo: parts[2],
        tree: parts[4],
        lastPart: parts.at(-1),
        path: parts.slice(5).join("/"),
      };
    };

    const getFilteredFiles = function (
      unzipData,
      path,
      directoryForCollectionName,
    ) {
      const filteredFiles = {};
      for (const [filePath, fileContent] of Object.entries(unzipData)) {
        if (filePath.startsWith(path)) {
          const newPath = filePath.slice(path.length);
          if (newPath) {
            filteredFiles[
              directoryForCollectionName
                ? `${directoryForCollectionName}${newPath}`
                : newPath
            ] = fileContent;
          }
        }
      }
      return filteredFiles;
    };

    const urlObj = parseUrlPathName(new URL(repoUrl).pathname);
    const zipDownloadRef = `https://github.com/${urlObj.owner}/${urlObj.repo}/archive/refs/heads/${urlObj.tree}.zip`;

    disableDownloadElement(true);

    chrome.runtime.sendMessage(
      { action: "fetchZip", url: zipDownloadRef },
      (responce) => {
        if (responce.success) {
          const zipData = new Uint8Array(responce.data);
          const unzipped = unzipSync(zipData);
          const targetPath = `${urlObj.repo}-${urlObj.tree}/${urlObj.path}`;
          const filteredData = getFilteredFiles(
            unzipped,
            targetPath,
            urlObj.lastPart,
          );
          const newZip = zipSync(filteredData);
          const blob = new Blob([newZip], { type: "application/zip" });
          const downloadNewZipUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadNewZipUrl;
          a.download = `${urlObj.lastPart}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadNewZipUrl);
        } else {
          throw new Error(`Download error: "${responce.error}"`);
        }

        disableDownloadElement(false);
      },
    );
  };

  const clickDownloadHandler = async function () {
    getFilesFromRepoZip(window.location.href);
  };

  const createDownloadElement = (divider, clickHandler) => {
    let fragment = document.createDocumentFragment();
    let newDivider = divider.cloneNode(false);
    let downloadLi = document.createElement("li");
    let downloadElement = document.createElement("a");
    let downloadDiv = document.createElement("div");
    fragment.append(newDivider);

    downloadLi.classList = [
      "Item__LiBox-sc-yeql7o-0",
      classTheme[colorMode][colorMode === "light" ? lightTheme : darkTheme],
      "download_element",
    ].join(" ");
    downloadLi.role = "menuitem";
    downloadLi.style.setProperty("list-style-type", "none");

    downloadElement.classList = [
      "Box-sc-g0xbh4-0",
      "cQdyWD",
      "prc-Link-Link-85e08",
    ].join(" ");
    downloadElement.tabIndex = "1";
    downloadElement.role = "menuitem";
    downloadElement.sx = "[object Object]";

    downloadLi.append(downloadElement);

    downloadDiv.textContent = downloadElementText;
    downloadDiv.classList = ["Box-sc-g0xbh4-0", "fFwzwX"].join(" ");

    downloadElement.append(downloadDiv);

    fragment.append(downloadLi);

    divider.parentNode.insertBefore(fragment, divider);

    downloadLi.addEventListener("click", clickHandler);

    downloadLi.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (e.target.role !== "none") {
          clickHandler(e);
        }
      }
    });
  };

  const disableDownloadElement = (bool) => {
    const el = document.querySelector("li.download_element");
    if (el) {
      const a_el = el.children[0];
      const div_el = a_el.children[0];
      if (bool) {
        el.setAttribute("aria-disabled", "true");
        a_el.blur();
        a_el.role = "none";
        el.style.pointerEvents = "none";
        el.style.cursor = "not-allowed";
        el.style.color = "grey";
        div_el.textContent = downloadELementFetchingText;
      } else {
        el.removeAttribute("aria-disabled");
        el.style.pointerEvents = "";
        a_el.role = "menuitem";
        el.style.cursor = "";
        el.style.color = "";
        div_el.textContent = downloadElementText;
      }
    }
  };

  const isDownloadElementExist = () => {
    return !!document.querySelector("li.download_element");
  };

  const handleBodyMutation = function (mutationList, observer) {
    for (let mutation of mutationList) {
      if (mutation.type === "childList") {
        let portalDiv = document.getElementById("__primerPortalRoot__");
        if (portalDiv) {
          handlePortalMutation(portalDiv)();
          let portalObserver = new MutationObserver(
            handlePortalMutation(portalDiv),
          );
          portalObserver.observe(portalDiv, { childList: true });
          observer.disconnect();
          break;
        }
      }
    }
  };

  const handlePortalMutation = function (targetElement) {
    return function () {
      let a_ul = targetElement.querySelector("ul");
      if (!a_ul) return;

      let a_li_d = a_ul.querySelector(
        'li[data-component="ActionList.Divider"]',
      );
      if (!a_li_d) return;
      let isFile = document.querySelector("div.react-code-size-details-banner");

      if (!isDownloadElementExist() && !isFile) {
        createDownloadElement(a_li_d, clickDownloadHandler);
      }
    };
  };

  let observer = new MutationObserver(handleBodyMutation);

  observer.observe(document.body, { childList: true });
})();
