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
        sendResponce({ success: true, data: Array.from(new Uint8Array(data)) });
      })
      .catch((e) => {
        sendResponce({ success: false, error: e.message });
      });
    return true;
  }
});
