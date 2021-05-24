import {
  Component,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BoxComponent } from '../lib/box/box.component';
import { DEFAULTS, COLORS } from './home.constants';

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  keyboardListener: Function;
  mouseListener: Function;

  // (x, y) position with respect to the 'canvas/fence.'
  private pos_x: number;
  private pos_y: number;

  private ctx: CanvasRenderingContext2D;
  private current: any;
  private lastUsed: number = 0;
  listenerStatus: string = 'OFF';
  errorMsg: string = '';

  private boxes = [];

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.toggleListeners();
    this.ctx = this.canvas.nativeElement.getContext('2d');
    // Will redraw canvas every 20ms
    setInterval(() => {
      this.reDraw();
    }, 20);
  }

  // Unsubscribe event listeners on destroy.
  ngOnDestroy(): void {
    this.keyboardListener();
    this.mouseListener();
  }

  // Toggle event listeners on button click.
  toggleListeners() {
    if (this.listenerStatus == 'OFF') {
      this.listenerStatus = 'ON';
      this.keyboardListener = this.renderer.listen(
        'document',
        'keydown',
        (event) => this.handleKeyboardEvents(event)
      );
      this.mouseListener = this.renderer.listen(
        'document',
        'mousedown',
        (event) => this.handleMouseEvents(event)
      );
    } else {
      this.listenerStatus = 'OFF';
      this.keyboardListener();
      this.mouseListener();
    }
  }

  // Creates a new BoxComponent object, initializes it and adds it the boxes array.
  addNewBox() {
    let newBox = new BoxComponent();
    newBox.init(0, 0, COLORS.defColor, DEFAULTS.sideLength, this.ctx);
    this.boxes.push(newBox);
    // Calls funciton to set unique id, to be used as the z-index.
    this.setZIndex();
  }

  /*  Generates a number which is the last used number +1.
  This assures the same number is not the z-index for another box. 
  Stores the generated number as the last used number. */
  setZIndex() {
    let generatedNumber = this.lastUsed + 1;
    this.boxes[this.boxes.length - 1].zIndex = generatedNumber;
    this.lastUsed = generatedNumber;
  }

  // Remove highlighted box object from array of objects.
  deleteThisBox() {
    if (this.current && this.current != '') {
      this.errorMsg = '';
      // Generates new array of box objects where the selected box isn't present.
      this.boxes = this.boxes.filter((box) => {
        return box.color !== COLORS.highlightedColor;
      });
      this.current = '';
    } else {
      this.errorMsg = 'Please select a box first!';
    }
  }

  // Clear canvas and update box postions.
  reDraw() {
    if (this.boxes) {
      this.clearCanvas();
      for (let box in this.boxes) {
        this.boxes[box].update();
      }
    } else {
      // If array of box objects is empty redraw empty canvas.
      this.clearCanvas();
    }
  }

  // Clear HTML canvas element.
  clearCanvas() {
    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
  }

  /* Box movements with the 'canvas/fence' and 'cube/box' (Optional) mechanic in mind.
  Logic: Ensuring that the edge of the highlighted box in the direction of motion (i.e. WASD) 
  moving moveSpeed units per key press dosen't extend the canvas boundary. */
  move(direction) {
    // If a box is highlighted then true.
    if (this.current && this.current != '') {
      // Reset error message.
      this.errorMsg = '';
      switch (direction) {
        case 'up':
          this.boxes[this.current].y =
            this.boxes[this.current].y - DEFAULTS.moveSpeed >= 0
              ? this.boxes[this.current].y - DEFAULTS.moveSpeed
              : 0;
          break;
        case 'left':
          this.boxes[this.current].x =
            this.boxes[this.current].x - DEFAULTS.moveSpeed >= 0
              ? this.boxes[this.current].x - DEFAULTS.moveSpeed
              : 0;
          break;
        case 'down':
          // To account for height of each individual box.
          this.boxes[this.current].y =
            this.boxes[this.current].y + DEFAULTS.moveSpeed <=
            this.canvas.nativeElement.height - DEFAULTS.sideLength
              ? this.boxes[this.current].y + DEFAULTS.moveSpeed
              : this.canvas.nativeElement.height - DEFAULTS.sideLength;
          break;
        case 'right':
          // To account for width of each individual box.
          this.boxes[this.current].x =
            this.boxes[this.current].x + DEFAULTS.moveSpeed <=
            this.canvas.nativeElement.width - DEFAULTS.sideLength
              ? this.boxes[this.current].x + DEFAULTS.moveSpeed
              : this.canvas.nativeElement.width - DEFAULTS.sideLength;
          break;
        default:
          break;
      }
    } else {
      // if no box is highlighted then display a hint.
      this.errorMsg = 'Please select a box first!';
    }
  }

  // Since the array of box objects is sorted by z-index key, getting the last matching box incase of overlap.
  getSelectedBox(x, y) {
    for (let box in this.boxes) {
      if (
        x - this.boxes[box].x >= 0 &&
        x - this.boxes[box].x <= DEFAULTS.sideLength &&
        y - this.boxes[box].y >= 0 &&
        y - this.boxes[box].y <= DEFAULTS.sideLength
      ) {
        this.current = box;
      }
    }
    for (let box in this.boxes) {
      if (this.current == box) {
        this.boxes[box].color = COLORS.highlightedColor;
      } else {
        this.boxes[box].color = COLORS.defColor;
      }
    }
  }

  // Keyboard Events for movement and deletion.
  handleKeyboardEvents(e: KeyboardEvent) {
    if (e.key == 'ArrowUp' || e.key == 'w') {
      this.move('up');
    } else if (e.key == 'ArrowLeft' || e.key == 'a') {
      this.move('left');
    } else if (e.key == 'ArrowDown' || e.key == 's') {
      this.move('down');
    } else if (e.key == 'ArrowRight' || e.key == 'd') {
      this.move('right');
    } else if (e.key == 'Delete') {
      this.deleteThisBox();
    }
  }

  /*   MouseClick Events for highlighting selected box.
  Creates an object with x and y defined,
  set to the mouse position relative to the canvas.
  Takes an event */
  handleMouseEvents(e: MouseEvent) {
    let element = this.canvas.nativeElement,
      offsetX = 0,
      offsetY = 0;

    // Get Padding and Border for 'canvas.'
    let stylePaddingLeft =
      parseInt(
        document.defaultView.getComputedStyle(element, null)['paddingLeft'],
        10
      ) || 0;
    let stylePaddingTop =
      parseInt(
        document.defaultView.getComputedStyle(element, null)['paddingTop'],
        10
      ) || 0;
    let styleBorderLeft =
      parseInt(
        document.defaultView.getComputedStyle(element, null)['borderLeftWidth'],
        10
      ) || 0;
    let styleBorderTop =
      parseInt(
        document.defaultView.getComputedStyle(element, null)['borderTopWidth'],
        10
      ) || 0;

    // Compute the total offset.
    if (element.offsetParent !== undefined) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while (element == element.offsetParent);
    }

    /*     Add padding and border style widths to offset.
    This part is not strictly necessary, it depends on your styling. */
    offsetX += stylePaddingLeft + styleBorderLeft;
    offsetY += stylePaddingTop + styleBorderTop;

    // Difference in relative pointer position (canvas to webpage).
    this.pos_x = e.pageX - offsetX;
    this.pos_y = e.pageY - offsetY;

    if (this.boxes) {
      this.getSelectedBox(this.pos_x, this.pos_y);
    }
  }
}
