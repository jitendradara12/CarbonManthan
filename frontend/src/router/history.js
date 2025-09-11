const historyStack = [];
let currentIndex = -1;
let isNavigating = false;

export const history = {
  push(path) {
    if (isNavigating) return;
    // If we are in the middle of the stack, new path truncates the "forward" history
    if (currentIndex < historyStack.length - 1) {
      historyStack.splice(currentIndex + 1);
    }
    historyStack.push(path);
    currentIndex++;
    this.updateButtons();
  },

  back() {
    if (this.canGoBack()) {
      isNavigating = true;
      currentIndex--;
      window.location.hash = historyStack[currentIndex];
      this.updateButtons();
      isNavigating = false;
    }
  },

  forward() {
    if (this.canGoForward()) {
      isNavigating = true;
      currentIndex++;
      window.location.hash = historyStack[currentIndex];
      this.updateButtons();
      isNavigating = false;
    }
  },

  canGoBack() {
    return currentIndex > 0;
  },

  canGoForward() {
    return currentIndex < historyStack.length - 1;
  },

  updateButtons() {
    const backBtn = document.getElementById('nav-back');
    const fwdBtn = document.getElementById('nav-forward');
    if (backBtn) backBtn.disabled = !this.canGoBack();
    if (fwdBtn) fwdBtn.disabled = !this.canGoForward();
  },

  handleHashChange() {
    const newPath = window.location.hash;
    // Only push to history if it's not a result of back/forward navigation
    if (!isNavigating && (historyStack.length === 0 || historyStack[currentIndex] !== newPath)) {
        this.push(newPath);
    }
  }
};
