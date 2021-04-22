
var wt = {};

wt.TRAY_MARGIN_PX_ = -840;
wt.TRAY_INCREMENT_PX_ = 96;

wt.Page = function(solution) {
  this.solution_ = solution.reverse();
  this.current_state_ = 0;
  this.bottles_ = document.getElementsByClassName("bottle");
  this.marbles_ = document.getElementsByClassName("marble");
  this.tray_ = document.getElementById("tray");
  
  this.loadState_();
  
  document.addEventListener('keydown', event => {
      if (event.key === "ArrowLeft") {
        this.prev_();
      } else if (event.key === "ArrowRight") {
        this.next_();
      }
    });
  
  document.addEventListener('click', event => { this.next_(); });
  
  var lastTouchStartX = 0.0;
  document.addEventListener("touchstart", event => {
    evt.preventDefault();
    lastTouchStartX = evt.changedTouches[0].pageX;
  });
  document.addEventListener("touchend", event => {
    evt.preventDefault();
    if (evt.changedTouches[0].pageX > lastTouchStartX) {
      this.prev_();
    } else {
      this.next_();
    }
  });
}

wt.Page.prototype.loadState_ = function() {
    const state = this.solution_[this.current_state_];
    for (var i = 0; i < state.bottles.length; ++i) {
        this.bottles_[i].classList.remove("top", "middle", "bottom");
        this.bottles_[i].classList.add(state.bottles[i].toLowerCase());
    }
    for (var i = 0; i < state.marbles.length; ++i) {
        this.marbles_[i].classList.remove("topleft", "bottomleft", "bottomright");
        this.marbles_[i].classList.add(state.marbles[i].toLowerCase());
    }
    this.tray_.style.marginLeft = (wt.TRAY_MARGIN_PX_ + wt.TRAY_INCREMENT_PX_ * state.tray_offset) + "px";
}

wt.Page.prototype.next_ = function() {
  if (this.current_state_ < this.solution_.length - 1) {
    ++this.current_state_;
  }
  this.loadState_();
}

wt.Page.prototype.prev_ = function() {
  if (this.current_state_ > 0) {
    --this.current_state_;
  }
  this.loadState_();
}

function main() {
  new wt.Page(solution);
}
