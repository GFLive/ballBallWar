class Vector2D {
  constructor (x = 1, y = 0) {
    this.x = x
    this.y = y
  }

  static getLength () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  static setLength (len) {
    let angle = this.getAngle()
    this.x = len * Math.cos(angle)
    this.y = len * Math.sin(angle)
  }

  static getAngle () {
    return Math.atan2(this.y, this.x)
  }

  static setAngle (angle) {
    let len = this.getLength()
    this.x = len * Math.cos(angle)
    this.y = len * Math.sin(angle)
  }

  static add (vec) {
    this.x += vec.x
    this.y += vec.y
  }

  static mul (factor) {
    this.x *= factor
    this.y *= factor
  }

  static div (factor) {
    this.x /= factor
    this.y /= factor
  }
}