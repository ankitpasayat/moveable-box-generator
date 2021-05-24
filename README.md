# moveable-box-generator.herokuapp.com

An app to generate new boxes and move those boxes using your keyboard keys.

[Live Demo](https://moveable-box-generator.herokuapp.com)

- Expected outcome and steps involved:
  - User gets to see a button to add a new box in the window. On clicking the button, a box is created with a unique number ID. Boxes are of fixed width and height.
  - Higher id boxes will have a higher z-index.
  - Users can add multiple boxes.
  - To select a box, click on it. Highlight the selected box.
  - Use W-A-S-D or arrow keys on the keyboard to move the selected box.
  - Use the ‘delete’ key on the keyboard to remove the selected box.
  - A button to toggle keyboard control. (\*no listener should be open when this button status is off).
- Bonus Task:
  - Create a hardcoded custom rectangular fence and ensure all the boxes stay within the fence during movement
  - Optimise the UI and modularize your code.

npm version 6.14.8 is used in this project. You can upgrade to the latest version of npm using: `npm install -g npm@latest`.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.2.0.

## Install node modules

Alternatively, you can clone (or fork & clone) this repo and run `npm install` inside root directory for installing dev dependencies.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

If terminal cannot resolve `ng`, install angualar/cli globally using: `npm install -g @angular/cli` and add to path.
