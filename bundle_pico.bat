@echo off
(
browserify -r ./Pico.js:Pico -o picognizer_browser.js
)
pause
