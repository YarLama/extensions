importScripts("./utils/fflate.mjs");

chrome.runtime.onMessage.addListener((message, sender, sendResponce) => {
  if (message.action === "fetchZip") {
    fetch(message.url)
      .then((responce) => {
        if (!responce.ok) {
          throw new Error(`Error fetching: ${responce.status}`);
        }
        return responce.arrayBuffer();
      })
      .then((data) => {
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

        const unzipped = fflate.unzipSync(new Uint8Array(data));
        const targetPath = `${message.parsingUrlObject.repo}-${message.parsingUrlObject.tree}/${message.parsingUrlObject.path}`;
        const filteredData = getFilteredFiles(
          unzipped,
          targetPath,
          message.parsingUrlObject.lastPart,
        );
        const newZip = fflate.zipSync(filteredData);
        sendResponce({ success: true, data: Array.from(newZip) });
      })
      .catch((e) => {
        sendResponce({ success: false, error: e.message });
      });
    return true;
  }
});
