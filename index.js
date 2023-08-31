// Initialize Variables
let fidget_spinner = document.getElementById('fidget-spinner')
let initialX, initialY, initialAngle
let movement, speed, acceleration
let getSpeed
let speedDirection
let totalDegrees = 0

// Get angle between two lines (used for getting angle between line in initial rotation and line when rotating)
function angleBetweenLines (x0Offset, y0Offset, x1Offset, y1Offset) {
  let angle = Math.atan2(x0Offset * y1Offset - y0Offset * x1Offset, x0Offset * x1Offset + y0Offset * y1Offset)
  return angle*(180/Math.PI)
}

// Get angle from matrix (used for getting rotation value of fidget-spinner)
function angleFromElement(elem) {
  let angle = parseFloat(elem.style.transform.replace(/[a-z()]/gi, ""))
  if (!angle) angle = 0
  return angle
}

function restrictTo2Pi(angle) {
  if (angle>180) {
    angle = -180 + (angle-180)
  } else if (angle < -180) {
    angle = 180 + (angle+180)
  }
  return angle
}

// Rotate the fidget-spinner during mouseDown
function rotateCircle(e) {
  if (e.target.id === "canvas") {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const canvas = e.target
    let bounds = canvas.getBoundingClientRect();
    let x = e.clientX - bounds.left;
    let y = e.clientY - bounds.top;
    let xOffset = x-viewportWidth/2
    let yOffset = y-viewportHeight/2
    let angleDifference = angleBetweenLines(initialX - (viewportWidth/2), initialY - (viewportHeight/2), xOffset, yOffset)

    let finalAngle = initialAngle + angleDifference

    let angleBefore = angleFromElement(fidget_spinner)
    fidget_spinner.style.transform =`rotate(${finalAngle}deg)`
    totalDegrees += Math.abs(Math.abs(restrictTo2Pi(finalAngle)) - Math.abs(restrictTo2Pi(angleBefore)))
    speedDirection = Math.round(finalAngle) - Math.round(angleBefore) >= 0 ? 1 : -1
  } 
}

let spinCircleInterval, speedDecreaseInterval

// Continuously spin the fidget-spinner on mouseUp
function spinCircle() {
  if (!!speed) {
    initialAngle = restrictTo2Pi(angleFromElement(fidget_spinner))
    let finalAngle = initialAngle
    if (initialAngle <= 180 && initialAngle >= -180) {
      finalAngle = initialAngle+speed
    } else {
      finalAngle = -initialAngle+speed
    } 
    fidget_spinner.style.transform =`rotate(${finalAngle}deg)`
    totalDegrees += Math.abs(speed)
  }
}

// Decrease speed exponentially (or idk)
function decreaseSpeed() {
  speed *= .8
}

function onMouseDown(event) {
  // Get speed of mouse
  speed = 0
  let currentEvent, prevEvent
  document.addEventListener('mousemove', function(event){
    currentEvent=event;
  })
  getSpeed = setInterval(function(){
    if(prevEvent && currentEvent){
      var movementX=currentEvent.screenX-prevEvent.screenX;
      var movementY=currentEvent.screenY-prevEvent.screenY;
      movement=Math.sqrt(movementX*movementX+movementY*movementY);
    
      speed=0.1*movement*speedDirection
    }
    
    prevEvent=currentEvent;
    prevSpeed=speed;
  }, 10);

  // Assign variables before rotateCircle
  const canvas = event.target
  let bounds = canvas.getBoundingClientRect();
  initialX = event.clientX - bounds.left;
  initialY = event.clientY - bounds.top;
  let fidget_spinner = document.getElementById('fidget-spinner')
  initialAngle = angleFromElement(fidget_spinner)
  document.addEventListener('mousemove', rotateCircle);
  
  clearInterval(spinCircleInterval)
  clearInterval(speedDecreaseInterval)
}


function onMouseUp(event) {
  document.removeEventListener('mousemove', rotateCircle);

  // Spin fidget-spinner on mouseUp
  clearInterval(getSpeed)
  spinCircleInterval = setInterval(spinCircle, 10)
  speedDecreaseInterval = setInterval(decreaseSpeed, 1000)

  initialX, initialY = 0
}

const canvas = document.getElementById('canvas')

document.addEventListener('mousedown', onMouseDown);

canvas.addEventListener('mouseenter', function(){
  document.addEventListener('mouseup', onMouseUp);
});

canvas.addEventListener('mouseleave', function(e){
  document.removeEventListener('mouseup', onMouseUp);
  // document.removeEventListener('mousemove', rotateCircle);

  clearInterval(getSpeed)
});

setInterval(function() {
  if (totalDegrees > 360) {
    const currentCounter = document.getElementById("spin-counter").innerHTML
    document.getElementById("spin-counter").innerHTML = parseInt(currentCounter) + 1
    totalDegrees = 0
  }
}, 100)

