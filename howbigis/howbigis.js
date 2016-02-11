
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

howbigis.HowBigIs = function(width, height) {
  // Data
  this.land_ = null;
  this.borgders_ = null;
  d3.json("world-110m.json", this.onLoad_.bind(this));

  // UI
  this.width_ = width;
  this.height_ = height;
  this.radius_ = this.height_ / 2 - 5;
  this.scale_ = this.radius_;

  this.projection1_ = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .scale(this.scale_)
    .clipAngle(90);

  this.projection2_ = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .scale(this.scale_)
    .clipAngle(90);

  this.canvas_ = d3.select("body").append("canvas")
    .attr("width", this.width_)
    .attr("height", this.height_);

  this.context_ = this.canvas_.node().getContext("2d");

  this.path1_ = d3.geo.path()
    .projection(this.projection1_)
    .context(this.context_);

  this.path2_ = d3.geo.path()
    .projection(this.projection2_)
    .context(this.context_);

  this.eyeTheta_ = 0.0;
  this.eyePhi_ = 0.0;

  this.lastX_ = -1;
  this.lastY_ = -1;
  
  this.canvas_.node().addEventListener("mousedown", function(event) {
    this.lastX_ = event.x - this.canvas_.node().offsetLeft;
    this.lastY_ = event.y - this.canvas_.node().offsetTop;
  }.bind(this), false);
  this.canvas_.node().addEventListener("mouseup", function(event) {
    this.lastX_ = -1;
  }.bind(this), false);
  this.canvas_.node().addEventListener("mousemove", function(event) {
    if (this.lastX_ == -1) {
      return;
    }
    var x = event.x - this.canvas_.node().offsetLeft;
    var y = event.y - this.canvas_.node().offsetTop;
    this.eyePhi_ += 0.1 * Math.PI * (x - this.lastX_) / 180.0;
    this.eyeTheta_ += 0.1 * Math.PI * (y - this.lastY_) / 180.0;
    if (this.eyePhi_ < -Math.PI) {
      this.eyePhi_ += 2 * Math.PI;
    }
    if (this.eyePhi_ > Math.PI) {
      this.eyePhi_ -= 2 * Math.PI;
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
    this.context_.strokeStyle=stroke;
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
  var yaw = 180.0 / Math.PI * this.eyePhi_;
  var pitch = - 180.0 / Math.PI * this.eyeTheta_;
  var roll = 0.0;
  
  //land
  this.projection1_.rotate([yaw, pitch, roll]);
  //projection2.rotate([0, 0]);
  this.drawPath_(this.path1_, "rgba(200,50,50,0.5)", "rgba(70,0,0,0.5)");
  this.drawPath_(this.path2_, "rgba(50,50,200,0.5)", null);

  // sphere contours
  this.context_.beginPath();
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
