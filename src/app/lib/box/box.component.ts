import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss'],
})
export class BoxComponent implements OnInit {
  private x: number;
  private y: number;
  private zIndex: number;
  private color: string;
  private side: number;
  private ctx: CanvasRenderingContext2D;

  constructor() {}

  ngOnInit() {}

  init(
    x: number,
    y: number,
    color: string,
    side: number,
    ctx: CanvasRenderingContext2D
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.side = side;
    this.ctx = ctx;
  }

  // Draw a box at a position (x, y) with respect to the canvas context (ctx).
  update() {
    let fontSize = this.side / 4 + 'pt sans-serif';
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.side, this.side);
    this.ctx.fillStyle = 'white';
    this.ctx.font = fontSize;
    this.ctx.fillText(
      this.zIndex.toString(),
      this.x + this.side / 3.5,
      this.y + this.side / 1.7
    );
  }
}
