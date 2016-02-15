
var howbigis = {};



howbigis.dot = function(a, b) {
  return a[0] * b[0] + a[1] + b[1] + a[2] + b[2];
}

howbigis.cross = function(a, b) {
  return [
      a[1] * b[2] - a[2] * b[1],
    - a[0] * b[2] + a[2] * b[0],
      a[0] * b[1] - a[1] * b[0]
  ];
}

howbigis.HowBigIs = function(canvasId,
                             layer1BtnId, layer2BtnId,
                             borders1BtnId, borders2BtnId) {
  // Data
  this.land_ = null;
  this.borgders_ = null;
  d3.json("world-110m.json", this.onLoad_.bind(this));

  // UI
  this.canvas_ = d3.select("#" + canvasId);
  this.layer1Btn_ = d3.select("#" + layer1BtnId).node();
  this.layer2Btn_ = d3.select("#" + layer2BtnId).node();
  this.borders1Btn_ = d3.select("#" + borders1BtnId).node();
  this.borders2Btn_ = d3.select("#" + borders2BtnId).node();
  // Make the canvas fill the width and then make it square.
  this.canvas_.node().style.width='100%';
  this.canvas_.node().style.height='100%';
  this.canvas_.node().width  = this.canvas_.node().offsetWidth;
  this.canvas_.node().height = this.canvas_.node().width;

  this.width_ = this.canvas_.node().getBoundingClientRect().width;
  this.height_ = this.canvas_.node().getBoundingClientRect().height;
  this.radius_ = this.height_ / 2 - 5;
  this.scale_ = this.radius_;

  this.projection1_ = d3.geo.orthographic()
    .translate([this.width_ / 2, this.height_ / 2])
    .scale(this.scale_)
    .clipAngle(90);

  this.projection2_ = d3.geo.orthographic()
    .translate([this.width_ / 2, this.height_ / 2])
    .scale(this.scale_)
    .clipAngle(90);

  this.context_ = this.canvas_.node().getContext("2d");

  this.path1_ = d3.geo.path()
    .projection(this.projection1_)
    .context(this.context_);

  this.path2_ = d3.geo.path()
    .projection(this.projection2_)
    .context(this.context_);

  this.showBorders1_ = true;
  this.showBorders2_ = false;

  this.eyeTheta1_ = 0.0;
  this.eyePhi1_ = 0.0;
  this.eyeTheta2_ = 0.0;
  this.eyePhi2_ = 0.0;

  this.lastX_ = -1;
  this.lastY_ = -1;

  this.movingLayer1_ = true;
  this.layer1Btn_.addEventListener("click", function(event) {
    this.movingLayer1_ = true;
  }.bind(this), false);
  this.layer2Btn_.addEventListener("click", function(event) {
    this.movingLayer1_ = false;
  }.bind(this), false);
  this.borders1Btn_.addEventListener("change", function(event) {
    this.showBorders1_ = this.borders1Btn_.checked;
    this.draw_();
  }.bind(this), false);
  this.borders2Btn_.addEventListener("change", function(event) {
    this.showBorders2_ = this.borders2Btn_.checked;
    this.draw_();
  }.bind(this), false);

  this.canvas_.node().addEventListener("mousedown", function(event) {
    this.lastX_ = event.x - this.canvas_.node().offsetLeft;
    this.lastY_ = event.y - this.canvas_.node().offsetTop;
  }.bind(this), false);
  this.canvas_.node().addEventListener("mouseup", function(event) {
    this.lastX_ = -1;
    this.draw_();
  }.bind(this), false);
  var hasTouch = "ontouchstart" in window;
  this.canvas_.node().addEventListener(hasTouch ? "touchmove" : "mousemove", function(event) {
    if (this.lastX_ == -1) {
      return;
    }
    var x = event.x - this.canvas_.node().offsetLeft;
    var y = event.y - this.canvas_.node().offsetTop;
    if (this.movingLayer1_) {
      this.eyePhi1_ += 0.1 * Math.PI * (x - this.lastX_) / 180.0;
      this.eyeTheta1_ += 0.1 * Math.PI * (y - this.lastY_) / 180.0;
      if (this.eyePhi1_ < -Math.PI) {
        this.eyePhi1_ += 2 * Math.PI;
      }
      if (this.eyePhi1_ > Math.PI) {
        this.eyePhi1_ -= 2 * Math.PI;
      }
    } else {
      this.eyePhi2_ += 0.1 * Math.PI * (x - this.lastX_) / 180.0;
      this.eyeTheta2_ += 0.1 * Math.PI * (y - this.lastY_) / 180.0;
      if (this.eyePhi2_ < -Math.PI) {
        this.eyePhi2_ += 2 * Math.PI;
      }
      if (this.eyePhi2_ > Math.PI) {
        this.eyePhi2_ -= 2 * Math.PI;
      }
    }

    this.lastX_ = x;
    this.lastY_ = y;
    this.draw_();
  }.bind(this), false);
}

howbigis.HowBigIs.prototype.drawPath_ = function(path, fill, stroke) {
  this.context_.beginPath();
  this.context_.fillStyle=fill;
  path(this.land_);
  this.context_.fill();
  if (stroke) {
    this.context_.beginPath();
    this.context_.lineWidth = 1.0;
    this.context_.strokeStyle = stroke;
    path(this.borders_);
    this.context_.stroke();
  }
}

howbigis.HowBigIs.prototype.draw_ = function() {
  if (!this.borders_) {
    // Not yet loaded.
    return;
  }
  this.context_.clearRect(0, 0, this.width_, this.height_);

  /*
  var start = [
    Math.cos(eyePhi) * Math.cos(eyeTheta),
    Math.sin(eyePhi) * Math.cos(eyeTheta),
    Math.sin(eyeTheta)
  ];
  var dest = [1, 0, 0];

  var cosT = dot(start, dest);
  console.debug('cosT');
  console.debug(cosT);
  if (cosT < -0.999) {
  }
  // TODO: small cosT:
  var s = Math.sqrt(2*(1+cosT));
  var rot = cross(start, dest);
  var q0 = 2 * s;
  var q1 = rot[0] / s;
  var q2 = rot[1] / s;
  var q3 = rot[2] / s;
  console.debug('quat:');
  console.debug(q0);
  console.debug(q1);
  console.debug(q2);
  console.debug(q3);

  var roll = 180.0 / Math.PI * Math.atan2(2*(q0*q1 + q2*q3), 1 - 2 * (q1*q1+q2*q2));
  var pitch = - 180.0 / Math.PI * Math.asin(2*(q0*q2-q3*q1));
  var yaw = - 180.0 / Math.PI * Math.atan2(2*(q0*q3+q1*q2),1-2*(q2*q2+q3*q3));
  console.debug('ypr:');
  console.debug(yaw);
  console.debug(pitch);
  console.debug(roll);
  */
  var yaw1 = 180.0 / Math.PI * this.eyePhi1_;
  var pitch1 = - 180.0 / Math.PI * this.eyeTheta1_;
  var roll1 = 0.0;
  var yaw2 = 180.0 / Math.PI * this.eyePhi2_;
  var pitch2 = - 180.0 / Math.PI * this.eyeTheta2_;
  var roll2 = 0.0;
  
  //land
  this.projection1_.rotate([yaw1, pitch1, roll1]);
  this.projection2_.rotate([yaw2, pitch2, roll2]);
  //projection2.rotate([0, 0]);
  this.drawPath_(this.path1_, "rgba(255,50,50,0.5)", this.showBorders1_ ? "rgba(255,255,255,1.0)" : null);
  this.drawPath_(this.path2_, "rgba(50,50,200,0.5)", this.showBorders2_ ? "rgba(0,0,0,0.5)" : null);

  // sphere contours
  this.context_.beginPath();
  this.context_.strokeStyle = "rgba(0,0,0,1.0)";
  this.context_.arc(this.width_ / 2, this.height_ / 2, this.radius_, 0, 2 * Math.PI, true);
  this.context_.lineWidth = 2.5;
  this.context_.stroke();
}

howbigis.HowBigIs.prototype.onLoad_ = function(error, world) {
  if (error) throw error;
  this.land_ = topojson.feature(world, world.objects.land);
  this.borders_ = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; });
  this.draw_();
}


//d3.select(self.frameElement).style("height", height + "px");
