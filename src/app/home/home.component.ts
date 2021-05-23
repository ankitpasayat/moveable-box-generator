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
  private usedIDs = [];
  listenerStatus: string = 'OFF';
  errorMsg: string = '';

  private boxes = [];

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.toggleListeners();
    this.ctx = this.canvas.nativeElement.getContext('2d');
    // Will redraw canvas every 20ms
    setInterval(() => {
      // Sorting by z-index.
      this.boxes.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1));
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
    // Calls funciton to set unique id which will be used as the z-index.
    this.setZIndex();
  }

  /*  Generates a random number between 1 to 99 (both inclusive).
  Assures the same random number is not the z-index for another box. 
  Stores the random number in a usedIDs array. */
  setZIndex() {
    while (true) {
      let randomNumber = Math.trunc(Math.random() * 100);
      if (!this.usedIDs.includes(randomNumber) && randomNumber > 0) {
        this.boxes[this.boxes.length - 1].zIndex = randomNumber;
        this.usedIDs.push(randomNumber);
        break;
      }
    }
  }

  // Remove highlighted box object from array of objects.
  deleteThisBox() {
    if (this.current && this.current != '') {
      this.errorMsg = '';
      for (let box in this.boxes) {
        if (this.current == box) {
          this.boxes.splice(this.boxes.indexOf(this.current), 1);
          break;
        }
      }
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

  // MouseClick Events for highlighting selected box.
  handleMouseEvents(e: MouseEvent) {
    // Difference in relative pointer position (canvas to webpage)
    let diff_x = e.pageX - e.offsetX;
    let diff_y = e.pageY - e.offsetY;

    this.pos_x = e.offsetX;
    this.pos_y = e.offsetY;
    // Getting mouse click offset and comparing to box (x, y) : (DEFAULTS.sideLength, DEFAULTS.sideLength).
    if (
      this.boxes &&
      // Should be 30 taking into account canvas padding.
      diff_x == 30 &&
      diff_y == 30
    ) {
      this.getSelectedBox(this.pos_x, this.pos_y);
    }
  }
}
